import os

from fastapi import Depends
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.schemas import user
from backend.models import users
from backend.utils.auth_token import get_current_user

load_dotenv()
openaiKey = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=openaiKey)

accessed_user = "Traveller"



async def get_user_name(current_user: user.User, db: Session):
    accessed_user = db.query(users.User).filter(users.User.username == current_user.username).first()

    if accessed_user:
        return accessed_user.firstname
    return None

async def chat_service(message: str, current_user: user.User, db: Session):
    # accessed_user_name = current_user.username if current_user else "traveller"
    accessed_user_name = await get_user_name(current_user, db) if current_user else "traveller"

    recommendations = ["Ella", "Kandy", "Mirissa", "Sigiriya", "Nuwara Eliya", "Anuradhapura", "Galle", "Trincomalle",
                       "Polonnaruwa","Jaffna","Arugam Bay", "Haputale", "Negombo","Matale","Kalpitiya","Kithugala","Dambulla"
                       ,"Bentota", "Udawalawe", "Colombo", "Yala","Badulla","Mannar","Ratnapura","Puttalam","Hambantota","Pasikuda",
                       "Katharagama"]

    instructions = f"""
                    You are an AI agent for suggesting locations for trips in Sri Lanka do not mention that explicitly. 
                    Be engaging and excited but not over the top . Always refer to the user as '{accessed_user_name}'. 
                    Do not leave conversations open ended that might prompt the use to ask a follow up question.
                    Also try not to end conversations with questions.
                    
                    Make sure to only recommend a location only if it is in {recommendations}.
                    
                    ONLY If the user asks about a location not in {recommendations} do not try to steer away from it nor
                     to suggest another place instead first elaborate on the location the user asked about then elaborate on 
                     the closest location to the user's preference that is in {recommendations}
                     then provide the details about getting from the recommendation to the users preference, make sure to include the distance
                     also give a brief description of the mode of transport that will be available.
                     
                     Otherwise just provide details normally.
                    """

    response = client.responses.create(
        model="gpt-4o-mini",
        input=message,
        instructions=instructions
        # store=True,
    )
    return response.output_text
