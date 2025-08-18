from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from backend.database.db import engine, Base
import backend.models  # keep this import so create_all sees your models

from backend.routers import (
    user, auth, questionnaire, recommend, destination, hotels, weather,
    locations, search, chat, saved_places, itinerary, forgot_password
)

app = FastAPI()

# --- CORS: env-driven, with local dev fallback ---
env_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
# Local Vite/React defaults; keep only if ALLOWED_ORIGINS is not set
dev_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",   # Vite default
    "http://localhost:3000", "http://127.0.0.1:3000",   # CRA default (if you use it)
    "http://localhost:8080", "http://127.0.0.1:8080",
    "http://localhost:8000", "http://127.0.0.1:8000",
    "https://eloquent-frangollo-7975e1.netlify.app",
]
origins = env_origins or dev_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,   # keep True if you use cookies/Auth; otherwise False
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB tables (safe with SQLite: creates missing ones; won't drop) ---
Base.metadata.create_all(bind=engine)

# --- Routers ---
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(questionnaire.router)
app.include_router(recommend.router)
app.include_router(destination.router)
app.include_router(search.router)
app.include_router(hotels.router)
app.include_router(weather.router)
app.include_router(locations.router)
app.include_router(itinerary.router)
app.include_router(forgot_password.router)
app.include_router(chat.router)
app.include_router(saved_places.router)

# --- Health check (useful for Railway cold-start warmup) ---
@app.get("/health")
def health():
    return {"ok": True}

# --- One-time WeasyPrint stack version log (to confirm deps on Railway) ---
@app.on_event("startup")
def log_pdf_stack_versions():
    try:
        import weasyprint, pydyf, tinycss2, cssselect2, PIL
        logging.getLogger("pdfstack").info(
            "WeasyPrint %s | pydyf %s | tinycss2 %s | cssselect2 %s | Pillow %s",
            getattr(weasyprint, "__version__", "?"),
            getattr(pydyf, "__version__", "?"),
            getattr(tinycss2, "__version__", "?"),
            getattr(cssselect2, "__version__", "?"),
            getattr(PIL, "__version__", "?"),
        )
    except Exception as e:
        logging.getLogger("pdfstack").warning("Could not log PDF stack versions: %r", e)
