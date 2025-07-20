# 🌍 Ikmangaman.lk

**Ikmangaman.lk** is an AI-powered travel planning platform tailored for domestic tourism in Sri Lanka. It helps users discover destinations that match their traveler type, preferences, and travel season, while also offering practical details like weather, transport, accommodations, and local guides — all in one place.

---

## 🚀 Key Features

- 🎯 **Personalized Travel Recommendations**  
  Uses machine learning to suggest destinations based on user profiles (e.g., Backpacker, Nature Lover, Spiritual Traveler).

- 📍 **Interactive Route Visualization**  
  Uses Google Maps to display the route from your current location to the destination, including distance and time.

- 🗺️ **Destination-Specific Map Overlays**  
  Shows key landmarks and points of interest around each recommended destination for better trip planning.

- 🌦️ **Real-Time Weather Insights**  
  Fetches live weather information to help users plan trips accordingly.

- 🏨 **Hotel Suggestions Nearby**  
  Integrates data to show accommodation options near the destination.

- 🧭 **Local Guide Contact Info**  
  Recommends guides and tips sourced from community inputs and external APIs.

---

## 🛠️ Tech Stack

| Layer        | Technology                |
|--------------|---------------------------|
| Frontend     | React + TypeScript + Vite |
| Styling      | Tailwind CSS              |
| Backend      | FastAPI (Python)          |
| Machine Learning | Scikit-learn          |
| Database     | SQLite                    |
| Dev Tools    | Git, GitHub, VS Code      |

---

## 🔐 Environment Setup

### 🔑 Frontend `.env` Configuration

Create a `.env` file inside the `frontend/` directory with the following variable:

```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```
### 🔑 Root  `.env` Configuration

Create a `.env` file inside the `frontend/` directory with the following variable:

```env
# API credentials
AMADEUS_CLIENT_ID=your_api_key
AMADEUS_CLIENT_SECRET=your_client_secret
RAPIDAPI_KEY=your_api_key

# API base and weather
REACT_APP_API_BASE_URL=http://localhost:8000
OPENWEATHER_API_KEY=your_api_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_api_key

# Security settings
ACCESS_TOKEN_EXPIRE_MINUTES=30
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
```
---
## 🧪 How to Run the Project
### 📦 Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
- Runs at: http://localhost:8000
- Docs available at: http://localhost:8000/docs

### 💻 Frontend Setup
```
cd frontend
npm install
npm run dev
```
---
## 👥 Team Members
- Nisal Sanjula
- Yasiru Hansana
- Anupama Wickramarathna
- Buvindu Suraweera
- Chirantha Akarsha

---
## ✅ To Do / Future Enhancements

- 🧠 Crowd prediction models for destinations
- 📝 Itinerary generation and integrated trip budget calculator
- 🤝 Affiliate partnerships with hotel booking platforms in Sri Lanka

