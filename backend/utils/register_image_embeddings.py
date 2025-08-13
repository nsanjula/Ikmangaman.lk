# backend/utils/register_image_embeddings.py
from pathlib import Path
from sqlalchemy.orm import Session
from backend.database.db import SessionLocal
from backend.models.destination_imgs import ImageEmbedding
from backend.utils.paths import IMAGE_ROOT

FOLDER_TO_ID = {
    "Folder1": 1,
    "Folder2": 2,
    "Folder3": 3,
    "Folder4": 4,
    "Folder5": 5,
    "Folder6": 6,
    "Folder7": 7,
    "Folder8": 8,
    "Folder9": 9,
    "Folder10": 10,
    "Folder11": 11,
    "Folder12": 12,
    "Folder13": 13,
    "Folder14": 14,
    "Folder15": 15,
    "Folder16": 16,
    "Folder17": 17,
    "Folder18": 18,
    "Folder19": 19,
    "Folder20": 20,
    "Folder21": 21,
    "Folder22": 22,
    "Folder23": 23,
    "Folder24": 24,
    "Folder25": 25,
    "Folder26": 26,
    "Folder27": 27,
    "Folder28": 28,
}

print("Folder dict created")

MAX_PER_DEST = 5  # keep at 5 as you wanted

def main():
    db: Session = SessionLocal()
    created = 0

    # iterate folders in name order for deterministic inserts
    for folder in sorted(p for p in IMAGE_ROOT.iterdir() if p.is_dir()):
        print(f"[register] {folder.name}")
        dest_id = FOLDER_TO_ID.get(folder.name)
        print(f"[register] dest_id: {dest_id}")
        if dest_id is None:
            print(f"[skip] no mapping for {folder.name}")
            continue

        # deterministic image order; take first N
        image_files = sorted(folder.glob("*.*"))[:MAX_PER_DEST]

        for img in image_files:
            rel = f"{folder.name}/{img.name}"
            exists = db.query(ImageEmbedding).filter_by(destination_id=dest_id, image_path=rel).first()
            if exists:
                continue
            db.add(ImageEmbedding(destination_id=dest_id, image_path=rel))
            created += 1

    db.commit()
    print(f"registered {created} rows in image_embeddings")

if __name__ == "__main__":
    main()
