import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  OverlayView,
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
  category: PlaceCategory;
}

type PlaceCategory = 'parks' | 'museums' | 'attractions' | 'hotels' | 'restaurants';

interface FilterState {
  all: boolean;
  parks: boolean;
  museums: boolean;
  attractions: boolean;
  hotels: boolean;
  restaurants: boolean;
}

interface EnhancedTouristAttractionsMapComponentProps {
  destination: Coordinates;
  destinationName: string;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const EnhancedTouristAttractionsMapComponent: React.FC<EnhancedTouristAttractionsMapComponentProps> = ({
  destination,
  destinationName,
  className = "",
}) => {
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState<any>(null);
  const [allPlaces, setAllPlaces] = useState<PlaceDetails[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [searchRadius, setSearchRadius] = useState(20000); // 20km default to match image
  const [showPlaceNames, setShowPlaceNames] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    all: true,
    parks: false,
    museums: false,
    attractions: false,
    hotels: false,
    restaurants: false,
  });

  const center = destination;
  const [currentZoom, setCurrentZoom] = useState(12);

  const onLoad = useCallback((map: any) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle zoom change to manage label overlap
  const onZoomChanged = useCallback(() => {
    if (map) {
      setCurrentZoom(map.getZoom());
    }
  }, [map]);

  // Get place category based on types
  const getPlaceCategory = (types: string[]): PlaceCategory => {
    if (types.some(type => ['park', 'natural_feature'].includes(type))) return 'parks';
    if (types.some(type => ['museum', 'art_gallery'].includes(type))) return 'museums';
    if (types.some(type => ['lodging', 'hotel'].includes(type))) return 'hotels';
    if (types.some(type => ['restaurant', 'food', 'meal_takeaway', 'meal_delivery'].includes(type))) return 'restaurants';
    return 'attractions'; // Default for tourist attractions and other places
  };

  // Get custom marker icon and color based on category
  const getPlaceIcon = (category: PlaceCategory) => {
    const iconMap: { [key in PlaceCategory]: { color: string; markerUrl: string } } = {
      attractions: {
        color: "#00BCD4",
        markerUrl: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fe83da429003043968f2abb8423c2bfaa?format=webp&width=800"
      },
      hotels: {
        color: "#E91E63",
        markerUrl: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F0d9ec12e71ea4301b961706ff64b213b?format=webp&width=800"
      },
      museums: {
        color: "#2196F3",
        markerUrl: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F618f81b4d111438e96751c3297dec1c0?format=webp&width=800"
      },
      parks: {
        color: "#4CAF50",
        markerUrl: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2F3ea4f89c53214306bc32b0479b56b0fe?format=webp&width=800"
      },
      restaurants: {
        color: "#FF9800",
        markerUrl: "https://cdn.builder.io/api/v1/image/assets%2F82634153cda843eda981be3786ff3b99%2Fa28050a33fee42049a939ef4384447d2?format=webp&width=800"
      },
    };
    return iconMap[category];
  };

  // Get marker URL - replaced SVG generation with direct image URLs
  const getMarkerUrl = (markerUrl: string) => {
    return markerUrl;
  };

  // Filter places based on active filters
  const filteredPlaces = useMemo(() => {
    if (activeFilters.all) return allPlaces;

    return allPlaces.filter(place => {
      return activeFilters[place.category];
    });
  }, [allPlaces, activeFilters]);

  // Check if labels should be shown based on zoom and distance between places
  const shouldShowLabel = useCallback((place: PlaceDetails, index: number) => {
    if (!showPlaceNames || currentZoom < 14) return false;

    // Simple overlap detection based on nearby places
    const threshold = currentZoom < 15 ? 0.002 : 0.001; // Distance threshold based on zoom

    for (let i = 0; i < filteredPlaces.length; i++) {
      if (i === index) continue;
      const otherPlace = filteredPlaces[i];
      const distance = Math.sqrt(
        Math.pow(place.geometry.location.lat - otherPlace.geometry.location.lat, 2) +
        Math.pow(place.geometry.location.lng - otherPlace.geometry.location.lng, 2)
      );

      if (distance < threshold) {
        // Show label for place with higher rating, or first alphabetically if no rating
        if (place.rating && otherPlace.rating) {
          return place.rating > otherPlace.rating;
        } else if (place.rating) {
          return true;
        } else if (otherPlace.rating) {
          return false;
        } else {
          return place.name.localeCompare(otherPlace.name) < 0;
        }
      }
    }
    return true;
  }, [showPlaceNames, currentZoom, filteredPlaces]);

  // Handle filter button click
  const handleFilterClick = (filterType: keyof FilterState) => {
    if (filterType === 'all') {
      setActiveFilters({
        all: true,
        parks: false,
        museums: false,
        attractions: false,
        hotels: false,
        restaurants: false,
      });
    } else {
      setActiveFilters(prev => {
        const newFilters = {
          ...prev,
          all: false,
          [filterType]: !prev[filterType],
        };
        
        // If no specific filters are active, activate "All"
        const hasActiveFilters = Object.entries(newFilters)
          .filter(([key]) => key !== 'all')
          .some(([, value]) => value);
        
        if (!hasActiveFilters) {
          newFilters.all = true;
        }
        
        return newFilters;
      });
    }
  };

  // Search for different types of places
  const searchPlaces = useCallback(async (placeType: string, category: PlaceCategory) => {
    if (!map || !isGoogleMapsLoaded || !window.google?.maps?.places) {
      return [];
    }

    return new Promise<PlaceDetails[]>((resolve) => {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        location: destination,
        radius: searchRadius,
        type: placeType as any, // google.maps.places.PlaceType compatibility
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const places = results
            .filter((place) => place.name && place.geometry?.location)
            .slice(0, 10) // Limit per category
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
              category,
            }));
          resolve(places);
        } else {
          resolve([]);
        }
      });
    });
  }, [map, destination, searchRadius, isGoogleMapsLoaded]);

  // Load all place types
  useEffect(() => {
    if (!map || !isGoogleMapsLoaded || !window.google?.maps?.places) {
      return;
    }

    const loadAllPlaces = async () => {
      try {
        const [parks, museums, attractions, hotels, restaurants] = await Promise.all([
          searchPlaces("park", "parks"),
          searchPlaces("museum", "museums"),
          searchPlaces("tourist_attraction", "attractions"),
          searchPlaces("lodging", "hotels"),
          searchPlaces("restaurant", "restaurants"),
        ]);

        const allPlacesData = [...parks, ...museums, ...attractions, ...hotels, ...restaurants];
        
        // Remove duplicates based on place_id
        const uniquePlaces = allPlacesData.filter((place, index, self) => 
          index === self.findIndex(p => p.place_id === place.place_id)
        );
        
        setAllPlaces(uniquePlaces);
      } catch (error) {
        console.error("Error loading places:", error);
      }
    };

    loadAllPlaces();
  }, [map, destination, searchRadius, isGoogleMapsLoaded, searchPlaces]);

  // Count places by category
  const placeCounts = useMemo(() => {
    const counts = {
      parks: 0,
      museums: 0,
      attractions: 0,
      hotels: 0,
      restaurants: 0,
    };
    
    allPlaces.forEach(place => {
      counts[place.category]++;
    });
    
    return counts;
  }, [allPlaces]);

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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tourist Attractions</h3>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilters.all
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterClick('parks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilters.parks
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeFilters.parks ? { backgroundColor: '#4CAF50' } : {}}
            >
              Parks ({placeCounts.parks})
            </button>
            <button
              onClick={() => handleFilterClick('museums')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilters.museums
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeFilters.museums ? { backgroundColor: '#2196F3' } : {}}
            >
              Museums ({placeCounts.museums})
            </button>
            <button
              onClick={() => handleFilterClick('attractions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilters.attractions
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeFilters.attractions ? { backgroundColor: '#00BCD4' } : {}}
            >
              Attractions ({placeCounts.attractions})
            </button>
            <button
              onClick={() => handleFilterClick('hotels')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilters.hotels
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeFilters.hotels ? { backgroundColor: '#E91E63' } : {}}
            >
              Hotels ({placeCounts.hotels})
            </button>
            <button
              onClick={() => handleFilterClick('restaurants')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilters.restaurants
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeFilters.restaurants ? { backgroundColor: '#FF9800' } : {}}
            >
              Restaurants ({placeCounts.restaurants})
            </button>
          </div>

          {/* Show place names toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPlaceNames"
              checked={showPlaceNames}
              onChange={(e) => setShowPlaceNames(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showPlaceNames" className="text-sm text-gray-700">
              Show place names
            </label>
            {showPlaceNames && (
              <span className="text-xs text-gray-500">
                (Zoom in to see names clearly)
              </span>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onZoomChanged={onZoomChanged}
            options={{
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }], // Always hide default POI labels
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

            {/* Filtered Place Markers */}
            {filteredPlaces.map((place, index) => {
              const iconInfo = getPlaceIcon(place.category);
              return (
                <React.Fragment key={place.place_id}>
                  <Marker
                    position={place.geometry.location}
                    title={place.name}
                    onClick={() => setSelectedPlace(place)}
                    icon={{
                      url: getMarkerUrl(iconInfo.markerUrl),
                      scaledSize: window.google?.maps?.Size
                        ? new window.google.maps.Size(32, 32)
                        : undefined,
                      anchor: window.google?.maps?.Point
                        ? new window.google.maps.Point(16, 32)
                        : undefined,
                    }}
                  />

                  {/* Custom Place Name Label */}
                  {shouldShowLabel(place, index) && (
                    <OverlayView
                      position={{
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                      }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <div
                        className="pointer-events-none"
                        style={{
                          position: 'absolute',
                          transform: 'translate(-50%, -45px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: iconInfo.color,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: `1px solid ${iconInfo.color}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          whiteSpace: 'nowrap',
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {place.name}
                      </div>
                    </OverlayView>
                  )}
                </React.Fragment>
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
                  
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedPlace.category === 'parks' ? 'bg-green-50 text-green-700' :
                      selectedPlace.category === 'museums' ? 'bg-blue-50 text-blue-700' :
                      selectedPlace.category === 'hotels' ? 'bg-pink-50 text-pink-700' :
                      selectedPlace.category === 'restaurants' ? 'bg-orange-50 text-orange-700' :
                      'bg-cyan-50 text-cyan-700'
                    }`}>
                      {selectedPlace.category.charAt(0).toUpperCase() + selectedPlace.category.slice(1)}
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Location count indicator */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
            Showing {filteredPlaces.length} locations within 20km radius
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTouristAttractionsMapComponent;
