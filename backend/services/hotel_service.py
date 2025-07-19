import httpx    #this is the HTTP client library we use to make web requests asynchronously.
from dotenv import load_dotenv      #loads your .env file so those environment variables become available.
import random

load_dotenv()

MOCKAPI_KEY = "https://687923f063f24f1fdca10976.mockapi.io/api/v1/Hotels"

IMAGE_URLS = [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/8e/96/2d/caption.jpg?w=1200&h=-1&s=1",
    "https://www.travelplusstyle.com/wp-content/gallery/jetwig-kaduruketha/100540-16-jkw_lobbyexterior_5780.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/41/81/ce/caption.jpg?w=1200&h=-1&s=1",
    "https://www.bookingsrilanka.com/wp-content/uploads/2019/06/173079857.jpg",
    "https://www.littleenglandcottages.com/video/cover.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/9d/57/98/cinnamon-lakeside-colombo.jpg?w=1200&h=-1&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/39/fb/3f/d-pavilion-inn.jpg?w=1200&h=-1&s=1",
    "https://i0.wp.com/thehoteljournal.com/wp-content/uploads/2020/07/best-boutique-hotels-colombo-sri-lanka-galle-face-hotel-bar.jpg?resize=798%2C532&ssl=1",
    "https://www.theworldinmypocket.co.uk/wp-content/uploads/2020/04/sri-lanka-beach-resorts.jpg",
    "https://images.destination2.co.uk/Hotels/superid/238576/016.jpg"
]

async def get_hotels(city : str):
    params = {
        "city" : city
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(MOCKAPI_KEY, params=params)
        response.raise_for_status()
        hotels =  response.json()

        # Add an image randomly
        for hotel in hotels:
            hotel["image_url"] = random.choice(IMAGE_URLS)

        return hotels