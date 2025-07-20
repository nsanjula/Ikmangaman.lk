# 🌍 Ikmangaman.lk

**Ikmangaman.lk** is an AI-powered travel planning platform tailored for domestic tourism in Sri Lanka. It helps users discover destinations that match their traveler type, preferences, and travel season, while also offering practical details like weather, transport, accommodations, and local guides — all in one place.

---

## 🚀 Key Features

- 🎯 **Personalized Travel Recommendations**  
  Uses machine learning to suggest destinations based on user profiles (e.g., Backpacker, Nature Lover, Spiritual Traveler).

- 📍 **Interactive Route Visualization**  
  Uses Google Maps to display the route from your current location to the destination, including distance and time.

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
