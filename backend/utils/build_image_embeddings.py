# backend/utils/build_image_embeddings.py

import numpy as np
import torch
import open_clip
from PIL import Image
from pathlib import Path
from sqlalchemy.orm import Session

from backend.database.db import SessionLocal
from backend.models.destination_imgs import ImageEmbedding
from backend.utils.paths import IMAGE_ROOT  # should point to backend/data/images

# ====== Model setup ======
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL, _, PREPROCESS = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k", device=DEVICE
)
MODEL.eval()

@torch.no_grad()
def embed_image(img_path: Path) -> np.ndarray:
    """
    Open the image, preprocess it for CLIP, get the embedding, normalize it,
    and return as a flattened float32 numpy array.
    """
    img = Image.open(img_path).convert("RGB")
    tensor = PREPROCESS(img).unsqueeze(0).to(DEVICE)
    vec = MODEL.encode_image(tensor)
    vec = vec / vec.norm(dim=-1, keepdim=True)  # L2 normalize
    return vec.cpu().numpy().astype("float32").flatten()

def main():
    db: Session = SessionLocal()

    # Only fetch rows without an embedding yet
    rows = db.query(ImageEmbedding).filter(ImageEmbedding.vector == None).all()

    if not rows:
        print("No images found without embeddings. Table is already up-to-date.")
        return

    done = 0
    for row in rows:
        img_path = IMAGE_ROOT / row.image_path
        if not img_path.exists():
            print(f"[missing] {img_path}")
            continue

        try:
            vec = embed_image(img_path)
            row.vector = vec.tobytes()
            db.add(row)
            done += 1
        except Exception as e:
            print(f"[error] Failed to embed {img_path}: {e}")

    db.commit()
    print(f"Stored embeddings for {done} images.")

if __name__ == "__main__":
    main()
