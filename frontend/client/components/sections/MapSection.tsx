import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { authAPI, DestinationDetails } from "../../lib/api";
import RouteMapComponent from "../RouteMapComponent";
import TouristAttractionsMapComponent from "../TouristAttractionsMapComponent";

const MapSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destinationData, setDestinationData] =
    useState<DestinationDetails | null>(null);
  const [startingLocation, setStartingLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinationData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const data = await authAPI.getDestinationDetails(parseInt(id));
        setDestinationData(data);

        // Get user's starting location from questionnaire
        try {
          const questionnaireData = await authAPI.getQuestionnaire();
          if (
            questionnaireData.starting_location_latitudes &&
            questionnaireData.starting_location_longitudes
          ) {
            setStartingLocation({
              lat: questionnaireData.starting_location_latitudes,
              lng: questionnaireData.starting_location_longitudes,
            });
          } else {
            // Fallback to Colombo if no questionnaire coordinates
            setStartingLocation({ lat: 6.9271, lng: 79.8612 });
          }
        } catch (questionnaireError) {
          console.warn(
            "Failed to fetch questionnaire data, using Colombo as default:",
            questionnaireError,
          );
          // Fallback to Colombo if questionnaire fetch fails
          setStartingLocation({ lat: 6.9271, lng: 79.8612 });
        }
      } catch (error) {
        console.error("Failed to fetch destination data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load destination data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationData();
  }, [id]);

  if (loading) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Best Route</h2>
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
            Loading map data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Best Route</h2>
        <div className="w-full h-64 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="font-medium">Failed to load map</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!destinationData || !startingLocation) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Best Route</h2>
        <div className="w-full h-64 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">No destination data available</div>
        </div>
      </div>
    );
  }

  const destination = {
    lat: destinationData.latitude,
    lng: destinationData.longitude,
  };

  return (
    <div className="mb-10 space-y-8">
      {/* Best Route Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Best Route</h2>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700">
          {/* Route Map */}
          <div className="rounded-lg overflow-hidden">
            <RouteMapComponent
              destination={destination}
              startingLocation={startingLocation}
              destinationName={destinationData.destination_name}
              className="w-full"
            />
          </div>

          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              🛣️ This map shows the optimized driving route from your starting
              location to{" "}
              <span className="font-medium">
                {destinationData.destination_name}
              </span>
              .
            </div>
          </div>
        </div>
      </div>

      {/* Tourist Attractions Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tourist Attractions</h2>

        {/* Tourist Attractions Map */}
        <TouristAttractionsMapComponent
          destination={destination}
          destinationName={destinationData.destination_name}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default MapSection;
