import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiMapPin, FiCamera, FiClock } from "react-icons/fi";
import { authAPI, DestinationDetails } from "../../lib/api";

const PlacesToVisit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destinationData, setDestinationData] =
    useState<DestinationDetails | null>(null);
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
      <div id="places-to-visit" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Places to Visit</h2>
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
            Loading places to visit...
          </div>
        </div>
      </div>
    );
  }

  if (error || !destinationData) {
    return (
      <div id="places-to-visit" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Places to Visit</h2>
        <div className="w-full h-32 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="font-medium">Failed to load places</p>
            <p className="text-sm mt-1">
              {error || "Places data not available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const placesToDo = destinationData["things to do"] || [];

  if (placesToDo.length === 0) {
    return (
      <div id="places-to-visit" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Places to Visit</h2>
        <div className="w-full h-32 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
          <div className="text-yellow-700 text-center">
            <p className="font-medium">No places listed</p>
            <p className="text-sm mt-1">
              Check back later for activity recommendations
            </p>
          </div>
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
      return <FiCamera className="w-5 h-5 text-blue-600" />;
    } else if (
      activityLower.includes("hike") ||
      activityLower.includes("trek") ||
      activityLower.includes("walk")
    ) {
      return <FiMapPin className="w-5 h-5 text-green-600" />;
    } else {
      return <FiMapPin className="w-5 h-5 text-purple-600" />;
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

  return (
    <div id="places-to-visit" className="mb-10">
      <h2 className="text-xl font-semibold mb-4">
        Places to Visit in {destinationData.destination_name}
      </h2>
      <p className="text-gray-600 mb-6">
        Discover the must-visit attractions and activities that make this
        destination special
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placesToDo.map((place, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Activity Image Placeholder */}
            <div className="h-40 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative">
              <div className="text-white text-center">
                {getActivityIcon(place)}
                <p className="text-sm mt-2 font-medium">{place}</p>
              </div>
            </div>

            {/* Activity Information */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {place}
              </h3>

              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {getActivityDescription(place)}
              </p>

              {/* Activity Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiClock className="w-4 h-4" />
                  <span>Estimated time: {getEstimatedTime(place)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <FiMapPin className="w-4 h-4" />
                  <span>Location: {destinationData.destination_name}</span>
                </div>
              </div>

              {/* Activity Type Badge */}
              <div className="mt-3 inline-block">
                <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full">
                  {place.toLowerCase().includes("hike") ||
                  place.toLowerCase().includes("trek")
                    ? "Hiking"
                    : place.toLowerCase().includes("falls") ||
                        place.toLowerCase().includes("waterfall")
                      ? "Nature"
                      : place.toLowerCase().includes("bridge")
                        ? "Sightseeing"
                        : place.toLowerCase().includes("tea")
                          ? "Cultural"
                          : "Adventure"}
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={() => {
                  // You can add more detailed view or Google Maps integration here
                  const query = `${place} ${destinationData.destination_name} Sri Lanka`;
                  window.open(
                    `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
                    "_blank",
                  );
                }}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
              >
                View on Map
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Tips */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm">
          🌟 <strong>Travel Tip:</strong> Plan your visits based on weather
          conditions and your fitness level. Early morning visits often provide
          the best views and fewer crowds.
        </p>
      </div>
    </div>
  );
};

export default PlacesToVisit;
