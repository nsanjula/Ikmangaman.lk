import React, { useMemo } from "react";
import { FiMapPin, FiNavigation, FiCompass } from "react-icons/fi";
import OptimizedRouteMapComponent from "../OptimizedRouteMapComponent";
import EnhancedTouristAttractionsMapComponent from "../EnhancedTouristAttractionsMapComponent";
import { useDestination } from "../../contexts/DestinationContext";

const MapSection: React.FC = () => {
  const { destinationData, questionnaireData, loading, error } = useDestination();

  // Memoize starting location calculation
  const startingLocation = useMemo(() => {
    if (questionnaireData?.starting_location_latitudes && questionnaireData?.starting_location_longitudes) {
      return {
        lat: questionnaireData.starting_location_latitudes,
        lng: questionnaireData.starting_location_longitudes,
      };
    }
    // Fallback to Colombo
    return { lat: 6.9271, lng: 79.8612 };
  }, [questionnaireData]);

  if (loading) {
    return (
      <div className="space-y-6 mb-6">
        {/* Route Map Loading */}
        <div className="card p-6 animate-pulse" style={{ background: 'var(--surface)' }}>
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="w-full h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Attractions Map Loading */}
        <div className="card p-6 animate-pulse" style={{ background: 'var(--surface)' }}>
          <div className="h-6 bg-gray-200 rounded mb-4 w-56"></div>
          <div className="w-full h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 mb-6 border-l-4" style={{ 
        background: 'var(--surface)', 
        borderLeftColor: '#EF4444' 
      }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>
          Maps & Navigation
        </h2>
        <p style={{ color: '#DC2626' }}>
          Failed to load map data: {error}
        </p>
      </div>
    );
  }

  if (!destinationData) {
    return (
      <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
          Maps & Navigation
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="font-medium mb-2" style={{ color: 'var(--text-900)' }}>
            No destination data available
          </p>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            Please ensure destination information is loaded
          </p>
        </div>
      </div>
    );
  }

  const destination = {
    lat: destinationData.latitude,
    lng: destinationData.longitude,
  };

  return (
    <div id="map-section" className="space-y-6 mb-6">
      {/* Best Route Section */}
      <div className="card p-6" style={{ background: 'var(--surface)' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FiNavigation className="w-6 h-6" style={{ color: 'var(--primary-600)' }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-900)' }}>
              Best Route
            </h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            Optimized driving route from your starting location to {destinationData.destination_name}
          </p>
        </div>

        {/* Route Map Container */}
        <div className="rounded-lg overflow-hidden">
          <OptimizedRouteMapComponent
            destination={destination}
            startingLocation={startingLocation}
            destinationName={destinationData.destination_name}
            className="w-full"
          />
        </div>

        {/* Route Information */}
        <div className="mt-4 p-4 rounded-lg border-l-4" style={{ 
          background: 'var(--surface-alt)', 
          borderLeftColor: 'var(--primary-600)' 
        }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🛣️</span>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
                Navigation Information
              </p>
              <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                This interactive map shows the recommended driving route with real-time traffic data.
                Click and drag to explore different routes and waypoints.
              </p>
            </div>
          </div>
        </div>


      </div>

      {/* Tourist Attractions Section */}
      <div className="card p-6" style={{ background: 'var(--surface)' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FiCompass className="w-6 h-6" style={{ color: 'var(--primary-600)' }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-900)' }}>
              Tourist Attractions Map
            </h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            Filter and explore parks, museums, attractions, hotels, and restaurants around {destinationData.destination_name}
          </p>
        </div>

        {/* Tourist Attractions Map Container */}
        <EnhancedTouristAttractionsMapComponent
          destination={destination}
          destinationName={destinationData.destination_name}
          className="w-full"
        />

        {/* Attractions Information */}
        <div className="mt-4 p-4 rounded-lg border-l-4" style={{ 
          background: 'var(--surface-alt)', 
          borderLeftColor: '#22C55E' 
        }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
                Interactive Attractions Map
              </p>
              <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                Use the category filters to find specific types of places: parks, museums, attractions, hotels, and restaurants.
                Toggle place names visibility and click markers for detailed information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
