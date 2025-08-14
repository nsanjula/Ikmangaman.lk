import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface Coordinates {
  lat: number;
  lng: number;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  rating?: number;
  vicinity: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: any[];
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  icon?: string;
}

interface TouristAttractionsMapComponentProps {
  destination: Coordinates;
  destinationName: string;
  className?: string;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

// Define custom marker icons for different place types using the provided marker images
const getPlaceIcon = (types: string[]) => {
  const iconMap: { [key: string]: { markerUrl: string; bgColor: string } } = {
    tourist_attraction: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800",
      bgColor: "#9333EA",
    },
    museum: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F618f81b4d111438e96751c3297dec1c0?format=webp&width=800",
      bgColor: "#A0522D",
    },
    park: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F3ea4f89c53214306bc32b0479b56b0fe?format=webp&width=800",
      bgColor: "#5F8A5F",
    },
    restaurant: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fa28050a33fee42049a939ef4384447d2?format=webp&width=800",
      bgColor: "#DAA520",
    },
    lodging: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F0d9ec12e71ea4301b961706ff64b213b?format=webp&width=800",
      bgColor: "#1E40AF",
    },
    church: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800",
      bgColor: "#9333EA",
    },
    temple: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800",
      bgColor: "#9333EA",
    },
    zoo: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F3ea4f89c53214306bc32b0479b56b0fe?format=webp&width=800",
      bgColor: "#5F8A5F",
    },
    aquarium: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F3ea4f89c53214306bc32b0479b56b0fe?format=webp&width=800",
      bgColor: "#5F8A5F",
    },
    shopping_mall: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fa28050a33fee42049a939ef4384447d2?format=webp&width=800",
      bgColor: "#DAA520",
    },
    amusement_park: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800",
      bgColor: "#9333EA",
    },
    natural_feature: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F3ea4f89c53214306bc32b0479b56b0fe?format=webp&width=800",
      bgColor: "#5F8A5F",
    },
    point_of_interest: {
      markerUrl:
        "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800",
      bgColor: "#9333EA",
    },
  };

  // Find the best matching type
  for (const type of types) {
    if (iconMap[type]) {
      return iconMap[type];
    }
  }

  // Default icon
  return iconMap.tourist_attraction;
};

const TouristAttractionsMapComponent: React.FC<
  TouristAttractionsMapComponentProps
> = ({ destination, destinationName, className = "" }) => {
  const [map, setMap] = useState<any>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceDetails[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const center = destination;

  const onLoad = useCallback((map: any) => {
    setMap(map);
    setIsLoading(false);
    setLoadError(null);
  }, []);

  const onLoadError = useCallback((error: Error) => {
    console.error("Google Maps failed to load:", error);
    setLoadError(
      "Failed to load Google Maps. Please check your internet connection and try again.",
    );
    setIsLoading(false);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Search for nearby tourist attractions
  useEffect(() => {
    if (
      map &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      try {
        const service = new window.google.maps.places.PlacesService(map);

        // Define search types based on category
        const searchTypes =
          selectedCategory === "all"
            ? ["tourist_attraction", "museum", "park", "point_of_interest"]
            : [selectedCategory];

        const allPlaces: PlaceDetails[] = [];
        let searchesCompleted = 0;

        searchTypes.forEach((type) => {
          const request = {
            location: destination,
            radius: 20000, // 20km radius for better coverage
            type: type as any, // google.maps.places.PlaceType compatibility
          };

          service.nearbySearch(request, (results, status) => {
            searchesCompleted++;

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              const filteredResults = results
                .filter((place) => place.name && place.geometry?.location)
                .map((place) => ({
                  place_id: place.place_id || "",
                  name: place.name || "Unknown",
                  rating: place.rating,
                  vicinity: place.vicinity || "",
                  types: place.types || [],
                  geometry: {
                    location: {
                      lat: place.geometry!.location!.lat(),
                      lng: place.geometry!.location!.lng(),
                    },
                  },
                  photos: place.photos,
                  price_level: place.price_level,
                  opening_hours: place.opening_hours,
                  icon: place.icon,
                }));

              allPlaces.push(...filteredResults);
            }

            // When all searches are completed, update the state
            if (searchesCompleted === searchTypes.length) {
              // Remove duplicates and sort by rating
              const uniquePlaces = allPlaces
                .filter(
                  (place, index, self) =>
                    index ===
                    self.findIndex((p) => p.place_id === place.place_id),
                )
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 25); // Show top 25 attractions

              setNearbyPlaces(uniquePlaces);
            }
          });
        });
      } catch (error) {
        console.error("Error accessing Google Maps Places service:", error);
      }
    }
  }, [map, destination, selectedCategory]);

  // Filter places based on selected category
  const filteredPlaces = nearbyPlaces.filter((place) => {
    if (selectedCategory === "all") return true;
    return place.types.includes(selectedCategory);
  });

  // Show error state if Google Maps failed to load
  if (loadError) {
    return (
      <div className={`${className}`}>
        <div className="w-full h-96 bg-red-100 border border-red-300 rounded-lg flex items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold mb-2">Map Unavailable</div>
            <div className="text-sm">{loadError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700`}
    >
      {/* Styled Filters */}
      <div className="mb-6">
        {/* Category Filter with Connected Rectangular Boxes */}
        <div className="flex h-12 rounded-lg overflow-hidden shadow-sm">
          {[
            { value: "all", label: "All", icon: null },
            {
              value: "park",
              label: "Parks",
              icon: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F3ea4f89c53214306bc32b0479b56b0fe?format=webp&width=800",
            },
            {
              value: "museum",
              label: "Museums",
              icon: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F618f81b4d111438e96751c3297dec1c0?format=webp&width=800",
            },
            {
              value: "tourist_attraction",
              label: "Attractions",
              icon: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800",
            },
            {
              value: "lodging",
              label: "Hotels",
              icon: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F0d9ec12e71ea4301b961706ff64b213b?format=webp&width=800",
            },
            {
              value: "restaurant",
              label: "Restaurants",
              icon: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fa28050a33fee42049a939ef4384447d2?format=webp&width=800",
            },
          ].map((category, index) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`relative flex flex-col items-center justify-center px-2 py-1 text-sm font-medium transition-all duration-200 h-full flex-1 ${
                selectedCategory === category.value
                  ? "bg-cyan-600 text-white shadow-md z-10"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {category.icon && (
                <img
                  src={category.icon}
                  alt={category.label}
                  className="w-6 h-6 mb-0.5 object-contain"
                />
              )}
              <span className="text-xs font-medium w-full text-center leading-tight">
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* Show Labels Toggle */}
        <div className="mt-4 flex justify-center">
          <label className="inline-flex items-center gap-2 text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Show place names
            </span>
          </label>
        </div>
      </div>

      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onError={onLoadError}
        loadingElement={
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading Attractions Map...</div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "all",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ visibility: "on" }],
              },
            ],
          }}
        >
          {/* Destination Marker */}
          <Marker
            position={destination}
            title={destinationName}
            icon={{
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#8B5CF6">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              `),
              scaledSize: window.google?.maps?.Size
                ? new window.google.maps.Size(40, 40)
                : undefined,
            }}
          />

          {/* Tourist Attraction Markers */}
          {filteredPlaces.map((place) => {
            const placeIcon = getPlaceIcon(place.types);
            return (
              <Marker
                key={place.place_id}
                position={place.geometry.location}
                title={place.name}
                onClick={() => setSelectedPlace(place)}
                icon={{
                  url: placeIcon.markerUrl,
                  scaledSize: window.google?.maps?.Size
                    ? new window.google.maps.Size(32, 32)
                    : undefined,
                }}
                label={
                  showLabels
                    ? {
                        text:
                          place.name.length > 15
                            ? place.name.substring(0, 12) + "..."
                            : place.name,
                        color: "#6B7280",
                        fontSize: "12px",
                        fontWeight: "bold",
                        className: "place-label",
                      }
                    : undefined
                }
              />
            );
          })}

          {/* Info Window for Selected Place */}
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.geometry.location}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-3 max-w-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {selectedPlace.name}
                </h3>

                {selectedPlace.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium">
                      {selectedPlace.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">/5</span>
                  </div>
                )}

                {selectedPlace.vicinity && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {selectedPlace.vicinity}
                  </p>
                )}

                {selectedPlace.opening_hours?.open_now !== undefined && (
                  <div
                    className={`text-xs px-2 py-1 rounded mb-2 inline-block ${
                      selectedPlace.opening_hours.open_now
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedPlace.opening_hours.open_now
                      ? "Open now"
                      : "Closed"}
                  </div>
                )}

                {selectedPlace.price_level !== undefined && (
                  <div className="text-sm mb-2">
                    <span className="text-gray-600">Price: </span>
                    <span className="text-green-600">
                      {"$".repeat(selectedPlace.price_level)}
                      {"$"
                        .repeat(4 - selectedPlace.price_level)
                        .replace(/\$/g, "○")}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPlace.types.slice(0, 3).map((type, index) => {
                    const icon = getPlaceIcon([type]);
                    return (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: icon.bgColor + "20",
                          color: icon.bgColor,
                        }}
                      >
                        <span>📍</span>
                        {type.replace(/_/g, " ")}
                      </span>
                    );
                  })}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Information Panel */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Showing {filteredPlaces.length} locations</strong> within 20km
          radius
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
          <span>💡</span>
          <span>
            Click map markers for details • Use filters above to show specific
            types • Toggle place names with checkbox
          </span>
        </div>
      </div>
    </div>
  );
};

export default TouristAttractionsMapComponent;
