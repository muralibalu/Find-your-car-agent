import time
from fastapi import APIRouter, HTTPException
from models import Preferences, ChatMessage
from services.filter import filter_cars
from services.llm import rank_and_explain, answer_followup
from logger import get_logger
import json

log = get_logger("routes.chat")
router = APIRouter()


@router.post("/preferences", response_model=None)
def process_preferences(prefs: Preferences):
    log.info("POST /api/preferences received")
    t0 = time.time()
    try:
        candidates = filter_cars(prefs)
        result = rank_and_explain(candidates, prefs)
        elapsed = time.time() - t0
        log.info(f"POST /api/preferences completed in {elapsed:.2f}s | returned {len(result.get('cars', []))} cars")
        return result
    except json.JSONDecodeError as e:
        log.error(f"LLM returned malformed JSON: {e}")
        raise HTTPException(status_code=500, detail="LLM returned malformed response. Please try again.")
    except Exception as e:
        log.error(f"Unexpected error in /preferences: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=None)
def chat(msg: ChatMessage):
    log.info(f"POST /api/chat | message={msg.message!r}")
    t0 = time.time()
    try:
        result = answer_followup(msg.message, msg.context)
        elapsed = time.time() - t0
        log.info(f"POST /api/chat completed in {elapsed:.2f}s")
        return result
    except json.JSONDecodeError as e:
        log.error(f"LLM returned malformed JSON: {e}")
        raise HTTPException(status_code=500, detail="LLM returned malformed response. Please try again.")
    except Exception as e:
        log.error(f"Unexpected error in /chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
