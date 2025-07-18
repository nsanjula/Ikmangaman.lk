import httpx    #this is the HTTP client library we use to make web requests asynchronously.
from dotenv import load_dotenv      #loads your .env file so those environment variables become available.

load_dotenv()

MOCKAPI_KEY = "https://687923f063f24f1fdca10976.mockapi.io/api/v1/Hotels"

async def get_hotels(city : str):
    params = {
        "city" : city
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(MOCKAPI_KEY, params=params)
        response.raise_for_status()
        return response.json()