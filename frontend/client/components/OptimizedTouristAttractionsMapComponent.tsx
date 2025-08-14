import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";

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

interface OptimizedTouristAttractionsMapComponentProps {
  destination: Coordinates;
  destinationName: string;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const OptimizedTouristAttractionsMapComponent: React.FC<OptimizedTouristAttractionsMapComponentProps> = ({
  destination,
  destinationName,
  className = "",
}) => {
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState<any>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceDetails[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [searchRadius, setSearchRadius] = useState(10000); // 10km default

  const center = destination;

  const onLoad = useCallback((map: any) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get place icon based on type
  const getPlaceIcon = (types: string[]) => {
    const iconMap: { [key: string]: { color: string; emoji: string } } = {
      tourist_attraction: { color: "#3B82F6", emoji: "🏛️" },
      restaurant: { color: "#F59E0B", emoji: "🍽️" },
      lodging: { color: "#10B981", emoji: "🏨" },
      natural_feature: { color: "#22C55E", emoji: "🌿" },
      park: { color: "#16A34A", emoji: "🌳" },
      museum: { color: "#8B5CF6", emoji: "🏛️" },
      place_of_worship: { color: "#F97316", emoji: "⛪" },
      shopping_mall: { color: "#EC4899", emoji: "🛍️" },
    };

    for (const type of types) {
      if (iconMap[type]) {
        return iconMap[type];
      }
    }
    return { color: "#6B7280", emoji: "📍" };
  };

  // Search for nearby tourist attractions
  useEffect(() => {
    if (!map || !isGoogleMapsLoaded || !window.google?.maps?.places) {
      return;
    }

    try {
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: destination,
        radius: searchRadius,
        type: "tourist_attraction" as any, // google.maps.places.PlaceType compatibility
      };

      service.nearbySearch(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          const filteredResults = results
            .filter((place) => place.name && place.geometry?.location)
            .slice(0, 15) // Limit to 15 places for performance
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
          setNearbyPlaces(filteredResults);
        }
      });
    } catch (error) {
      console.error("Error accessing Google Maps Places service:", error);
    }
  }, [map, destination, searchRadius, isGoogleMapsLoaded]);

  // Show loading state if Google Maps is not loaded
  if (!isGoogleMapsLoaded) {
    return (
      <div className={`${className}`}>
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            {loadError ? "Map unavailable" : "Loading Tourist Attractions Map..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Search Radius Selector */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Search Radius:</label>
        <select
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value={5000}>5 km</option>
          <option value={10000}>10 km</option>
          <option value={20000}>20 km</option>
          <option value={50000}>50 km</option>
        </select>
        <span className="text-sm text-gray-600">
          Found {nearbyPlaces.length} attractions
        </span>
      </div>

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
              stylers: [{ visibility: "on" }],
            },
          ],
          gestureHandling: "greedy",
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Destination Marker */}
        <Marker
          position={destination}
          title={destinationName}
          icon={{
            url: "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#EF4444">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              `),
            scaledSize: window.google?.maps?.Size
              ? new window.google.maps.Size(32, 32)
              : undefined,
          }}
        />

        {/* Tourist Attraction Markers */}
        {nearbyPlaces.map((place) => {
          const iconInfo = getPlaceIcon(place.types);
          return (
            <Marker
              key={place.place_id}
              position={place.geometry.location}
              title={place.name}
              onClick={() => setSelectedPlace(place)}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${iconInfo.color}">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  `),
                scaledSize: window.google?.maps?.Size
                  ? new window.google.maps.Size(24, 24)
                  : undefined,
              }}
            />
          );
        })}

        {/* Info Window for Selected Place */}
        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.geometry.location}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-gray-800 mb-1">
                {selectedPlace.name}
              </h3>
              
              {selectedPlace.rating && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-gray-600">
                    {selectedPlace.rating.toFixed(1)}
                  </span>
                </div>
              )}
              
              {selectedPlace.vicinity && (
                <p className="text-xs text-gray-500 mb-2">
                  📍 {selectedPlace.vicinity}
                </p>
              )}
              
              {selectedPlace.opening_hours?.open_now !== undefined && (
                <p className={`text-xs mb-2 ${
                  selectedPlace.opening_hours.open_now 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {selectedPlace.opening_hours.open_now ? '🟢 Open' : '🔴 Closed'}
                </p>
              )}
              
              <div className="flex flex-wrap gap-1">
                {selectedPlace.types.slice(0, 2).map((type, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded"
                  >
                    {type.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Places Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {nearbyPlaces.slice(0, 8).map((place) => {
          const iconInfo = getPlaceIcon(place.types);
          return (
            <div
              key={place.place_id}
              className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedPlace(place)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{iconInfo.emoji}</span>
                <span className="font-medium text-gray-800 truncate">
                  {place.name}
                </span>
              </div>
              {place.rating && (
                <div className="text-xs text-gray-600">
                  ⭐ {place.rating.toFixed(1)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600">
        <p>🔴 Your destination • 🏛️ Tourist attractions • ⭐ Popular places</p>
        <p>Click on any marker or place card to see more details</p>
      </div>
    </div>
  );
};

export default OptimizedTouristAttractionsMapComponent;
