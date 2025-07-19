# Backend Quick Start Guide

## 🚀 Start the Backend Server

### Method 1: Using Uvicorn (Recommended)

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Method 2: Direct Python

```bash
cd backend
python main.py
```

### Method 3: With specific Python version

```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Dependencies installed:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## ✅ Verify Installation

Once running, you should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
Tables created
INFO:     Application startup complete.
```

## 🌐 Access Points

- **API Server:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

## 🔧 Environment Setup (Optional)

Create a `.env` file in the backend directory:

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill existing process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python -m uvicorn main:app --reload --port 8001
```

### Dependencies Issues

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install specific versions
pip install fastapi==0.116.1 uvicorn==0.35.0

# Install all requirements
pip install -r requirements.txt
```

### Python Not Found

- Make sure Python 3.8+ is installed
- Try `python3` instead of `python`
- Check your PATH environment variable

## 📁 Directory Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── .env                # Environment variables (create this)
├── database/           # Database configuration
├── models/             # SQLAlchemy models
├── routers/            # API route handlers
├── services/           # Business logic
└── utils/              # Helper functions
```

## 🔗 Frontend Connection

Once the backend is running:

1. The frontend at http://localhost:48752 will automatically connect
2. All travel planning features will be available
3. Keep the backend terminal open while using the app

---

**Need Help?** Check the main README.md or API documentation at http://localhost:8000/docs
