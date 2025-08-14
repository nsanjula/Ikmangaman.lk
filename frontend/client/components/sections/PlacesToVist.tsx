import React, { useState, useEffect } from "react";
import { FiMapPin, FiCamera, FiClock } from "react-icons/fi";
import { useDestination } from "../../contexts/DestinationContext";
import { useGoogleMaps } from "../../contexts/GoogleMapsContext";

interface PlaceImage {
  placeName: string;
  imageUrl: string | null;
  isLoading: boolean;
}

const PlacesToVisit: React.FC = () => {
  const { destinationData, loading, error } = useDestination();
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMaps();
  const [placeImages, setPlaceImages] = useState<Map<string, PlaceImage>>(
    new Map(),
  );

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

      // Wait up to 10 seconds for Google Maps to load
      let attempts = 0;
      const maxAttempts = 50; // 50 * 200ms = 10 seconds

      const checkInterval = setInterval(() => {
        attempts++;

        if (isGoogleMapsAvailable()) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('Google Maps failed to load after 10 seconds, proceeding without images');
          resolve();
        }
      }, 200);
    });
  };

  // Function to fetch place image from Google Places API
  const fetchPlaceImage = async (
    placeName: string,
    destinationName: string,
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isGoogleMapsAvailable()) {
        console.warn('Google Maps not available for place:', placeName);
        resolve(null);
        return;
      }

      try {
        // Double-check Google Maps availability before creating service
        if (!window.google?.maps?.places?.PlacesService) {
          console.warn('PlacesService not available for place:', placeName);
          resolve(null);
          return;
        }

        const service = new window.google.maps.places.PlacesService(
          document.createElement("div"),
        );

        const request = {
          query: `${placeName} ${destinationName} Sri Lanka`,
          fields: ["place_id", "name", "photos"],
        };

        service.textSearch(request, (results, status) => {
          try {
            // Check if Google Maps is still available in callback
            if (!window.google?.maps?.places?.PlacesServiceStatus) {
              console.warn('Google Maps PlacesServiceStatus not available in callback for:', placeName);
              resolve(null);
              return;
            }

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results &&
              results[0] &&
              results[0].photos &&
              results[0].photos.length > 0
            ) {
              try {
                const photoUrl = results[0].photos[0].getUrl({
                  maxWidth: 400,
                  maxHeight: 300,
                });
                resolve(photoUrl);
              } catch (error) {
                console.warn(`Error getting photo URL for ${placeName}:`, error);
                resolve(null);
              }
            } else {
              console.warn(`No photos found for ${placeName}, status:`, status);
              resolve(null);
            }
          } catch (callbackError) {
            console.warn(`Error in textSearch callback for ${placeName}:`, callbackError);
            resolve(null);
          }
        });
      } catch (error) {
        console.warn(`Error fetching image for ${placeName}:`, error);
        resolve(null);
      }
    });
  };

  // Function to load images for all places
  const loadPlaceImages = async (places: string[], destinationName: string) => {
    if (!places.length) {
      console.log("No places to load images for");
      return;
    }

    try {
      // Wait for Google Maps to be available
      await waitForGoogleMaps();

      if (!isGoogleMapsAvailable()) {
        console.warn("Google Maps not available - skipping image loading");
        return;
      }

      console.log(`Starting to load images for ${places.length} places`);
    } catch (error) {
      console.error("Error in loadPlaceImages setup:", error);
      return;
    }

    // Initialize loading state for all places
    const initialImageMap = new Map<string, PlaceImage>();
    places.forEach((place) => {
      initialImageMap.set(place, {
        placeName: place,
        imageUrl: null,
        isLoading: true,
      });
    });
    setPlaceImages(initialImageMap);

    // Fetch images one by one to avoid rate limiting
    for (const place of places) {
      try {
        const imageUrl = await fetchPlaceImage(place, destinationName);

        setPlaceImages((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(place, {
            placeName: place,
            imageUrl,
            isLoading: false,
          });
          return newMap;
        });

        // Add a small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`Failed to load image for ${place}:`, error);
        setPlaceImages((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(place, {
            placeName: place,
            imageUrl: null,
            isLoading: false,
          });
          return newMap;
        });
      }
    }
  };

  // Load place images after component has loaded
  useEffect(() => {
    if (
      destinationData &&
      destinationData["things to do"] &&
      destinationData["things to do"].length > 0 &&
      isGoogleMapsLoaded
    ) {
      // Small delay to ensure all Google Maps services are ready
      const timer = setTimeout(async () => {
        try {
          await loadPlaceImages(
            destinationData["things to do"],
            destinationData.destination_name,
          );
        } catch (error) {
          console.error("Error loading place images:", error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [destinationData, isGoogleMapsLoaded]);

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

  const placesToDo = destinationData["things to do"] || [];

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

  // Sample activity categories and times (you can enhance this with more detailed data)
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
          const hasRealImage = placeImageData && placeImageData.imageUrl && !placeImageData.isLoading;
          const category = getActivityCategory(place);

          return (
            <div
              key={index}
              className="card p-0 flex flex-col overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
              style={{ background: 'var(--surface)' }}
            >
              {/* Activity Image */}
              <div className="relative h-48 overflow-hidden">
                {hasRealImage && (
                  <img
                    src={placeImageData.imageUrl}
                    alt={place}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement
                        ?.querySelector(".fallback-content")
                        ?.classList.remove("hidden");
                    }}
                  />
                )}
                
                <div
                  className={`fallback-content absolute inset-0 flex flex-col items-center justify-center text-center p-4 ${hasRealImage ? "hidden" : ""}`}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary-600), var(--accent))',
                    color: 'white'
                  }}
                >
                  <div className="text-4xl mb-3">🏞️</div>
                  <div className="text-sm font-medium">{place}</div>
                </div>

                {/* Loading indicator */}
                {placeImageData && placeImageData.isLoading && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary-600)' }}></div>
                  </div>
                )}

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
                  className="btn btn-primary btn-md w-full flex items-center justify-center gap-2"
                >
                  <FiMapPin className="w-4 h-4" />
                  View on Map
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
            </p>
          </div>
        </div>
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 rounded text-xs" style={{ 
          background: 'var(--surface-alt)', 
          color: 'var(--text-600)' 
        }}>
          Google Maps Ready: {isGoogleMapsLoaded ? 'Yes' : 'No'} |
          Images Loaded: {placeImages.size} |
          Places: {placesToDo.length}
        </div>
      )}
    </div>
  );
};

export default PlacesToVisit;
