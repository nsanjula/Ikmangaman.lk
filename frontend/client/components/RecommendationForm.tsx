import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import {
  authAPI,
  RecommendationsResponse,
  BackendRecommendation,
} from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useApiWithLoading, useRouteLoading } from "../contexts/LoadingContext";
import BookmarkButton from "./BookmarkButton";

interface RecommendationCard {
  id: number;
  name: string;
  description: string;
  price: number;
  score: number;
  type: string;
  things_to_do: string;
  thumbnail_img: string;
  distance: string;
  travel_time: string;
  distanceValue: number; // For sorting purposes
  travelTimeValue: number; // For sorting purposes
}

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-sm text-left bg-white border border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 cursor-pointer"
        style={{
          color: 'var(--text-900)',
          backgroundColor: 'var(--surface)',
          borderColor: '#E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span>{selectedOption?.label || 'Select option'}</span>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: '#64748B' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: '#E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setHoveredOption(option.value)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`w-full px-4 py-2 text-sm text-left transition-all duration-150 ${option.value === value
                ? 'bg-cyan-500 text-white'
                : hoveredOption === option.value
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-900 hover:bg-cyan-50'
                }`}
              style={{
                color: option.value === value ? 'white' : 'var(--text-900)',
                backgroundColor: option.value === value
                  ? '#06B6D4'
                  : hoveredOption === option.value
                    ? '#F0F9FF'
                    : 'transparent'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const RecommendationForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, handleAuthError } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const { startRouteTransition } = useRouteLoading();
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
  const [sortBy, setSortBy] = useState<string>("best_match");
  const [hasCachedData, setHasCachedData] = useState(false);

  // Helper function to parse distance string to numeric value for sorting
  const parseDistance = (distanceStr: string): number => {
    const match = distanceStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Helper function to parse travel time string to numeric value for sorting (in minutes)
  const parseTravelTime = (timeStr: string): number => {
    const hoursMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*h/);
    const minutesMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*m/);

    let totalMinutes = 0;
    if (hoursMatch) {
      totalMinutes += parseFloat(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
      totalMinutes += parseFloat(minutesMatch[1]);
    }

    return totalMinutes || 0;
  };

  // Cache management functions
  const CACHE_KEY = 'recommendationData';
  const CACHE_TIMESTAMP_KEY = 'recommendationDataTimestamp';
  const CACHE_EXPIRY_HOURS = 1; // Cache expires after 1 hour

  const saveRecommendationsToCache = (recommendationCards: RecommendationCard[]) => {
    try {
      const cacheData = {
        cards: recommendationCards,
        timestamp: Date.now(),
        userToken: authAPI.getToken() // Store with token to ensure cache is user-specific
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Saved recommendation data to cache:', recommendationCards.length, 'items');
    } catch (error) {
      console.warn('Failed to save recommendations to cache:', error);
    }
  };

  const loadRecommendationsFromCache = (): RecommendationCard[] | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const currentTime = Date.now();
      const cacheAge = currentTime - cacheData.timestamp;
      const maxCacheAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

      // Check if cache is expired
      if (cacheAge > maxCacheAge) {
        console.log('🕒 Cache expired, removing old data');
        clearRecommendationsCache();
        return null;
      }

      // Check if cache belongs to current user
      const currentToken = authAPI.getToken();
      if (cacheData.userToken !== currentToken) {
        console.log('👤 Cache belongs to different user, clearing');
        clearRecommendationsCache();
        return null;
      }

      console.log('✅ Restored recommendation data from cache:', cacheData.cards.length, 'items');
      return cacheData.cards;
    } catch (error) {
      console.warn('Failed to load recommendations from cache:', error);
      clearRecommendationsCache();
      return null;
    }
  };

  const clearRecommendationsCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('🗑️ Cleared recommendations cache');
  };

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

  const fetchRecommendations = async (forceRefresh: boolean = false) => {
    try {
      setError(null);

      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting...");
        setError("Please log in to view recommendations");
        setIsLoading(false);
        return;
      }

      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = loadRecommendationsFromCache();
        if (cachedData && cachedData.length > 0) {
          console.log("📂 Using cached recommendation data");
          setCards(cachedData);
          setHasCachedData(true);
          setIsLoading(false);
          return;
        }
      }

      console.log("Fetching recommendations for authenticated user...");
      const data: RecommendationsResponse = await callWithLoading(
        async () => {
          const result = await authAPI.getRecommendations();
          console.log("Recommendations response:", result);
          return result;
        },
        'recommendations',
        'Loading your personalized recommendations...'
      );

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
        setIsLoading(false);
        return;
      }

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        setError("Invalid response format from server. Please try again.");
        setIsLoading(false);
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
            distance: item.distance || "N/A",
            travel_time: item.travel_time || "N/A",
            distanceValue: parseDistance(item.distance || "0"),
            travelTimeValue: parseTravelTime(item.travel_time || "0"),
          };
        });

      console.log("Transformed cards:", transformedCards.length, "items");
      setCards(transformedCards);

      // Save to cache for future use
      if (transformedCards.length > 0) {
        saveRecommendationsToCache(transformedCards);
        setHasCachedData(false); // This is fresh data
      }

      // If no recommendations after successful fetch, show helpful message
      if (transformedCards.length === 0) {
        console.log("No recommendations found after transformation");
        setError(
          "No recommendations available. Please complete the questionnaire first to get personalized recommendations.",
        );
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching recommendations:", err);

      if (err instanceof Error) {
        if (
          err.message.includes("Authentication required") ||
          err.message.includes("Please log in again") ||
          err.message.includes("401")
        ) {
          console.log("🔐 Authentication error detected, handling gracefully");
          handleAuthError(err);
          setError(
            "Your session has expired. Redirecting to login page...",
          );
        } else if (err.message.includes("Unable to connect") || err.message.includes("timeout")) {
          setError(
            "Unable to connect to the backend server. Please check if the backend is running and try again.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to fetch recommendations. Please try again.");
      }
      setIsLoading(false);
    }
  };

  // Load cache on component mount, then fetch if needed
  useEffect(() => {
    // First try to load from cache
    if (isAuthenticated) {
      const cachedData = loadRecommendationsFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log("📂 Loaded cached data on mount");
        setCards(cachedData);
        setHasCachedData(true);
        setIsLoading(false);
        return;
      }
    }

    // If no cache or not authenticated, fetch fresh data
    fetchRecommendations();
  }, [isAuthenticated]);

  // Clear cache when questionnaire is updated or user logs out
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'tempQuestionnaireData' && event.newValue) {
        // Questionnaire was updated, clear recommendations cache
        console.log("🔄 Questionnaire updated, clearing recommendations cache");
        clearRecommendationsCache();
      }
    };

    // Listen for changes to temporary questionnaire data
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  // Sort function based on selected sort option
  const getSortFunction = (sortOption: string) => {
    switch (sortOption) {
      case "best_match":
        return (a: RecommendationCard, b: RecommendationCard) => (b.score || 0) - (a.score || 0);
      case "budget_low_high":
        return (a: RecommendationCard, b: RecommendationCard) => a.price - b.price;
      case "budget_high_low":
        return (a: RecommendationCard, b: RecommendationCard) => b.price - a.price;
      case "distance":
        return (a: RecommendationCard, b: RecommendationCard) => a.distanceValue - b.distanceValue;
      case "travel_time":
        return (a: RecommendationCard, b: RecommendationCard) => a.travelTimeValue - b.travelTimeValue;
      default:
        return (a: RecommendationCard, b: RecommendationCard) => (b.score || 0) - (a.score || 0);
    }
  };

  // Filter cards based on selected filters
  const filteredCards = cards
    .filter((card) => selectedAreas.includes(card.type))
    .filter((card) => card.price <= budget)
    .sort(getSortFunction(sortBy));

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>Authentication Required</h2>
          <p className="mb-6" style={{ color: 'var(--text-600)' }}>
            Please log in to view your personalized recommendations.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary btn-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="card p-6 sticky top-4" style={{ background: 'var(--surface)' }}>
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={toggleFilters}
              >
                <div className="flex items-center gap-2">
                  <FiFilter className="text-xl" style={{ color: 'var(--text-900)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-900)' }}>Filters</h2>
                </div>
                {showFilters ? (
                  <FiChevronUp style={{ color: 'var(--text-600)' }} />
                ) : (
                  <FiChevronDown style={{ color: 'var(--text-600)' }} />
                )}
              </div>

              {showFilters && (
                <div className="space-y-6">
                  {/* Budget Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-900)' }}>
                      Budget: LKR {budget.toLocaleString()}
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
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-600)' }}>
                      <span>LKR 5,000</span>
                      <span>LKR 500,000</span>
                    </div>
                  </div>

                  {/* Area Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-900)' }}>
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
                          <span className="text-sm" style={{ color: 'var(--text-600)' }}>
                            {area.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort Order Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-900)' }}>
                      Sort by
                    </label>
                    <CustomDropdown
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: 'best_match', label: 'Best match' },
                        { value: 'budget_low_high', label: 'Budget: Low → High' },
                        { value: 'budget_high_low', label: 'Budget: High → Low' },
                        { value: 'distance', label: 'Distance: Nearest first' },
                        { value: 'travel_time', label: 'Travel time: Shortest first' }
                      ]}
                    />
                    {/* Sort indicator */}
                    <div className="mt-2 text-xs" style={{ color: 'var(--text-600)' }}>
                      {sortBy === 'best_match' && 'Showing most relevant destinations first'}
                      {sortBy === 'budget_low_high' && 'Showing cheapest destinations first'}
                      {sortBy === 'budget_high_low' && 'Showing most expensive destinations first'}
                      {sortBy === 'distance' && 'Showing nearest destinations first'}
                      {sortBy === 'travel_time' && 'Showing quickest destinations first'}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setSelectedAreas(areas.map((a) => a.id));
                      setBudget(50000);
                      setSortBy("best_match");
                    }}
                    className="w-full btn btn-secondary btn-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h1 className="mb-2" style={{ color: 'var(--text-900)' }}>
                    Travel Recommendations
                  </h1>
                  <p style={{ color: 'var(--text-600)' }}>
                    {isLoading
                      ? "Loading your personalized recommendations..."
                      : `Found ${filteredCards.length} personalized recommendations`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      navigate("/create-itinerary");
                    }}
                    className="btn btn-primary btn-md flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>🗺️</span>
                    Create Itinerary
                  </button>
                  <button
                    onClick={() => {
                      // Clear temporary questionnaire data when editing main questionnaire
                      sessionStorage.removeItem('tempQuestionnaireData');
                      clearRecommendationsCache(); // Clear recommendations cache too
                      console.log('Cleared temporary questionnaire data and recommendations cache - navigating to main questionnaire');
                      navigate("/questionnaire");
                    }}
                    className="btn btn-secondary btn-md flex items-center gap-2 whitespace-nowrap border-2 hover:bg-opacity-10"
                    style={{
                      borderColor: 'var(--primary-600)',
                      color: 'var(--primary-600)',
                      borderWidth: '2px',
                      borderStyle: 'solid'
                    }}
                  >
                    <span>📝</span>
                    Edit Questionnaire
                  </button>
                </div>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-600)' }}></div>
              </div>
            )}

            {/* Cards Grid */}
            {!isLoading && (
              <>
                {filteredCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCards.map((card) => (
                      <div
                        key={card.id}
                        className="group card p-0 flex flex-col overflow-hidden cursor-pointer hover:scale-102 transition-all duration-300 hover:shadow-lg"
                        style={{ background: 'var(--surface)' }}
                      >
                        {/* Destination Image with Price Badge */}
                        <div className="relative h-48 overflow-hidden">
                          {card.thumbnail_img ? (
                            <img
                              src={`http://localhost:8000${card.thumbnail_img}`}
                              alt={card.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement
                                  ?.querySelector(".fallback-content")
                                  ?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div
                            className={`fallback-content absolute inset-0 flex flex-col items-center justify-center text-center p-2 ${card.thumbnail_img ? "hidden" : ""}`}
                            style={{ background: 'var(--surface-alt)', color: 'var(--text-600)' }}
                          >
                            <div className="text-4xl mb-2">🏞️</div>
                            <div className="text-sm font-medium">
                              {card.name}
                            </div>
                          </div>
                          {/* Bookmark Button */}
                          <BookmarkButton
                            destinationName={card.name}
                            variant="card"
                            size="sm"
                          />
                          {/* Price Badge */}
                          <div className="absolute top-3 right-3 px-2 py-1 rounded text-white text-sm font-semibold" style={{ background: 'var(--primary-700)' }}>
                            LKR {card.price.toLocaleString()}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="flex-grow p-4">
                          {/* Name */}
                          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-900)' }}>
                            {card.name}
                          </h3>

                          {/* Description */}
                          <p className="text-sm mb-3" style={{ color: 'var(--text-600)' }}>
                            {card.description}
                          </p>

                          {/* Match Score */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium" style={{ color: 'var(--text-600)' }}>
                                Match Score
                              </span>
                              <span className="text-xs font-semibold" style={{ color: 'var(--text-900)' }}>
                                {Math.round(Math.min(card.score * 100, 100))}%
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className={`progress-fill ${card.score >= 0.85 ? 'progress-green' :
                                  card.score >= 0.70 ? 'progress-sky' :
                                    'progress-amber'
                                  }`}
                                style={{
                                  width: `${Math.min(card.score * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Button always at bottom */}
                        <div className="p-4 pt-0">
                          <button
                            onClick={() => {
                              startRouteTransition('destination');
                              navigate(`/destination/${card.id}`);
                            }}
                            className="btn btn-primary btn-md w-full"
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
                          clearRecommendationsCache(); // Clear cache before refreshing
                          fetchRecommendations(true); // Force refresh from API
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
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 3000);

                            const response = await fetch(
                              "http://localhost:8000/docs",
                              {
                                signal: controller.signal,
                                mode: 'cors'
                              }
                            );

                            clearTimeout(timeoutId);
                            console.log(
                              "Direct fetch to /docs:",
                              response.status,
                              response.ok,
                            );
                          } catch (err: any) {
                            if (err.name === 'AbortError') {
                              console.log("Test API: Request timeout");
                            } else {
                              console.log("Test API: Connection failed - this is expected when backend is not running");
                            }
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors font-medium text-sm"
                      >
                        Test API
                      </button>
                      <button
                        onClick={() => {
                          // Clear temporary questionnaire data when editing main questionnaire
                          sessionStorage.removeItem('tempQuestionnaireData');
                          clearRecommendationsCache(); // Clear recommendations cache too
                          console.log('Cleared temporary questionnaire data and recommendations cache - navigating to main questionnaire');
                          navigate("/questionnaire");
                        }}
                        className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded transition-colors font-medium border-2 border-white"
                      >
                        Edit Questionnaire
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-cyan-600 p-6 rounded-lg shadow-md text-center text-white">
                    <div className="flex flex-col items-center">
                      <h3 className="text-xl font-semibold mb-2 text-cyan-100">
                        No recommendations match your current filters
                      </h3>
                      <p className="text-sm mb-5 max-w-md text-cyan-100">
                        We couldn't find any destinations that match your selected budget and areas.
                        Try adjusting your filters to see more options.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button
                          onClick={() => {
                            setSelectedAreas(areas.map((a) => a.id));
                            setBudget(50000);
                            setSortBy("best_match");
                          }}
                          className="bg-white text-cyan-700 hover:bg-gray-50 px-5 py-2 rounded-md transition-colors font-medium text-sm shadow-sm"
                        >
                          Reset All Filters
                        </button>
                        <button
                          onClick={() => setBudget(500000)}
                          className="bg-cyan-700 text-white hover:bg-cyan-800 px-5 py-2 rounded-md transition-colors font-medium text-sm shadow-sm border border-cyan-500"
                        >
                          Increase Budget
                        </button>
                      </div>
                    </div>
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
