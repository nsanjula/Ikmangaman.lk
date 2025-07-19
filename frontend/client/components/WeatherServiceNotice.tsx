import React from "react";

interface WeatherServiceNoticeProps {
  show: boolean;
  type?: "weather" | "general";
}

const WeatherServiceNotice: React.FC<WeatherServiceNoticeProps> = ({
  show,
  type = "weather",
}) => {
  if (!show) return null;

  const getMessage = () => {
    if (type === "general") {
      return (
        <p className="text-sm">
          <strong>Service Notice:</strong> Some destination information is
          temporarily limited due to external service maintenance. Basic
          information is shown below. Please try again later for complete
          details.
        </p>
      );
    }

    return (
      <p className="text-sm">
        <strong>Weather Service Notice:</strong> Weather data is temporarily
        unavailable due to external service issues. Other destination
        information is still available. Please try again later.
      </p>
    );
  };

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">{getMessage()}</div>
      </div>
    </div>
  );
};

export default WeatherServiceNotice;
