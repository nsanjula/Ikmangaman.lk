import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { FiNavigation, FiTruck } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

const GOOGLE_MAPS_API_KEY = "AIzaSyChfPh1WAJCQBTXIBnx9WkOs_gU7YaTw4Y";

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteMapComponentProps {
  destination: Coordinates;
  startingLocation: Coordinates;
  destinationName: string;
  className?: string;
}

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "450px",
};

type TravelMode = "DRIVING" | "TRANSIT" | "WALKING";

const RouteMapComponent: React.FC<RouteMapComponentProps> = ({
  destination,
  startingLocation,
  destinationName,
  className = "",
}) => {
  const [map, setMap] = useState<any>(null);
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] =
    useState<TravelMode>("DRIVING");
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    instructions: string[];
  } | null>(null);

  // Request directions when map is ready or travel mode changes
  React.useEffect(() => {
    if (
      map &&
      window.google &&
      window.google.maps &&
      window.google.maps.DirectionsService
    ) {
      const directionsService = new window.google.maps.DirectionsService();

      const travelModeMap = {
        DRIVING: window.google.maps.TravelMode.DRIVING,
        TRANSIT: window.google.maps.TravelMode.TRANSIT,
        WALKING: window.google.maps.TravelMode.WALKING,
      };

      const request = {
        origin: startingLocation,
        destination: destination,
        travelMode: travelModeMap[selectedTravelMode],
        optimizeWaypoints: true,
        provideRouteAlternatives: selectedTravelMode === "DRIVING",
      };

      directionsService.route(request, (response, status) => {
        if (status === "OK" && response) {
          setDirectionsResponse(response);
          setDirectionsError(null);

          // Extract route information
          const route = response.routes[0];
          const leg = route.legs[0];

          setRouteInfo({
            distance: leg.distance?.text || "Unknown",
            duration: leg.duration?.text || "Unknown",
            instructions:
              leg.steps
                ?.slice(0, 5)
                .map(
                  (step) => step.instructions?.replace(/<[^>]*>/g, "") || "",
                ) || [],
          });

          // Fit map bounds to show entire route
          if (map && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            route.legs.forEach((leg) => {
              leg.steps?.forEach((step) => {
                bounds.extend(step.start_location);
                bounds.extend(step.end_location);
              });
            });

            // Add some padding to the bounds
            map.fitBounds(bounds, {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            });
          }
        } else {
          setDirectionsError(
            `Failed to get directions for ${selectedTravelMode.toLowerCase()} mode`,
          );
          console.error("Directions request failed due to " + status);
          setRouteInfo(null);
          setDirectionsResponse(null);
        }
      });
    }
  }, [
    map,
    selectedTravelMode,
    startingLocation.lat,
    startingLocation.lng,
    destination.lat,
    destination.lng,
  ]);

  const center = {
    lat: (destination.lat + startingLocation.lat) / 2,
    lng: (destination.lng + startingLocation.lng) / 2,
  };

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

  // Get route color based on travel mode
  const getRouteColor = (mode: TravelMode) => {
    switch (mode) {
      case "DRIVING":
        return "#059669";
      case "TRANSIT":
        return "#3B82F6";
      case "WALKING":
        return "#F59E0B";
      default:
        return "#059669";
    }
  };

  // Get travel mode icon
  const getTravelModeIcon = (mode: TravelMode) => {
    switch (mode) {
      case "DRIVING":
        return <FaCar className="w-4 h-4" />;
      case "TRANSIT":
        return <FiTruck className="w-4 h-4" />;
      case "WALKING":
        return <FiNavigation className="w-4 h-4" />;
      default:
        return <FaCar className="w-4 h-4" />;
    }
  };

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
      {/* Travel Mode Selector */}
      <div className="mb-4 flex gap-2">
        {(["DRIVING", "TRANSIT", "WALKING"] as TravelMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedTravelMode(mode);
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedTravelMode === mode
                ? "bg-cyan-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {getTravelModeIcon(mode)}
            <span className="capitalize">{mode.toLowerCase()}</span>
          </button>
        ))}
      </div>

      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onError={onLoadError}
        loadingElement={
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading Route Map...</div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={8}
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

          {/* Directions Renderer */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: getRouteColor(selectedTravelMode),
                  strokeWeight: 6,
                  strokeOpacity: 0.9,
                },
                suppressMarkers: true, // We use our own markers
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Route Information */}
      {routeInfo && (
        <div className="mt-4 bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            {getTravelModeIcon(selectedTravelMode)}
            Best Route ({selectedTravelMode.toLowerCase()})
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-sm text-gray-600">Distance:</span>
              <div className="font-medium">{routeInfo.distance}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Duration:</span>
              <div className="font-medium">{routeInfo.duration}</div>
            </div>
          </div>

          {routeInfo.instructions.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">Key Directions:</span>
              <ul className="text-sm mt-1 space-y-1">
                {routeInfo.instructions
                  .slice(0, 3)
                  .map((instruction, index) => (
                    <li key={index} className="text-gray-700">
                      {index + 1}. {instruction}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          <div
            className="w-6 h-1 rounded"
            style={{ backgroundColor: getRouteColor(selectedTravelMode) }}
          ></div>
          <span>{selectedTravelMode.toLowerCase()} route</span>
        </div>
      </div>

      {directionsError && (
        <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-lg">
          <strong>Route Error:</strong> {directionsError}
          <div className="text-sm mt-1">
            Try selecting a different travel mode or check if the locations are
            accessible.
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        💡 Switch between travel modes to see different route options and
        estimated travel times.
      </div>
    </div>
  );
};

export default RouteMapComponent;
