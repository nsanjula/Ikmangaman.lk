from fastapi import APIRouter, HTTPException
from backend.services.chat_service_openai import chat_service

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

@router.post("/")
async def chat(message: str):
    reply =  await chat_service(message)
    return {"reply: ": reply}