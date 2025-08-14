from fastapi import APIRouter, Depends
from backend.services.chat_service import chat_service
from backend.schemas import user
from backend.utils.token import get_current_user
from sqlalchemy.orm import Session
from backend.database.db import get_db

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

@router.post("/")
async def chat(message: str, current_user: user.User = Depends(get_current_user), db: Session = Depends(get_db)):
    reply =  await chat_service(message, current_user, db)
    return {"reply: ": reply}