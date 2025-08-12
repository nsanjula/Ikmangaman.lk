from fastapi import APIRouter

router = APIRouter(
    tags=["search"]
)

@router.get("/search/search-by-image")
def get_destinations_by_image():
    pass

@router.get("/search/search-by-text")
def get_destination_by_name():
    pass
