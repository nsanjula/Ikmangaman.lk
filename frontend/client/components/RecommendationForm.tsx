import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import {
  authAPI,
  RecommendationsResponse,
  BackendRecommendation,
} from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface RecommendationCard {
  id: number;
  name: string;
  description: string;
  price: number;
  score: number;
  type: string;
  things_to_do: string;
  thumbnail_img: string;
}

const RecommendationForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showFilters, setShowFilters] = useState(true);
  const [budget, setBudget] = useState(500000);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    "hill_country",
    "coastal",
    "dry_zone",
    "urban",
  ]);
  const [cards, setCards] = useState<RecommendationCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine area type from destination (simplified for backend format)
  const getAreaType = (
    destinationId: number,
    destinationName?: string,
  ): string => {
    // Since backend doesn't provide area type info, we'll assign based on destination ID
    // to ensure variety in recommendations rather than all being "coastal"
    const areaTypes = ["hill_country", "coastal", "dry_zone", "urban"];

    // Use destination name if available for more accurate classification
    if (destinationName) {
      const name = destinationName.toLowerCase();
      if (
        name.includes("galle") ||
        name.includes("colombo") ||
        name.includes("negombo") ||
        name.includes("matara") ||
        name.includes("trincomalee") ||
        name.includes("batticaloa")
      ) {
        return "coastal";
      }
      if (
        name.includes("kandy") ||
        name.includes("nuwara") ||
        name.includes("ella") ||
        name.includes("hatton") ||
        name.includes("badulla")
      ) {
        return "hill_country";
      }
      if (
        name.includes("anuradhapura") ||
        name.includes("polonnaruwa") ||
        name.includes("sigiriya") ||
        name.includes("dambulla") ||
        name.includes("vavuniya")
      ) {
        return "dry_zone";
      }
      if (
        name.includes("colombo") ||
        name.includes("dehiwala") ||
        name.includes("moratuwa")
      ) {
        return "urban";
      }
    }

    // Fallback: distribute evenly across area types based on ID
    return areaTypes[destinationId % areaTypes.length];
  };

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting...");
        setError("Please log in to view recommendations");
        return;
      }

      console.log("Fetching recommendations for authenticated user...");
      const data: RecommendationsResponse = await authAPI.getRecommendations();

      console.log("Recommendations response:", data);
      console.log(
        "Response type:",
        typeof data,
        "Length:",
        Array.isArray(data) ? data.length : "not array",
      );

      // Check if backend returned an error object instead of array
      if (data && typeof data === "object" && "error" in data) {
        console.log("Backend returned error:", data.error);
        setError(
          "No recommendations available. Please complete the questionnaire first to get personalized recommendations.",
        );
        setCards([]);
        return;
      }

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        setError("Invalid response format from server. Please try again.");
        return;
      }

      // Transform backend data to frontend format
      const transformedCards: RecommendationCard[] = data
        .filter((item: BackendRecommendation) => {
          const isValid = item && item.destination_id && item.name;
          if (!isValid) {
            console.log("Filtering out invalid item:", item);
          }
          return isValid;
        })
        .map((item: BackendRecommendation) => {
          return {
            id: item.destination_id,
            name: item.name || "Unknown Destination",
            description: `${item.rating_label} match (${item.distance}, ${item.travel_time})`,
            price: Math.round(item.estimated_budget || 0),
            score: item.match_score || 0,
            type: getAreaType(item.destination_id, item.name),
            things_to_do: "", // Not provided by backend currently
            thumbnail_img: item.thumbnail_img || "",
          };
        });

      console.log("Transformed cards:", transformedCards.length, "items");
      setCards(transformedCards);

      // If no recommendations after successful fetch, show helpful message
      if (transformedCards.length === 0) {
        console.log("No recommendations found after transformation");
        setError(
          "No recommendations available. Please complete the questionnaire first to get personalized recommendations.",
        );
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);

      if (err instanceof Error) {
        if (
          err.message.includes("Authentication required") ||
          err.message.includes("Please log in again")
        ) {
          setError(
            "Your session has expired. Please log in again to view recommendations.",
          );
        } else if (err.message.includes("Unable to connect")) {
          setError(
            "Unable to connect to the backend server. Please check if the backend is running on port 8000 and try again.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to fetch recommendations. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const areas = [
    { id: "hill_country", name: "Hill Country" },
    { id: "coastal", name: "Coastal" },
    { id: "dry_zone", name: "Dry Zone" },
    { id: "urban", name: "Urban" },
  ];

  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((a) => a !== areaId)
        : [...prev, areaId],
    );
  };

  // Filter cards based on selected filters
  const filteredCards = cards
    .filter((card) => selectedAreas.includes(card.type))
    .filter((card) => card.price <= budget)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen w-full bg-cyan-700 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="bg-cyan-600 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">
            Please log in to view your personalized recommendations.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-cyan-700 px-6 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-cyan-700 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-cyan-600 rounded-lg p-4 sticky top-4 text-white shadow-lg">
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={toggleFilters}
              >
                <div className="flex items-center gap-2">
                  <FiFilter className="text-xl text-white" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>
                {showFilters ? (
                  <FiChevronUp className="text-white" />
                ) : (
                  <FiChevronDown className="text-white" />
                )}
              </div>

              {showFilters && (
                <div className="space-y-6">
                  {/* Budget Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Budget (LKR): {budget.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="5000"
                      max="500000"
                      step="5000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${((budget - 5000) / (500000 - 5000)) * 100}%, #d1d5db ${((budget - 5000) / (500000 - 5000)) * 100}%, #d1d5db 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs mt-1 text-cyan-200">
                      <span>LKR 5,000</span>
                      <span>LKR 500,000</span>
                    </div>
                  </div>

                  {/* Area Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">
                      Areas
                    </label>
                    <div className="space-y-2">
                      {areas.map((area) => (
                        <label
                          key={area.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area.id)}
                            onChange={() => toggleArea(area.id)}
                            className="w-4 h-4 text-gray-600 bg-gray-300 border-gray-400 rounded focus:ring-gray-500 accent-gray-500"
                          />
                          <span className="text-sm text-white">
                            {area.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setSelectedAreas(areas.map((a) => a.id));
                      setBudget(50000);
                    }}
                    className="w-full bg-cyan-700 hover:bg-cyan-800 text-white py-2 rounded transition-colors text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-3/4">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Travel Recommendations
                  </h1>
                  <p className="text-cyan-200">
                    {isLoading
                      ? "Loading your personalized recommendations..."
                      : `Found ${filteredCards.length} personalized recommendations`}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/questionnaire")}
                  className="bg-white hover:bg-gray-100 text-cyan-700 px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span>📝</span>
                  Edit Questionnaire
                </button>
              </div>
              {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg">
                  <p>⚠�� {error}</p>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {/* Cards Grid */}
            {!isLoading && (
              <>
                {filteredCards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-cyan-600 rounded-lg shadow-md text-white hover:shadow-lg transition-all duration-200 flex flex-col p-4"
                      >
                        {/* Destination Image - Single box */}
                        <div className="relative bg-gray-200 rounded-lg h-48 mb-4 overflow-hidden">
                          {card.thumbnail_img ? (
                            <img
                              src={`http://localhost:8000${card.thumbnail_img}`}
                              alt={card.name}
                              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement
                                  ?.querySelector(".fallback-content")
                                  ?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div
                            className={`fallback-content absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-center p-2 ${card.thumbnail_img ? "hidden" : ""}`}
                          >
                            <div className="text-4xl mb-2">🏞️</div>
                            <div className="text-sm font-medium">
                              {card.name}
                            </div>
                          </div>
                        </div>

                        {/* Content that can grow */}
                        <div className="flex-grow">
                          {/* Name and Price */}
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="font-bold text-lg">{card.name}</h2>
                            <span className="bg-white text-cyan-700 text-xs px-2 py-1 rounded">
                              LKR {card.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm mb-3 text-cyan-100">
                            {card.description}
                          </p>

                          {/* Things to do */}
                          {card.things_to_do && (
                            <p className="text-xs text-cyan-200 mb-3">
                              <strong>Things to do:</strong>{" "}
                              {card.things_to_do.replace(/\//g, ", ")}
                            </p>
                          )}

                          {/* Match Score */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-cyan-200">
                                Match Score:
                              </span>
                              <div className="bg-cyan-700 rounded-full h-2 flex-1">
                                <div
                                  className="bg-white h-full rounded-full"
                                  style={{
                                    width: `${Math.min(card.score * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-cyan-200">
                                {Math.round(Math.min(card.score * 100, 100))}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Button always at bottom */}
                        <div className="mt-4">
                          <button
                            onClick={() => navigate(`/destination/${card.id}`)}
                            className="w-full bg-white hover:bg-gray-100 text-cyan-700 py-2 rounded text-sm transition-colors font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cards.length === 0 ? (
                  <div className="bg-cyan-600 p-8 rounded-lg text-center text-white">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-lg mb-4">
                      No recommendations available yet
                    </p>
                    <p className="text-sm text-cyan-200 mb-6">
                      {error ||
                        "Complete the questionnaire to get personalized travel recommendations based on your preferences."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setError(null);
                          fetchRecommendations();
                        }}
                        className="bg-white hover:bg-gray-100 text-cyan-700 px-6 py-3 rounded transition-colors font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Refresh Recommendations"}
                      </button>
                      <button
                        onClick={async () => {
                          console.log("=== TESTING API CONNECTION ===");
                          try {
                            const response = await fetch(
                              "http://localhost:8000/docs",
                            );
                            console.log(
                              "Direct fetch to /docs:",
                              response.status,
                              response.ok,
                            );
                          } catch (err) {
                            console.error("Direct fetch failed:", err);
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors font-medium text-sm"
                      >
                        Test API
                      </button>
                      <button
                        onClick={() => navigate("/questionnaire")}
                        className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded transition-colors font-medium border-2 border-white"
                      >
                        Edit Questionnaire
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-cyan-600 p-8 rounded-lg text-center text-white">
                    <p className="text-lg mb-4">
                      No recommendations match your current filters.
                    </p>
                    <p className="text-sm text-cyan-200 mb-4">
                      Try adjusting your budget or selecting different areas.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedAreas(areas.map((a) => a.id));
                        setBudget(50000);
                      }}
                      className="bg-white hover:bg-gray-100 text-cyan-700 px-6 py-2 rounded transition-colors font-medium"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationForm;
