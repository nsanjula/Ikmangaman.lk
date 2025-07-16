import httpx    #this is the HTTP client library we use to make web requests asynchronously.
import os       #lets us read environment variables (like API keys).
from dotenv import load_dotenv      #loads your .env file so those environment variables become available.


load_dotenv()

CLIENT_ID = os.getenv("AMADEUS_CLIENT_ID")
CLIENT_SECRET = os.getenv("AMADEUS_CLIENT_SECRET")

# Get access token form amadeus
async def get_amadeus_token():
            # This function:
            # Calls Amadeus’s OAuth2 endpoint to get an access token.
            # Sends a POST request with your credentials (client_id and client_secret) in the request body.
            # If the request is successful, the API returns a JSON containing an access_token.
            # The token is extracted and returned.
            # Note:async with httpx.AsyncClient() means it’s asynchronous — your FastAPI app won’t block waiting for the request.
            # response.raise_for_status() will raise an error if something goes wrong (like bad credentials).

    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, headers=headers)
        response.raise_for_status()  # Raises error if request fails
        token = response.json().get("access_token")
        return token

# Step 1 - Get hotel IDs for a city
async def get_hotel_ids(city_code: str, token: str):
    url = f"https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode={city_code}"
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        hotel_data = response.json()
        hotel_ids = [hotel["hotelId"] for hotel in hotel_data.get("data", [])]
        return hotel_ids


# Use the token to get hotel offers by city code (e.g. NYC, LON)
async def get_hotels(city_code: str):
    token = await get_amadeus_token()
    hotel_ids = await get_hotel_ids(city_code, token)

    if not hotel_ids:
        return {"error": f"No hotels found for city: {city_code}"}

    hotel_id = hotel_ids[0]  # just using the first for now

    url = (
        f"https://test.api.amadeus.com/v3/shopping/hotel-offers"
        f"?hotelIds={hotel_id}"
        f"&checkInDate=2025-07-20"
        f"&checkOutDate=2025-07-23"
        f"&adults=1"
        f"&roomQuantity=1"
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }
            # is preparing the HTTP headers to send with an API request, specifically for authorization.
            #     "Authorization" is the name of the HTTP header used to provide credentials to the server.
            # "Bearer {token}" is the value of the header, where {token} is your access token obtained from Amadeus.
            # The f before the string means f-string formatting in Python — it inserts the actual token string into the place of {token}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

        print("Status code:", response.status_code)
        print("Raw response:", response.text)  # <<< Use this for debugging

        response.raise_for_status()
        return response.json()