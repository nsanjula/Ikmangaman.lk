from fastapi import Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.destinations import Destination

def get_top_destinations(traveler_type_lst, travel_season, db):
    destinations = db.query(Destination).all()
    scored = []

    for dest in destinations:
        # Get all traveler type fields of the destination
        traveler_type_fields = [
            "nature_lover", "luxury_traveler", "relaxation_seeker", "culture_seeker",
            "adventurer", "backpacker", "food_explorer", "spiritual_traveler", "eco_conscious_traveler"
        ]

        # Count how many tags are True in this destination
        true_tags = [tag for tag in traveler_type_fields if getattr(dest, tag, False)]
        total_true_tags = len(true_tags)

        # Count how many of user's tags match this destination
        user_tags = [t.lower().replace(" ", "_") for t in traveler_type_lst]
        matching_tags = [tag for tag in true_tags if tag in user_tags]
        score1 = len(matching_tags) / total_true_tags if total_true_tags > 0 else 0

        # Score2: seasonal score from destination table
        season_attr = f"season_{travel_season}"
        score2 = getattr(dest, season_attr, 0)

        # Final score
        final_score = score1 * 0.6 + score2 * 0.4
        scored.append((dest, final_score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:10]
