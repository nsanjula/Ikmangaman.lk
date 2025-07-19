import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyChfPh1WAJCQBTXIBnx9WkOs_gU7YaTw4Y";

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

// Define icon colors for different place types
const getPlaceIcon = (types: string[]) => {
  const iconMap: { [key: string]: { color: string; emoji: string } } = {
    tourist_attraction: { color: "#F59E0B", emoji: "🎯" },
    museum: { color: "#8B5CF6", emoji: "🏛️" },
    park: { color: "#10B981", emoji: "🌳" },
    restaurant: { color: "#EF4444", emoji: "🍽️" },
    lodging: { color: "#3B82F6", emoji: "🏨" },
    church: { color: "#6B7280", emoji: "⛪" },
    temple: { color: "#F97316", emoji: "🏯" },
    zoo: { color: "#84CC16", emoji: "🦁" },
    aquarium: { color: "#06B6D4", emoji: "🐠" },
    shopping_mall: { color: "#EC4899", emoji: "🛍️" },
    amusement_park: { color: "#F43F5E", emoji: "🎢" },
    natural_feature: { color: "#22C55E", emoji: "🏔️" },
    point_of_interest: { color: "#F59E0B", emoji: "📍" },
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
            type: type as google.maps.places.PlaceType,
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
    <div className={`${className}`}>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        {/* Category Filter */}
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "tourist_attraction", label: "Attractions" },
            { value: "museum", label: "Museums" },
            { value: "park", label: "Parks" },
            { value: "restaurant", label: "Restaurants" },
            { value: "lodging", label: "Hotels" },
          ].map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category.value
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Show Labels Toggle */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="rounded"
          />
          Show place names
        </label>
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
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: showLabels ? "on" : "off" }],
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
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="14" fill="${placeIcon.color}" stroke="white" stroke-width="2"/>
                      <text x="16" y="20" text-anchor="middle" font-size="12" fill="white">${placeIcon.emoji}</text>
                    </svg>
                  `),
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
                        color: "#1F2937",
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
                          backgroundColor: icon.color + "20",
                          color: icon.color,
                        }}
                      >
                        <span>{icon.emoji}</span>
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

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
            🎯
          </div>
          <span>Main Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">
            🎯
          </div>
          <span>Attractions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
            🏛️
          </div>
          <span>Museums</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
            🌳
          </div>
          <span>Parks</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-cyan-50 rounded-lg">
        <div className="text-sm text-cyan-800">
          <strong>Found {filteredPlaces.length} attractions</strong> within 20km
          radius
        </div>
        <div className="text-xs text-cyan-600 mt-1">
          💡 Click markers for details • Use filters to find specific types •
          Toggle names on/off
        </div>
      </div>
    </div>
  );
};

export default TouristAttractionsMapComponent;
