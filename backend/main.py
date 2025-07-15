from fastapi import FastAPI
from backend.database.db import engine, Base
import backend.models

app = FastAPI()
Base.metadata.create_all(bind=engine)
print("Tables created")



