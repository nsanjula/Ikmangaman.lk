import React, { useState, useEffect } from "react";
import { FiMapPin, FiClock, FiNavigation } from "react-icons/fi";
import { useDestination } from "../../contexts/DestinationContext";
import WeatherServiceNotice from "../WeatherServiceNotice";
import BackendOfflineNotice from "../BackendOfflineNotice";
import QuickBackendFix from "../QuickBackendFix";

// API Base URL for image URL construction
const API_BASE_URL = "http://localhost:8000";

const HeroSection: React.FC = () => {
  const {
    destinationData,
    loading,
    error,
    retry,
  } = useDestination();
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
      <div className="card p-6 mb-6 animate-pulse" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-200 rounded-lg"></div>
        </div>
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
      <div className="card p-6 mb-6 border-l-4" style={{ 
        background: 'var(--surface)', 
        borderLeftColor: '#EF4444' 
      }}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#DC2626' }}>
              Error Loading Destination
            </h1>
            <p className="mb-4" style={{ color: '#DC2626' }}>
              {error || "Destination data not available"}
            </p>
            {isQuestionnaireError && (
              <div className="flex gap-2">
                <a
                  href="/profile"
                  className="btn btn-primary btn-md"
                >
                  Complete Questionnaire
                </a>
                <a
                  href="/recommendations"
                  className="btn btn-secondary btn-md"
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
                    className="btn btn-primary btn-md"
                  >
                    Log In
                  </a>
                </div>
                <div className="text-sm p-3 rounded" style={{ 
                  background: '#FEF2F2', 
                  color: '#B91C1C' 
                }}>
                  <strong>Authentication Issue:</strong> Your login session has
                  expired. Please log in again to access this destination.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Use only destination image from database
  const images = destinationData["destination image"]
    ? [`${API_BASE_URL}${destinationData["destination image"]}`]
    : defaultImages.slice(0, 1); // Only use first default image as fallback

  return (
    <div>
      <WeatherServiceNotice show={showServiceNotice} type="general" />
      <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
              {destinationData.destination_name}, Sri Lanka
            </h1>

            <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-600)' }}>
              {destinationData.description}
            </p>

            {/* Trip Information */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3" style={{ color: 'var(--text-600)' }}>
                <FiNavigation className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                <span className="font-medium">Distance:</span>
                <span>{destinationData.distance} km</span>
              </div>

              <div className="flex items-center gap-3" style={{ color: 'var(--text-600)' }}>
                <FiClock className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                <span className="font-medium">Travel Time:</span>
                <span>{destinationData.duration}</span>
              </div>

              <div className="flex items-center gap-3" style={{ color: 'var(--text-600)' }}>
                <FiMapPin className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
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
                  <p className="font-semibold mb-3" style={{ color: 'var(--text-900)' }}>
                    Must-Visit Attractions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destinationData["things to do"]
                      .slice(0, 4)
                      .map((activity, index) => (
                        <span
                          key={index}
                          className="chip chip-selected"
                        >
                          {activity.trim()}
                        </span>
                      ))}
                    {destinationData["things to do"].length > 4 && (
                      <span className="chip">
                        +{destinationData["things to do"].length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => scrollToSection("places-to-visit")}
                className="btn btn-primary btn-md flex items-center gap-2"
              >
                <span>🎯</span>
                Explore Activities
              </button>
              <button
                onClick={() => scrollToSection("map-section")}
                className="btn btn-secondary btn-md flex items-center gap-2"
              >
                <FiMapPin className="w-4 h-4" />
                View Map
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-2/5 relative">
            <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={destinationData.destination_name}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                onError={(e) => {
                  // Fallback to default image if destination image fails
                  console.warn("Failed to load destination image:", images[currentImageIndex]);
                  if (currentImageIndex === 0 && images[0] !== defaultImages[0]) {
                    // If we're showing the backend image and it fails, fallback to default
                    (e.target as HTMLImageElement).src = defaultImages[0];
                  }
                }}
              />

              {images.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button
                      onClick={prevImage}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all"
                      style={{ 
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all"
                      style={{ 
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      ›
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
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
      </div>
    </div>
  );
};

export default HeroSection;
