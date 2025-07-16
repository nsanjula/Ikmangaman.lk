from joblib import load
import os
import numpy as np

model_path = os.path.join(os.path.dirname(__file__), "./traveler_model.pkl")
model = load(model_path)

def predict_traveler_type(age, season, interests_dict):
    features = {
        "age": age,
        "season": season,
        **interests_dict
    }

    input_vector = np.array([[features[k] for k in features]])
    prediction = model.predict(input_vector)[0]

    traveler_types = [
        'Nature Lover', 'Luxury Traveler', 'Relaxation Seeker', 'Culture Seeker',
        'Adventurer', 'Backpacker', 'Food Explorer', 'Spiritual Traveler', 'Eco-Conscious Traveler'
    ]

    return [label for label, val in zip(traveler_types, prediction) if val == 1]








