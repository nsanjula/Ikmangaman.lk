import io
import numpy as np
import torch
import open_clip
from PIL import Image
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from sqlalchemy import String
from sqlalchemy.orm import Session
from collections import defaultdict
from fastapi import APIRouter

from backend.database.db import get_db
from backend.models import destinations
from backend.models.destinations import Destination
from backend.models.destination_imgs import ImageEmbedding
from backend.routers.hotels import get_hotel
from backend.routers.weather import get_forecast
from backend.schemas import user
from backend.utils.auth_token import get_current_user

router = APIRouter(
    tags=["search"],
    prefix="/search"
)

# ===== Load CLIP model =====
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL, _, PREPROCESS = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k", device=DEVICE
)
MODEL.eval()

@torch.no_grad()
def embed_bytes(data: bytes) -> np.ndarray:
    """Embed and normalize an uploaded image."""
    img = Image.open(io.BytesIO(data)).convert("RGB")
    tensor = PREPROCESS(img).unsqueeze(0).to(DEVICE)
    vec = MODEL.encode_image(tensor)
    vec = vec / vec.norm(dim=-1, keepdim=True)
    return vec.cpu().numpy().astype("float32").flatten()

@router.post("/by-image")
async def search_by_image(
    file: UploadFile = File(...),
    k: int = 5,
    per_dest_k: int = 3,
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    """Search visually similar destinations by uploaded image."""
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "Please upload a JPG, PNG, or WEBP image")

    # --- 1) Embed uploaded image ---
    q_vec = embed_bytes(await file.read())

    # --- 2) Load all stored embeddings ---
    rows = db.query(ImageEmbedding).filter(ImageEmbedding.vector != None).all()
    if not rows:
        raise HTTPException(500, "No embeddings found. Please build them first.")

    embs, dest_ids, img_paths = [], [], []
    for r in rows:
        e = np.frombuffer(r.vector, dtype=np.float32)
        if e.size:
            embs.append(e)
            dest_ids.append(r.destination_id)
            img_paths.append(r.image_path)

    X = np.vstack(embs)  # shape: (N, 512)
    scores = X @ q_vec   # cosine similarity

    # --- 3) Take top matches overall ---
    idx = np.argsort(-scores)[:50]
    from collections import defaultdict
    per_dest = defaultdict(list)
    for i in idx:
        per_dest[dest_ids[i]].append((float(scores[i]), img_paths[i]))

    # --- 4) Aggregate per destination ---
    final_rank = []
    for dest_id, lst in per_dest.items():
        lst.sort(key=lambda x: x[0], reverse=True)
        topk = lst[:min(per_dest_k, len(lst))]
        mean_score = np.mean([s for s, _ in topk])
        best_image_path = topk[0][1]
        final_rank.append((dest_id, mean_score, best_image_path))

    final_rank.sort(key=lambda x: x[1], reverse=True)
    final_rank = final_rank[:k]
    dest_ids_top = [d for d, _, _ in final_rank]

    # --- 5) Fetch Destination objects in ranked order ---
    dest_objs = (
        db.query(Destination)
          .filter(Destination.destination_id.in_(dest_ids_top))
          .all()
    )
    dest_map = {d.destination_id: d for d in dest_objs}

    # --- 6) Build full response ---
    results = []
    for dest_id, score, best_image_path in final_rank:
        d = dest_map.get(dest_id)
        if not d:
            continue


        # Try to get weather data, fallback to None if it fails
        try:
            weather_data = await get_forecast(d.name)
        except Exception as e:
            print(f"Weather API failed for {d.name}: {e}")
            weather_data = None

        # Try to get hotel data, fallback to None if it fails
        try:
            hotel_data = await get_hotel(d.name)
        except Exception as e:
            print(f"Hotel API failed for {d.name}: {e}")
            hotel_data = None


        guide_details = [
            {
                "guide_id": g.guide_id,
                "name": g.name,
                "gender": g.gender,
                "contact_no": g.contact_no,
                "photo_url": f"/guides/photo/{g.guide_id}",
            }
            for g in getattr(d, "guides", [])
        ]

        results.append({
            "destination_name": d.name,
            "destination_id": d.destination_id,
            "latitude": getattr(d, "latitude", None),
            "longitude": getattr(d, "longitude", None),
            "description": getattr(d, "description", None),
            "things_to_do": d.things_to_do.split("/") if getattr(d, "things_to_do", None) else [],
            "hotel_data": hotel_data,
            "guide_details": guide_details,
            "destination image": f"/destination-image/{d.destination_id}",
            "visual_match_score": round(score, 4)
        })

    return {"results": results}


@router.get("/by-destination-name")
async def search_by_name(
    destination_name: str = Query(..., description="Name of the destination"),
    db: Session = Depends(get_db),
    current_user: user.User = Depends(get_current_user)
):
    # Search destination(s) by name
    destinations = db.query(Destination).filter(Destination.name.ilike(f"%{destination_name}%")).all()

    if not destinations:
        raise HTTPException(status_code=404, detail="No destinations found with that name")

    results = []

    for d in destinations:
        # Fetch weather data
        try:
            weather_data = await get_forecast(d.name)
        except Exception as e:
            print(f"Weather API failed for {d.name}: {e}")
            weather_data = None

        # Fetch hotel data
        try:
            hotel_data = await get_hotel(d.name)
        except Exception as e:
            print(f"Hotel API failed for {d.name}: {e}")
            hotel_data = None

        # Guide details
        guide_details = [
            {
                "guide_id": g.guide_id,
                "name": g.name,
                "gender": g.gender,
                "contact_no": g.contact_no,
                "photo_url": f"/guides/photo/{g.guide_id}",
            }
            for g in getattr(d, "guides", [])
        ]

        results.append({
            "destination_name": d.name,
            "destination_id": d.destination_id,
            "latitude": getattr(d, "latitude", None),
            "longitude": getattr(d, "longitude", None),
            "description": getattr(d, "description", None),
            "things_to_do": d.things_to_do.split("/") if getattr(d, "things_to_do", None) else [],
            "hotel_data": hotel_data,
            "guide_details": guide_details,
            "destination image": f"/destination-image/{d.destination_id}"
        })

    return {"results": results}

