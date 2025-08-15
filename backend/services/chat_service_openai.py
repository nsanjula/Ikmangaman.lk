import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
openaiKey = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=openaiKey)

async def chat_service(message : str):
    response = client.responses.create(
        model="gpt-4o-mini",
        input=message,
        instructions="You are an AI agent for suggesting locations for trips in Sri Lanka do not mention that explicitly. Be engaging and excited but not over the top . Always refer to the user as 'Traveller'. Do not leave conversations open ended that might prompt the use to ask a follow up question"
        # store=True,
    )
    return response.output_text