import React, { useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { FiTruck } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";

interface Coordinates {
  lat: number;
  lng: number;
}

interface OptimizedRouteMapComponentProps {
  destination: Coordinates;
  startingLocation: Coordinates;
  destinationName: string;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "450px",
};

type TravelMode = "DRIVING" | "TRANSIT" | "WALKING";

const OptimizedRouteMapComponent: React.FC<OptimizedRouteMapComponentProps> = ({
  destination,
  startingLocation,
  destinationName,
  className = "",
}) => {
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState<any>(null);
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TravelMode>("DRIVING");
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  // Memoize center calculation
  const center = useMemo(() => ({
    lat: (destination.lat + startingLocation.lat) / 2,
    lng: (destination.lng + startingLocation.lng) / 2,
  }), [destination.lat, destination.lng, startingLocation.lat, startingLocation.lng]);

  const onLoad = useCallback((map: any) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get route color based on travel mode
  const getRouteColor = (mode: TravelMode) => {
    switch (mode) {
      case "DRIVING":
        return "#3B82F6"; // Blue
      case "TRANSIT":
        return "#10B981"; // Green
      case "WALKING":
        return "#F59E0B"; // Amber
      default:
        return "#3B82F6";
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
        return <IoPersonSharp className="w-4 h-4" />;
      default:
        return <FaCar className="w-4 h-4" />;
    }
  };

  // Directions callback
  const directionsCallback = useCallback(
    (
      response: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus,
    ) => {
      if (status === "OK" && response) {
        setDirectionsResponse(response);
        setDirectionsError(null);

        // Extract route information
        const route = response.routes[0];
        if (route && route.legs[0]) {
          setRouteInfo({
            distance: route.legs[0].distance?.text || "N/A",
            duration: route.legs[0].duration?.text || "N/A",
          });
        }
      } else {
        setDirectionsError("Failed to get directions");
        console.error("Directions request failed due to " + status);
      }
    },
    [],
  );

  // Directions service options
  const directionsServiceOptions = useMemo(() => {
    if (!isGoogleMapsLoaded || !window.google?.maps?.TravelMode) {
      return null;
    }
    return {
      destination: destination,
      origin: startingLocation,
      travelMode: window.google.maps.TravelMode[selectedTravelMode],
    };
  }, [destination, startingLocation, selectedTravelMode, isGoogleMapsLoaded]);

  // Show loading state if Google Maps is not loaded
  if (!isGoogleMapsLoaded) {
    return (
      <div className={`${className}`}>
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            {loadError ? "Map unavailable" : "Loading Route Map..."}
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
            onClick={() => setSelectedTravelMode(mode)}
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

      {/* Route Information */}
      {routeInfo && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex gap-4 text-sm text-blue-800">
            <span>📍 Distance: {routeInfo.distance}</span>
            <span>⏱️ Duration: {routeInfo.duration}</span>
            <span>🚗 Via: {selectedTravelMode.toLowerCase()}</span>
          </div>
        </div>
      )}

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
            url: "data:image/svg+xml;charset=UTF-8," +
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

        {/* Directions Service */}
        {directionsServiceOptions && (
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
                strokeColor: getRouteColor(selectedTravelMode),
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true, // We use custom markers
            }}
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-800">
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
          <span>
            {selectedTravelMode.charAt(0).toUpperCase() +
              selectedTravelMode.slice(1).toLowerCase()} Route
          </span>
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

export default OptimizedRouteMapComponent;
