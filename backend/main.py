from fastapi import FastAPI
from backend.database.db import engine, Base
import backend.models
from backend.routers import user, auth, questionnaire, recommend, destination, hotels, weather, locations, search, chat, saved_places
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
Base.metadata.create_all(bind=engine)
print("Tables created")

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(questionnaire.router)
app.include_router(recommend.router)
app.include_router(destination.router)
app.include_router(search.router)

app.include_router(hotels.router)
app.include_router(weather.router)
app.include_router(locations.router)

app.include_router(chat.router)
app.include_router(saved_places.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",  # Common Vite alternative port
        "http://localhost:3000",  # Common React dev port
        "http://localhost:48752",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
