import React, { useEffect } from "react";
import { FiMapPin, FiCamera, FiClock } from "react-icons/fi";
import { useDestination } from "../../contexts/DestinationContext";
import { useGoogleMaps } from "../../contexts/GoogleMapsContext";
import useOptimizedImageLoading from "../../hooks/useOptimizedImageLoading";
import ProgressiveImage from "../ui/progressive-image";

const PlacesToVisit: React.FC = () => {
  const { destinationData, loading, error } = useDestination();
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMaps();

  // Function to check if Google Maps is available
  const isGoogleMapsAvailable = () => {
    try {
      return (
        isGoogleMapsLoaded &&
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        window.google.maps.places.PlacesService
      );
    } catch (error) {
      console.warn('Error checking Google Maps availability:', error);
      return false;
    }
  };

  // Function to wait for Google Maps to be available
  const waitForGoogleMaps = () => {
    return new Promise<void>((resolve) => {
      if (isGoogleMapsAvailable()) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 50 * 200ms = 10 seconds

      const checkInterval = setInterval(() => {
        attempts++;

        if (isGoogleMapsAvailable()) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('Google Maps failed to load after 10 seconds, proceeding with placeholders');
          resolve();
        }
      }, 200);
    });
  };

  const placesToDo = destinationData?.["things to do"] || [];
  
  const { placeImages, loadPlaceImages, isLoading: imagesLoading } = useOptimizedImageLoading({
    places: placesToDo,
    destinationName: destinationData?.destination_name || '',
    isGoogleMapsAvailable,
    waitForGoogleMaps
  });

  // Load place images after component has loaded
  useEffect(() => {
    if (destinationData && placesToDo.length > 0) {
      const timer = setTimeout(() => {
        loadPlaceImages();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [destinationData, placesToDo.length, loadPlaceImages]);

  if (loading) {
    return (
      <div id="places-to-visit" className="card p-6 mb-6 animate-pulse" style={{ background: 'var(--surface)' }}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-64"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-0 overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !destinationData) {
    return (
      <div id="places-to-visit" className="card p-6 mb-6 border-l-4" style={{ 
        background: 'var(--surface)', 
        borderLeftColor: '#EF4444' 
      }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>
          Places to Visit
        </h2>
        <p style={{ color: '#DC2626' }}>
          {error || "Places data not available"}
        </p>
      </div>
    );
  }

  if (placesToDo.length === 0) {
    return (
      <div id="places-to-visit" className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
          Places to Visit
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏞️</div>
          <p className="font-medium mb-2" style={{ color: 'var(--text-900)' }}>
            No places listed
          </p>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            Check back later for activity recommendations
          </p>
        </div>
      </div>
    );
  }

  // Activity helper functions
  const getActivityIcon = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (
      activityLower.includes("bridge") ||
      activityLower.includes("view") ||
      activityLower.includes("peak")
    ) {
      return <FiCamera className="w-5 h-5" />;
    } else if (
      activityLower.includes("hike") ||
      activityLower.includes("trek") ||
      activityLower.includes("walk")
    ) {
      return <FiMapPin className="w-5 h-5" />;
    } else {
      return <FiMapPin className="w-5 h-5" />;
    }
  };

  const getEstimatedTime = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes("hike") || activityLower.includes("trek")) {
      return "2-4 hours";
    } else if (
      activityLower.includes("bridge") ||
      activityLower.includes("view")
    ) {
      return "30-60 mins";
    } else if (
      activityLower.includes("falls") ||
      activityLower.includes("waterfall")
    ) {
      return "1-2 hours";
    } else {
      return "1-3 hours";
    }
  };

  const getActivityDescription = (activity: string) => {
    const descriptions: Record<string, string> = {
      "nine arch bridge":
        "Iconic colonial-era railway bridge surrounded by lush greenery and tea plantations.",
      "little adam's peak":
        "A gentle hike with panoramic views, perfect for sunrise or sunset.",
      "ella rock":
        "Challenging hike with breathtaking views of Ella Gap and surrounding mountains.",
      "ravana falls":
        "A beautiful waterfall named after the legendary king Ravana from Ramayana.",
      "bambaragala falls": "Hidden gem waterfall perfect for a refreshing dip.",
      "tea plantation":
        "Experience authentic Ceylon tea culture and learn about tea processing.",
      "koneswaram temple":
        "Ancient Hindu temple with stunning ocean views and rich history.",
      "fort frederick":
        "Historic Dutch fort offering panoramic views of Trincomalee harbor.",
      "nilaveli beach":
        "Pristine white sand beach perfect for swimming and snorkeling.",
      "pigeon island":
        "Marine national park ideal for diving and coral reef exploration.",
      "hot springs":
        "Natural hot springs believed to have therapeutic properties.",
    };

    const activityLower = activity.toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (activityLower.includes(key)) {
        return desc;
      }
    }
    return `Explore this amazing ${activity.toLowerCase()} and create unforgettable memories.`;
  };

  const getActivityCategory = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes("hike") || activityLower.includes("trek")) {
      return { name: "Hiking", color: "#10B981" };
    } else if (activityLower.includes("falls") || activityLower.includes("waterfall")) {
      return { name: "Nature", color: "#3B82F6" };
    } else if (activityLower.includes("bridge")) {
      return { name: "Sightseeing", color: "#F59E0B" };
    } else if (activityLower.includes("tea")) {
      return { name: "Cultural", color: "#8B5CF6" };
    } else if (activityLower.includes("temple") || activityLower.includes("fort")) {
      return { name: "Heritage", color: "#DC2626" };
    } else if (activityLower.includes("beach") || activityLower.includes("island")) {
      return { name: "Beach", color: "#06B6D4" };
    } else if (activityLower.includes("springs")) {
      return { name: "Wellness", color: "#84CC16" };
    } else {
      return { name: "Adventure", color: "#F97316" };
    }
  };

  return (
    <div id="places-to-visit" className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>
          Places to Visit in {destinationData.destination_name}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-600)' }}>
          Discover the must-visit attractions and activities that make this destination special
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {placesToDo.map((place, index) => {
          const placeImageData = placeImages.get(place);
          const category = getActivityCategory(place);

          return (
            <div
              key={index}
              className="group place-card card p-0 flex flex-col overflow-hidden transition-all duration-300 cursor-pointer hover:scale-102"
              style={{ 
                background: 'var(--surface)',
                boxShadow: 'var(--shadow)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
            >
              {/* Activity Image with Progressive Loading */}
              <div className="relative h-48 overflow-hidden">
                <ProgressiveImage
                  src={placeImageData?.imageUrl || null}
                  placeholder={placeImageData?.placeholder}
                  alt={place}
                  className="h-full transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Category Badge */}
                <div
                  className="absolute top-3 left-3 px-2 py-1 rounded text-white text-xs font-medium backdrop-blur-sm"
                  style={{
                    backgroundColor: `${category.color}CC`, // Add transparency
                    border: `1px solid ${category.color}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {category.name}
                </div>
              </div>

              {/* Activity Content */}
              <div className="flex-grow p-4">
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-900)' }}>
                  {place}
                </h3>

                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-600)' }}>
                  {getActivityDescription(place)}
                </p>

                {/* Activity Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-600)' }}>
                    <FiClock className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                    <span>Estimated time: {getEstimatedTime(place)}</span>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: 'var(--text-600)' }}>
                    <FiMapPin className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                    <span>Location: {destinationData.destination_name}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    const query = `${place} ${destinationData.destination_name} Sri Lanka`;
                    window.open(
                      `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
                      "_blank",
                    );
                  }}
                  className="btn btn-primary btn-md w-full flex items-center justify-center gap-2 transition-all duration-200 hover:transform hover:scale-105"
                >
                  <FiMapPin className="w-4 h-4" />
                  View on Map
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Stats (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 rounded text-xs" style={{ 
          background: 'var(--surface-alt)', 
          color: 'var(--text-600)' 
        }}>
          <div className="flex items-center gap-4 flex-wrap">
            <span>🗺️ Google Maps: {isGoogleMapsLoaded ? 'Ready' : 'Loading...'}</span>
            <span>🖼️ Images: {placeImages.size}/{placesToDo.length}</span>
            <span>⏳ Loading: {imagesLoading ? 'Yes' : 'No'}</span>
            <span>📦 Cached: {Array.from(placeImages.values()).filter(img => img.imageUrl && !img.isLoading).length}</span>
          </div>
        </div>
      )}

      {/* Additional Tips */}
      <div className="p-4 rounded-lg border-l-4" style={{ 
        background: 'var(--surface-alt)', 
        borderLeftColor: '#22C55E' 
      }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🌟</span>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
              Travel Tip
            </p>
            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
              Plan your visits based on weather conditions and your fitness level. 
              Early morning visits often provide the best views and fewer crowds.
              {imagesLoading && ' Images are loading in the background for better performance.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacesToVisit;
