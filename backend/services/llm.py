import json
import os
import re
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from google import genai
from google.genai import types
from models import Preferences
from logger import get_logger

log = get_logger("llm")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_INSTRUCTION = (
    "You are a knowledgeable car buying advisor for the Indian market. "
    "You help confused buyers narrow down their options with clear, honest advice. "
    "Always respond with valid JSON only — no markdown fences, no extra text."
)


def _parse(text: str) -> dict:
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())
    return json.loads(text)


def rank_and_explain(candidates: list[dict], prefs: Preferences) -> dict:
    if not candidates:
        log.warning("No candidates to rank — returning empty result")
        return {
            "cars": [],
            "summary": "No cars matched your filters. Try widening your budget or fuel type.",
            "follow_ups": ["Widen my budget range", "Show all fuel types", "Remove body type filter"],
        }

    log.info(f"Sending {len(candidates)} candidates to Gemini for ranking")

    prompt = f"""User is looking for a car with these preferences:
- Budget: ₹{prefs.budget_min:,} to ₹{prefs.budget_max:,}
- Fuel type: {', '.join(prefs.fuel_type)}
- Minimum seating: {prefs.seating}
- Body type preference: {', '.join(prefs.body_type) if prefs.body_type else 'No preference'}
- Transmission: {prefs.transmission or 'No preference'}
- Extra requirements: {prefs.extra or 'None'}

Here are {len(candidates)} cars that matched their filters:
{json.dumps(candidates, indent=2)}

Return a JSON object with exactly these keys:
- "cars": array of the top 8 best-fit cars. Each car object must include all original fields plus an "explanation" field (2 clear sentences on why this car suits this specific user's needs).
- "summary": one sentence summarising the shortlist for the user.
- "follow_ups": array of exactly 3 short, action-oriented queries written from the USER's perspective about the specific cars you recommended. These must reference actual car names from your recommendations. Good examples: "Compare [Car A] and [Car B]", "Tell me more about the [Car A]", "Which of these has the best safety rating?", "Show me the pros and cons of [Car A]". Bad examples (never generate these): "What is your budget?", "How many passengers do you need?", "What fuel type do you prefer?" — those are advisor questions, not user queries.

Rank cars by how well they match the user's stated priorities, not just mileage."""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION),
    )

    result = _parse(response.text)

    ranked = result.get("cars", [])
    log.info(f"Gemini ranked {len(ranked)} cars:")
    for i, car in enumerate(ranked, 1):
        log.info(f"  [{i}] {car.get('brand')} {car.get('model')} — {car.get('explanation', '')[:80]}...")

    log.debug(f"Follow-ups suggested: {result.get('follow_ups')}")
    return result


def answer_followup(question: str, context: str = "") -> dict:
    log.info(f"Follow-up question: {question!r}")

    prompt = f"""A user is using a car recommendation app for the Indian market and asked:
"{question}"

{f'Context from their session: {context}' if context else ''}

Answer helpfully in 2-4 sentences. Then suggest 2 short action-oriented follow-up queries the user might type next — written from the user's perspective, referencing specific cars mentioned in the context. Example: "Show pros and cons of Nexon", "Compare Nexon and Baleno on safety". Never ask clarifying questions like "What is your budget?".

Return JSON with:
- "message": your answer as a string
- "follow_ups": array of 2 follow-up query strings"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION),
    )

    result = _parse(response.text)
    log.info(f"Follow-up answer: {result.get('message', '')[:100]}...")
    return result
