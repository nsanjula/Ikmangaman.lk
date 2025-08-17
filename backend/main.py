from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

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
# (Optional) use logging instead of print in prod:
# import logging; logging.getLogger("uvicorn").info("DB tables ensured")

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


# from fastapi import FastAPI
# from backend.database.db import engine, Base
# import backend.models
# from backend.routers import user, auth, questionnaire, recommend, destination, hotels, weather, locations, search, chat, \
#     saved_places, itinerary, forgot_password
# from fastapi.middleware.cors import CORSMiddleware
#
# app = FastAPI()
# Base.metadata.create_all(bind=engine)
# print("Tables created")
#
# app.include_router(user.router)
# app.include_router(auth.router)
# app.include_router(questionnaire.router)
# app.include_router(recommend.router)
# app.include_router(destination.router)
# app.include_router(search.router)
# app.include_router(hotels.router)
# app.include_router(weather.router)
# app.include_router(locations.router)
# app.include_router(itinerary.router)
# app.include_router(forgot_password.router)
#
# app.include_router(chat.router)
# app.include_router(saved_places.router)
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:8080",
#         "http://localhost:8081",  # Common Vite alternative port
#         "http://localhost:3000",  # Common React dev port
#         "http://localhost:48752",
#         "http://127.0.0.1:8080",
#         "http://127.0.0.1:8081",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
