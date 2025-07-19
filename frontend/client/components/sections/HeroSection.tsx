import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiMapPin, FiClock, FiNavigation } from "react-icons/fi";
import { useDestinationData } from "../../hooks/useDestinationData";
import WeatherServiceNotice from "../WeatherServiceNotice";
import BackendOfflineNotice from "../BackendOfflineNotice";
import QuickBackendFix from "../QuickBackendFix";

const HeroSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: destinationData,
    loading,
    error,
    retry,
  } = useDestinationData(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showServiceNotice, setShowServiceNotice] = useState(false);

  // Default fallback images
  const defaultImages = [
    "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594978788872-3c8bddba3b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594978854110-6d0c4a2a9e97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  ];

  useEffect(() => {
    if (destinationData) {
      // Check if this is fallback data
      if (
        destinationData.description?.includes(
          "temporarily limited due to service maintenance",
        )
      ) {
        setShowServiceNotice(true);
      }
    }
  }, [destinationData]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === defaultImages.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? defaultImages.length - 1 : prevIndex - 1,
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 bg-cyan-500 p-6 rounded-lg shadow-md animate-pulse">
        <div className="flex-1">
          <div className="h-10 bg-cyan-400 rounded mb-4"></div>
          <div className="h-4 bg-cyan-400 rounded mb-2"></div>
          <div className="h-4 bg-cyan-400 rounded mb-2"></div>
          <div className="h-4 bg-cyan-400 rounded mb-6 w-3/4"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-cyan-400 rounded w-32"></div>
            <div className="h-10 bg-cyan-400 rounded w-32"></div>
          </div>
        </div>
        <div className="w-full md:w-2/5 h-64 md:h-80 bg-cyan-400 rounded-lg"></div>
      </div>
    );
  }

  if (error || !destinationData) {
    const isQuestionnaireError = error?.includes(
      "complete the travel questionnaire",
    );
    const isAuthError =
      error?.includes("log in") ||
      error?.includes("session has expired") ||
      error?.includes("Authentication failed");

    return (
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 bg-red-100 border border-red-300 p-6 rounded-lg">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4 text-red-800">
            Error Loading Destination
          </h1>
          <p className="text-red-600 mb-4">
            {error || "Destination data not available"}
          </p>
          {isQuestionnaireError && (
            <div className="flex gap-2">
              <a
                href="/profile"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Complete Questionnaire
              </a>
              <a
                href="/recommendations"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                View Recommendations
              </a>
            </div>
          )}
          {isAuthError && (
            <div>
              <div className="flex gap-2 mb-3">
                <a
                  href="/login"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Log In
                </a>
                <button
                  onClick={retry}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded">
                <strong>Authentication Issue:</strong> Your login session may
                have expired. Try clicking "Try Again" first, or log in again if
                the issue persists.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Use only destination image from database
  const images = destinationData["destiantion image"]
    ? [`http://localhost:8000${destinationData["destiantion image"]}`]
    : defaultImages.slice(0, 1); // Only use first default image as fallback

  return (
    <div>
      <WeatherServiceNotice show={showServiceNotice} type="general" />
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 rounded-lg shadow-md text-white">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4 text-white">
            {destinationData.destination_name}, Sri Lanka
          </h1>

          <p className="text-lg mb-6 text-cyan-50 leading-relaxed">
            {destinationData.description}
          </p>

          {/* Trip Information */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-cyan-100">
              <FiNavigation className="w-5 h-5" />
              <span className="font-medium">Distance:</span>
              <span>{destinationData.distance} km</span>
            </div>

            <div className="flex items-center gap-3 text-cyan-100">
              <FiClock className="w-5 h-5" />
              <span className="font-medium">Travel Time:</span>
              <span>{destinationData.duration}</span>
            </div>

            <div className="flex items-center gap-3 text-cyan-100">
              <FiMapPin className="w-5 h-5" />
              <span className="font-medium">Coordinates:</span>
              <span>
                {destinationData.latitude.toFixed(4)},{" "}
                {destinationData.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Things to Do */}
          {destinationData["things to do"] &&
            destinationData["things to do"].length > 0 && (
              <div className="mb-6">
                <p className="font-semibold mb-2 text-cyan-100">
                  Must-Visit Attractions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {destinationData["things to do"]
                    .slice(0, 4)
                    .map((activity, index) => (
                      <span
                        key={index}
                        className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
                      >
                        {activity.trim()}
                      </span>
                    ))}
                  {destinationData["things to do"].length > 4 && (
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      +{destinationData["things to do"].length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => scrollToSection("places-to-visit")}
              className="bg-white text-cyan-600 hover:bg-gray-100 px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Explore Activities
            </button>
            <button
              onClick={() => scrollToSection("map-section")}
              className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg transition-colors font-medium border border-cyan-400"
            >
              View Map
            </button>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="w-full md:w-2/5 relative">
          <img
            src={images[currentImageIndex]}
            alt={destinationData.destination_name}
            className="rounded-lg w-full h-64 md:h-80 object-cover shadow-lg"
            onError={(e) => {
              // Fallback to default image if destination image fails
              if (currentImageIndex === 0 && images.length > 1) {
                setCurrentImageIndex(1);
              }
            }}
          />

          {images.length > 1 && (
            <>
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <button
                  onClick={prevImage}
                  className="bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition-all"
                >
                  <span className="sr-only">Previous image</span>
                  &lt;
                </button>
                <button
                  onClick={nextImage}
                  className="bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 transition-all"
                >
                  <span className="sr-only">Next image</span>
                  &gt;
                </button>
              </div>

              <div className="flex justify-center mt-2 gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentImageIndex === index
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
