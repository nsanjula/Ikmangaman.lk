from fastapi import FastAPI
from backend.database.db import engine, Base
import backend.models
from backend.routers import user, auth

app = FastAPI()
Base.metadata.create_all(bind=engine)
print("Tables created")

app.include_router(user.router)
app.include_router(auth.router)



