from fastapi import FastAPI
from backend.database.db import engine, Base
import backend.models
import os
from dotenv import load_dotenv
import sys
import pathlib

# Calculate the .env file location relative to main.py
env_path = pathlib.Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

from backend.routers import user, auth, hotels, weather

app = FastAPI()
Base.metadata.create_all(bind=engine)
print("Tables created")

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(hotels.router)
app.include_router(weather.router)



