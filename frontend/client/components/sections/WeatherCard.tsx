import React, { useState, useEffect } from "react";
import {
  FiSun,
  FiCloud,
  FiCloudRain,
  FiCloudSnow,
  FiWind,
  FiDroplet,
  FiThermometer,
  FiEye,
} from "react-icons/fi";
import { useDestination } from "../../contexts/DestinationContext";

interface WeatherData {
  date: string;
  temperature: string;
  weather: string;
  humidity: string;
  visibility: string;
  icon_url: string;
}

const WeatherCard: React.FC = () => {
  const { destinationData, loading, error } = useDestination();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  useEffect(() => {
    if (!destinationData) return;

    // Extract weather data from destination data
    try {
      const weather = destinationData["weather data"];
      if (weather && Array.isArray(weather)) {
        setWeatherData(weather);
      }
    } catch (error) {
      console.error("Error extracting weather data:", error);
    }
  }, [destinationData]);

  const getWeatherIcon = (condition?: string, size: string = "w-8 h-8") => {
    if (!condition) return <FiSun className={`${size} text-yellow-500`} />;

    const lowercaseCondition = condition.toLowerCase();

    if (
      lowercaseCondition.includes("rain") ||
      lowercaseCondition.includes("shower")
    ) {
      return <FiCloudRain className={`${size} text-blue-500`} />;
    } else if (
      lowercaseCondition.includes("cloud") ||
      lowercaseCondition.includes("overcast")
    ) {
      return <FiCloud className={`${size} text-gray-500`} />;
    } else if (lowercaseCondition.includes("snow")) {
      return <FiCloudSnow className={`${size} text-blue-200`} />;
    } else if (
      lowercaseCondition.includes("clear") ||
      lowercaseCondition.includes("sunny")
    ) {
      return <FiSun className={`${size} text-yellow-500`} />;
    } else {
      return <FiSun className={`${size} text-yellow-500`} />;
    }
  };

  const getWeatherColor = (condition?: string) => {
    if (!condition) return { bg: "#FEF3C7", text: "#92400E" };

    const lowercaseCondition = condition.toLowerCase();

    if (lowercaseCondition.includes("rain") || lowercaseCondition.includes("shower")) {
      return { bg: "#DBEAFE", text: "#1E40AF" };
    } else if (lowercaseCondition.includes("cloud") || lowercaseCondition.includes("overcast")) {
      return { bg: "#F3F4F6", text: "#374151" };
    } else if (lowercaseCondition.includes("clear") || lowercaseCondition.includes("sunny")) {
      return { bg: "#FEF3C7", text: "#92400E" };
    } else {
      return { bg: "#E0F2FE", text: "#0C4A6E" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  };

  if (loading) {
    return (
      <div className="card p-6 mb-6 animate-pulse" style={{ background: 'var(--surface)' }}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-56"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-4" style={{ background: 'var(--surface)' }}>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-3"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 mb-6 border-l-4" style={{ 
        background: 'var(--surface)', 
        borderLeftColor: '#EF4444' 
      }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>
          Weather Forecast
        </h2>
        <p style={{ color: '#DC2626' }}>
          Failed to load weather data: {error}
        </p>
      </div>
    );
  }

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FiSun className="w-6 h-6" style={{ color: 'var(--primary-600)' }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-900)' }}>
              Weather Forecast
            </h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            Plan your visit to {destinationData?.destination_name} with detailed weather information
          </p>
        </div>
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
              background: 'var(--surface-alt)'
            }}>
              <FiSun className="w-10 h-10" style={{ color: 'var(--primary-600)' }} />
            </div>
          </div>
          <p className="text-lg font-semibold mb-3 text-center" style={{ color: 'var(--text-900)' }}>
            Weather Information Unavailable
          </p>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-600)' }}>
            We're currently unable to fetch weather data for this destination. Please check back later for detailed weather forecasts to help plan your trip.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FiSun className="w-6 h-6" style={{ color: 'var(--primary-600)' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-900)' }}>
            5-Day Weather Forecast
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-600)' }}>
          Plan your visit to {destinationData?.destination_name} with detailed weather information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {weatherData.slice(0, 5).map((day, index) => {
          const dateInfo = formatDate(day.date);
          const weatherColor = getWeatherColor(day.weather);
          
          return (
            <div
              key={day.date}
              className="card p-4 text-center"
              style={{ background: 'var(--surface)' }}
            >
              {/* Date Header */}
              <div className="mb-4">
                <p className="text-sm font-bold" style={{ color: 'var(--text-900)' }}>
                  {index === 0 ? "Today" : dateInfo.day}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-600)' }}>
                  {dateInfo.date}
                </p>
              </div>

              {/* Weather Icon */}
              <div className="flex justify-center mb-4">
                {getWeatherIcon(day.weather, "w-10 h-10")}
              </div>

              {/* Temperature */}
              <div className="mb-3">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-900)' }}>
                  {day.temperature}
                </p>
              </div>

              {/* Weather Description */}
              <div className="mb-4">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                  style={{
                    backgroundColor: weatherColor.bg,
                    color: weatherColor.text
                  }}
                >
                  {day.weather}
                </span>
              </div>

              {/* Weather Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-center gap-2">
                  <FiDroplet className="w-3 h-3" style={{ color: 'var(--primary-600)' }} />
                  <span style={{ color: 'var(--text-600)' }}>
                    {day.humidity}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FiEye className="w-3 h-3" style={{ color: 'var(--primary-600)' }} />
                  <span style={{ color: 'var(--text-600)' }}>
                    {day.visibility}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weather Tips */}
      <div className="p-4 rounded-lg border-l-4" style={{ 
        background: 'var(--surface-alt)', 
        borderLeftColor: '#F59E0B' 
      }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🌤️</span>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
              Weather Planning Tips
            </p>
            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
              Check the weather forecast to pack appropriate clothing and plan your outdoor activities. 
              Weather conditions can change rapidly in mountainous areas.
            </p>
          </div>
        </div>
      </div>

      {/* Current Conditions Summary */}
      {weatherData.length > 0 && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--surface-alt)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-900)' }}>
                Today's Conditions
              </p>
              <p className="text-xs" style={{ color: 'var(--text-600)' }}>
                Perfect for your {destinationData?.destination_name} adventure
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData[0]?.weather, "w-6 h-6")}
                <span className="font-bold" style={{ color: 'var(--text-900)' }}>
                  {weatherData[0]?.temperature}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
