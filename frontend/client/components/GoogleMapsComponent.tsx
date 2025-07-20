import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
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
  photos?: any[]; // Use any[] instead of google.maps.places.PlacePhoto[] to avoid loading issues
}

interface GoogleMapsComponentProps {
  destination: Coordinates;
  startingLocation: Coordinates;
  destinationName: string;
  className?: string;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({
  destination,
  startingLocation,
  destinationName,
  className = "",
}) => {
  const [map, setMap] = useState<any>(null); // Use any to avoid type checking issues
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceDetails[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<any>(null); // Use any to avoid type issues
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

        const request = {
          location: destination,
          radius: 10000, // 10km radius
          type: "tourist_attraction" as google.maps.places.PlaceType,
        };

        service.nearbySearch(request, (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            const filteredResults = results
              .filter((place) => place.name && place.geometry?.location)
              .slice(0, 10) // Limit to 10 places
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
              }));
            setNearbyPlaces(filteredResults);
          }
        });
      } catch (error) {
        console.error("Error accessing Google Maps Places service:", error);
      }
    }
  }, [map, destination]);

  // Get directions from starting location to destination
  const directionsCallback = useCallback(
    (
      response: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus,
    ) => {
      if (status === "OK" && response) {
        setDirectionsResponse(response);
        setDirectionsError(null);
      } else {
        setDirectionsError("Failed to get directions");
        console.error("Directions request failed due to " + status);
      }
    },
    [],
  );

  // Only create directions service options if Google Maps is fully loaded
  const directionsServiceOptions = React.useMemo(() => {
    if (window.google && window.google.maps && window.google.maps.TravelMode) {
      return {
        destination: destination,
        origin: startingLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };
    }
    return null;
  }, [destination, startingLocation]);

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
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onError={onLoadError}
        loadingElement={
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading Google Maps...</div>
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
                stylers: [{ visibility: "on" }],
              },
            ],
          }}
        >
          {/* Starting Location Marker */}
          <Marker
            position={startingLocation}
            title="Starting Location"
            icon={{
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#10B981">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
              `),
              scaledSize: window.google?.maps?.Size
                ? new window.google.maps.Size(32, 32)
                : undefined,
            }}
          />

          {/* Destination Marker */}
          <Marker
            position={destination}
            title={destinationName}
            icon={{
              url:
                "data:image/svg+xml;charset=UTF-8," +
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
          {nearbyPlaces.map((place) => (
            <Marker
              key={place.place_id}
              position={place.geometry.location}
              title={place.name}
              onClick={() => setSelectedPlace(place)}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                `),
                scaledSize: window.google?.maps?.Size
                  ? new window.google.maps.Size(24, 24)
                  : undefined,
              }}
            />
          ))}

          {/* Info Window for Selected Place */}
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.geometry.location}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-gray-800">
                  {selectedPlace.name}
                </h3>
                {selectedPlace.rating && (
                  <p className="text-sm text-gray-600">
                    ⭐ {selectedPlace.rating.toFixed(1)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPlace.vicinity}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
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

          {/* Directions Service */}
          {window.google && directionsServiceOptions && (
            <DirectionsService
              options={directionsServiceOptions}
              callback={directionsCallback}
            />
          )}

          {/* Directions Renderer */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: "#3B82F6",
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Starting Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Tourist Attractions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500"></div>
          <span>Driving Route</span>
        </div>
      </div>

      {directionsError && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {directionsError}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsComponent;
