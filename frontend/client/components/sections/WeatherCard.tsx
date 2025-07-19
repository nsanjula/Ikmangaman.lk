import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { useDestinationData } from "../../hooks/useDestinationData";

interface WeatherData {
  date: string;
  temperature: string;
  weather: string;
  humidity: string;
  visibility: string;
  icon_url: string;
}

const WeatherCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: destinationData, loading, error } = useDestinationData(id);
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
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Weather Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-cyan-600 p-4 rounded-lg shadow">
              <div className="animate-pulse">
                <div className="h-4 bg-cyan-500 rounded w-full mb-2"></div>
                <div className="w-8 h-8 bg-cyan-500 rounded mx-auto mb-2"></div>
                <div className="h-6 bg-cyan-500 rounded w-3/4 mx-auto mb-1"></div>
                <div className="h-4 bg-cyan-500 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Weather Forecast</h2>
        <div className="bg-red-100 border border-red-300 p-6 rounded-lg">
          <p className="text-red-700 font-medium">
            Failed to load weather data
          </p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Weather Forecast</h2>
        <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-lg">
          <p className="text-yellow-700 font-medium">
            Weather data not available
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            Weather service may be temporarily unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">5-Day Weather Forecast</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {weatherData.slice(0, 5).map((day, index) => {
          const dateInfo = formatDate(day.date);
          return (
            <div
              key={day.date}
              className={`p-4 rounded-lg shadow-lg text-white ${
                index === 0
                  ? "bg-gradient-to-br from-cyan-600 to-cyan-700"
                  : "bg-gradient-to-br from-cyan-500 to-cyan-600"
              }`}
            >
              {/* Date */}
              <div className="text-center mb-3">
                <p className="text-sm font-medium">
                  {index === 0 ? "Today" : dateInfo.day}
                </p>
                <p className="text-xs text-cyan-100">{dateInfo.date}</p>
              </div>

              {/* Weather Icon */}
              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.weather, "w-8 h-8")}
              </div>

              {/* Temperature */}
              <div className="text-center mb-3">
                <p className="text-xl font-bold">{day.temperature}</p>
              </div>

              {/* Weather Description */}
              <p className="text-xs text-center text-cyan-100 mb-2 capitalize">
                {day.weather}
              </p>

              {/* Weather Details */}
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <FiDroplet className="w-3 h-3 text-cyan-200" />
                  <span className="text-cyan-100">{day.humidity}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <FiEye className="w-3 h-3 text-cyan-200" />
                  <span className="text-cyan-100">{day.visibility}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          🌤️ Weather forecast shows the next 5 days to help you plan your visit
          to {destinationData?.destination_name}.
        </p>
      </div>
    </div>
  );
};

export default WeatherCard;
