from dotenv import load_dotenv
load_dotenv()  # must run before any module that reads os.getenv at import time

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routes.chat import router as chat_router
from logger import get_logger

log = get_logger("main")

app = FastAPI(title="CarDekho AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")


@app.get("/health")
def health():
    log.debug("Health check ping")
    return {"status": "ok"}


# Serve built React app — must come after API routes
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    log.info(f"Serving frontend from {STATIC_DIR}")


@app.on_event("startup")
def on_startup():
    from database import get_conn
    try:
        conn = get_conn()
        count = conn.execute("SELECT COUNT(*) FROM cars").fetchone()[0]
        conn.close()
        log.info(f"DB ready — {count} cars loaded")
    except Exception:
        log.warning("DB not seeded yet — running seed.py now")
        import seed
        seed.seed()

    log.info("CarDekho AI backend started")
    log.info("Routes: POST /api/preferences | POST /api/chat | GET /health")
