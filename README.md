# CarDekho AI — Car Buying Advisor


An AI-powered chatbot that helps confused car buyers go from "I have no idea" to a confident shortlist in under 2 minutes.


---


## Running it


**Single command (Docker required):**
```bash
docker compose up
```
Open [http://localhost:8080](http://localhost:8080)


**Or run locally:**
```bash
# Backend
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --port 8080 --reload


# Frontend (separate terminal)
cd frontend
npm install
npm run dev        # http://localhost:5173
```


---


## What did I build and why?


A **chatbot-first car recommendation app** with two entry paths:


- **Start from Scratch** — an inline preference card (budget sliders, fuel type, body type, seating, transmission, free-text) that filters the dataset and returns a ranked shortlist with AI-generated explanations and follow-up chips
- **I have cars in mind** — free-text input where the user names specific cars and the AI digs deeper


I chose the chatbot format deliberately. A filter page with dropdowns feels like work. A conversational interface that asks "what's on your mind?" lowers the entry barrier for someone who genuinely doesn't know where to start — which is the user the brief describes.


**What I deliberately cut:**


- **Real authentication** — replaced with a simple name input and localStorage session. Auth would take 45 minutes and adds zero value to the demo.
- **User reviews** — not in the dataset cleanly, and surfacing scraped sentiment adds noise more than signal at this stage.
- **Comparison table UI** — the LLM handles comparison questions through the follow-up chat flow. A dedicated compare page would be a second iteration feature.
- **Safety ratings** — the dataset doesn't have NCAP data. Fabricating it would be worse than omitting it.
- **Saved shortlists / favourites** — a natural next feature but outside the 2-3 hour scope.


---


## Tech stack and why


| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast to scaffold, hot reload, type safety catches prop mismatches early |
| Styling | Tailwind CSS | No context switching to a CSS file; utility classes keep component code self-contained |
| Backend | Python + FastAPI | Async-ready, automatic OpenAPI docs, Pydantic validation catches bad requests at the boundary |
| Database | DuckDB | Reads CSV directly in one line, no ORM setup, SQL over a file — perfect for a read-heavy recommendation dataset |
| LLM | Gemini 2.0 Flash | Fast, cheap, handles structured JSON output reliably; easy to swap if needed |
| Deployment | Docker Compose | Single command for any reviewer, no environment mismatch, bundles frontend build + backend + DB seed in one image |


**Key architectural decision:** The LLM never touches the database. Code filters (SQL WHERE clauses on budget, fuel, seating, body type), then the top 15 candidates go to Gemini for ranking and explanation. This keeps it fast, deterministic, and cheap — the LLM only does what it's actually good at.


---


## What I delegated to AI vs. did manually


**Delegated to AI (Claude Code):**
- Boilerplate scaffolding — `package.json`, `tsconfig.json`, `vite.config.ts`, FastAPI app skeleton, Pydantic models
- Repetitive mapping work — the 50-entry `(Brand, Model) → body_type` dictionary in `seed.py`
- Tailwind component structure for `CarCard`, `FollowUpChips`, `PreferenceCard`
- Docker multi-stage build configuration
- Logger setup with rotating file handler


**Did manually / with heavy review:**
- Product decisions — the two-path flow (scratch vs. known), the inline card pattern, what to cut
- LLM prompt engineering — the first draft follow-up prompts generated advisor questions ("What is your budget?") instead of user queries ("Compare Nexon and Baleno"). Fixed by adding explicit good/bad examples to the prompt
- Data fix — the dataset had no `body_type` column; mapped all 50 models by hand based on domain knowledge
- Key casing bug — DuckDB returned `Brand`, `Model`, `Price` (PascalCase) but the frontend expected `brand`, `model`, `price` (camelCase). AI scaffolded both ends independently and didn't catch the mismatch; diagnosed and fixed manually by adding a rename step in `filter.py`
- Context threading — the initial follow-up handler passed no context to the LLM. Manually identified the gap and wired `lastContext` state in `Chat.tsx`
- `load_dotenv()` ordering bug — env vars weren't loading because the Gemini client was instantiated at import time before `load_dotenv()` ran. Caught and fixed manually


**Where AI tools helped most:**
- Speed on boilerplate — the full folder structure, all config files, and component shells were done in minutes instead of an hour
- The `seed.py` CASE statement SQL — generating a 50-branch CASE expression from a Python dict would have been tedious to write by hand


**Where they got in the way:**
- The key casing mismatch went unnoticed because AI scaffolded frontend and backend in separate passes without connecting the dots
- Follow-up prompt quality required two iterations — the first output was plausible-looking but wrong in a subtle product sense (advisor tone vs. user tone)
- Occasionally over-scaffolded — generated session persistence tables and response model classes that weren't needed for the MVP, adding noise to review


---


## If I had another 4 hours


1. **Comparison view** — side-by-side spec table when the user asks to compare two cars, not just text
2. **"Known cars" path** — currently wired to the chat input but the LLM context isn't as rich; would pull the specific cars from the DB and do a proper deep-dive
3. **Persistent sessions** — the `sessions` table is already in the DB schema; hook it up so users can return to their shortlist
4. **Better dataset** — current data is synthetic (10k rows, 50 models, some factually wrong combinations like Kia EV6 as Diesel). Would scrape or source real CarDekho listings with accurate specs
5. **Streaming responses** — Gemini supports streaming; showing explanation text word-by-word instead of a loading spinner feels much more alive for a chatbot
6. **Mobile layout** — the chat UI works on mobile but the preference card is cramped; needs a bottom-sheet treatment on small screens



