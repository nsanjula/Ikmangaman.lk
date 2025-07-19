# API Configuration Guide

This guide will help you set up all the API keys needed for the travel planning application.

## Required API Keys

### 1. OpenWeather API (Weather Service)

- **Service**: Weather forecasts and current weather
- **Website**: https://openweathermap.org/api
- **Setup Steps**:
  1. Create a free account at OpenWeatherMap
  2. Go to "API keys" section
  3. Copy your API key
  4. Add to `.env` file: `OPENWEATHER_API_KEY=your_api_key_here`

### 2. Google Maps API (Maps and Routes)

- **Service**: Maps, directions, and places search
- **Website**: https://console.cloud.google.com/
- **Setup Steps**:
  1. Create a Google Cloud project
  2. Enable these APIs:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Geocoding API
  3. Create credentials (API key)
  4. Add to frontend code (already configured in components)
  5. Optional: Add to `.env` file: `GOOGLE_MAPS_API_KEY=your_api_key_here`

### 3. Hotel API (Optional - RapidAPI)

- **Service**: Hotel booking data
- **Website**: https://rapidapi.com/
- **Setup Steps**:
  1. Sign up for RapidAPI
  2. Subscribe to a hotel API (e.g., Booking.com, Hotels.com)
  3. Get your RapidAPI key
  4. Add to `.env` file: `RAPIDAPI_KEY=your_rapidapi_key_here`

## Environment File Setup

Create or update the `/backend/.env` file with your API keys:

```env
# Weather API Configuration
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Hotel API Configuration (Optional)
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Testing the APIs

### Weather API Test

```bash
# Test weather endpoint
curl "http://localhost:8000/weather/?city=Colombo"
```

### Hotel API Test

```bash
# Test hotel endpoint
curl "http://localhost:8000/hotels/?city=Colombo"
```

### Google Maps Test

- The maps should load automatically in the frontend
- Check browser console for any API key errors

## Troubleshooting

### Weather API Issues

- **Error**: "API key not configured"
  - **Solution**: Add `OPENWEATHER_API_KEY` to `.env` file
- **Error**: "Invalid API key"
  - **Solution**: Check your OpenWeatherMap account and copy the correct key

### Google Maps Issues

- **Error**: Maps not loading
  - **Solution**: Check the API key in the frontend components
  - **Solution**: Enable required APIs in Google Cloud Console
- **Error**: "This page can't load Google Maps correctly"
  - **Solution**: Check billing is enabled in Google Cloud Console

### Hotel API Issues

- **Error**: No hotels found
  - **Solution**: This is normal - the app will show sample data
  - **Solution**: To get real data, configure RapidAPI key

## API Quotas and Costs

### OpenWeather API

- **Free Tier**: 1,000 calls/day
- **Cost**: Free for basic usage

### Google Maps API

- **Free Tier**: $200/month credit (covers typical usage)
- **Cost**: Pay-per-use after free credit

### Hotel APIs

- **Cost**: Varies by provider
- **Note**: Sample data is provided if no API is configured

## Security Notes

1. **Never commit API keys to version control**
2. **Use environment variables for all keys**
3. **Restrict Google Maps API key to your domain**
4. **Monitor usage to avoid unexpected charges**

## Current Status

✅ **Weather Service**: Enhanced with better error handling and temperature units
✅ **Google Maps Routes**: Multiple travel modes (driving, transit, walking)
✅ **Tourist Attractions Map**: Category filters, place names, and custom icons
✅ **Hotel Service**: Fallback data and multiple API support

All services will work with sample/fallback data even without API keys, but real data requires proper configuration.
