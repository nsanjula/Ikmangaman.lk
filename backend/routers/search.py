import io
import numpy as np
import torch
import open_clip
from PIL import Image
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from fastapi import APIRouter

from backend.database.db import get_db
from backend.models.destinations import Destination
from backend.models.destination_imgs import ImageEmbedding

router = APIRouter(
    tags=["search"]
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
    db: Session = Depends(get_db)
):
    """Search visually similar destinations by uploaded image."""
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "Please upload a JPG, PNG, or WEBP image")

    # Embed the uploaded image
    q_vec = embed_bytes(await file.read())

    # Load all stored embeddings
    rows = db.query(ImageEmbedding).filter(ImageEmbedding.vector != None).all()
    if not rows:
        raise HTTPException(500, "No embeddings found. Please build them first.")

    embs, dest_ids, img_paths = [], [], []
    for r in rows:
        embs.append(np.frombuffer(r.vector, dtype=np.float32))
        dest_ids.append(r.destination_id)
        img_paths.append(r.image_path)

    X = np.vstack(embs)  # shape: (N, 512)
    scores = X @ q_vec   # cosine similarity

    # Take top matches overall
    idx = np.argsort(-scores)[:50]
    per_dest = defaultdict(list)
    for i in idx:
        per_dest[dest_ids[i]].append((float(scores[i]), img_paths[i]))

    # Aggregate scores per destination
    final = []
    for dest_id, lst in per_dest.items():
        lst.sort(key=lambda x: x[0], reverse=True)
        topk = lst[:min(per_dest_k, len(lst))]
        mean_score = np.mean([s for s, _ in topk])
        best_image_path = topk[0][1]
        final.append((dest_id, mean_score, best_image_path))

    final.sort(key=lambda x: x[1], reverse=True)
    final = final[:k]
    print(final)

    # Fetch destination metadata
    dest_map = {
        d.destination_id: d
        for d in db.query(Destination).filter(Destination.destination_id.in_([d for d, _, _ in final])).all()
    }

    print(dest_map)

    return {
        "results": [
            {
                "destination_id": dest_id,
                "name": getattr(dest_map.get(dest_id), "name", None),
                "score": round(score, 4),
                "best_image_path": img_path
            }
            for dest_id, score, img_path in final
        ]
    }

@router.get("/search/search-by-text")
def search_by_name():
    pass
