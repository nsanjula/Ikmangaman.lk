# === Import necessary libraries ===
import pandas as pd
from joblib import load
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import os

# === Step 1: Load the dataset ===
print("Going to read data")
df = pd.read_csv("traveler_type_dataset_balanced.csv")
print(df)
print("Data read")

# === Step 2: Define feature columns ===
features = [
    'age', 'season', 'nature', 'adventure', 'luxury', 'culture',
    'relaxation', 'wellness', 'local_life', 'wildlife',
    'food', 'spirituality', 'eco_tourism'
]

# === Step 3: Define label columns ===
labels = [
    'Nature Lover', 'Luxury Traveler', 'Relaxation Seeker', 'Culture Seeker',
    'Adventurer', 'Backpacker', 'Food Explorer', 'Spiritual Traveler', 'Eco-Conscious Traveler'
]

# === Step 4: Split the dataset ===
X = df[features]
Y = df[labels]
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# === Step 5: Create and train the model ===
model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
model.fit(X_train, Y_train)

# === Step 6: Evaluate the model ===
Y_pred = model.predict(X_test)
print("Classification Report (per traveler type):")
print(classification_report(Y_test, Y_pred, target_names=labels))

# === Step 7: Save the trained model ===
# Dynamically compute correct path: project_root/models/traveler_model.pkl
# current_dir = os.path.dirname(os.path.abspath(__file__))  # model_training/
# project_root = os.path.abspath(os.path.join(current_dir, ".."))  # Ikmangamanlk/
# models_dir = os.path.join(project_root, "models")
# os.makedirs(models_dir, exist_ok=True)
#
# model_path = os.path.join(models_dir, "traveler_model.pkl")
# joblib.dump(model, model_path)
#
# print(f"Model training complete and saved to: {model_path}")

# === Step 7: Save the trained model to services directory ===
current_dir = os.path.dirname(os.path.abspath(__file__))  # ai_models/
services_dir = os.path.abspath(os.path.join(current_dir, "..", "services"))
os.makedirs(services_dir, exist_ok=True)

model_path = os.path.join(services_dir, "traveler_model.pkl")
joblib.dump(model, model_path)

print(f"Model training complete and saved to: {model_path}")

