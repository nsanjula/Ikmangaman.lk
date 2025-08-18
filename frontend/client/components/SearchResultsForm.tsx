import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useApiWithLoading } from "../contexts/LoadingContext";
import { authAPI } from "../lib/api";
import BookmarkButton from "./BookmarkButton";

interface SearchResultCard {
  id: number;
  name: string;
  description: string;
  score: number;
  type: string; // Primary area type for display
  areaTypes?: string[]; // All area types from backend for filtering (optional)
  things_to_do: string;
  thumbnail_img: string;
  match_score: number;
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

const SearchResultsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, handleAuthError } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  
  const [showFilters, setShowFilters] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    "hill_country",
    "coastal",
    "dry_zone",
    "urban",
  ]);
  const [cards, setCards] = useState<SearchResultCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("best_match");
  const [restoredImageFile, setRestoredImageFile] = useState<File | null>(null);

  // Get search query and type from URL or location state
  const searchQuery = searchParams.get('q') || '';
  // Determine search type with enhanced fallback logic
  const getSearchType = () => {
    // First try URL params
    const urlType = searchParams.get('type');
    if (urlType) return urlType;

    // Then try location state
    const stateType = location.state?.type;
    if (stateType) return stateType;

    // Finally check if we have cached image search data
    const cachedImageData = sessionStorage.getItem('searchResults_image_latest');
    if (cachedImageData) {
      try {
        const parsed = JSON.parse(cachedImageData);
        if (parsed.searchType === 'image' && parsed.cards && parsed.cards.length > 0) {
          return 'image';
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return 'text';
  };

  const searchType = getSearchType();
  const imageFile = location.state?.imageFile;

  // Debug logging for image search context
  useEffect(() => {
    if (searchType === 'image') {
      console.log('Image search context:', {
        searchType,
        hasImageFile: !!imageFile,
        imageFileName: imageFile?.name,
        locationState: location.state,
        searchParams: Object.fromEntries(searchParams.entries())
      });
    }
  }, [searchType, imageFile, location.state, searchParams]);

  // Generate a unique key for this search session that includes image file info
  const imageFileName = imageFile?.name || '';
  const imageFileSize = imageFile?.size || 0;
  const searchSessionKey = `search_${searchType}_${searchQuery || `image_${imageFileName}_${imageFileSize}`}_${Date.now()}`;

  // Try to restore search results from sessionStorage if available
  const [searchResultsCache, setSearchResultsCache] = useState<any>(null);
  const [cacheRestored, setCacheRestored] = useState<boolean>(false);
  const [actualSearchType, setActualSearchType] = useState<string>(searchType);

  // Helper function to get area types from backend filter data
  const getAreaTypes = (filters: string[]): string[] => {
    // Return the filters from backend directly, or fallback to empty array
    return filters || [];
  };

  // Helper function to get primary area type for card display (use first filter)
  const getPrimaryAreaType = (filters: string[]): string => {
    // Use the first filter as primary, or fallback to "coastal" for display
    return filters && filters.length > 0 ? filters[0] : "coastal";
  };

  // If a new image is provided for image search, clear any previous image-search caches
  useEffect(() => {
    if (searchType === 'image' && imageFile) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key === 'searchResults_image_latest' || key.startsWith('searchResults_image_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
        setCacheRestored(false);
        setSearchResultsCache(null);
        setCards([]);
        setIsLoading(true);
        setError(null);
      } catch {}
    }
  }, [searchType, imageFile]);

  const performSearch = async () => {
    try {
      setError(null);

      if (!isAuthenticated) {
        setError("Please log in to search destinations");
        setIsLoading(false);
        return;
      }

      let searchResults;

      if (searchType === 'image' && imageFile) {
        // Perform image search
        searchResults = await callWithLoading(
          async () => {
            const result = await authAPI.searchByImage(imageFile);
            return result;
          },
          'image-search',
          'Searching by image...'
        );
      } else if (searchType === 'text' && searchQuery) {
        // Perform text search
        searchResults = await callWithLoading(
          async () => {
            const result = await authAPI.searchByText(searchQuery);
            return result;
          },
          'text-search',
          'Searching destinations...'
        );
      } else {
        setError("No search query provided");
        setIsLoading(false);
        return;
      }

      // Check if search results exist and have results array
      if (!searchResults || !searchResults.results || !Array.isArray(searchResults.results)) {
        console.log("Invalid search results format:", searchResults);
        setError("No matching destinations found for your search.");
        setCards([]);
        setIsLoading(false);
        return;
      }

      // Handle empty results array
      if (searchResults.results.length === 0) {
        console.log("Search returned empty results array");
        setError("No matching destinations found for your search.");
        setCards([]);
        setIsLoading(false);
        return;
      }

      // Transform search results to match card format
      const transformedCards: SearchResultCard[] = searchResults.results
        .filter((item: any) => item && item.destination_id && item.destination_name)
        .map((item: any) => {
          const areaTypes = getAreaTypes(item.filters);
          return {
            id: item.destination_id,
            name: item.destination_name || "Unknown Destination",
            description: item.description || "Explore this amazing destination",
            score: item.visual_match_score || 0,
            type: getPrimaryAreaType(areaTypes), // Use primary area for card type
            areaTypes: areaTypes, // Store all area types for filtering
            things_to_do: Array.isArray(item.things_to_do) ? item.things_to_do.join(", ") : "",
            thumbnail_img: item["destination image"] || "",
            match_score: item.visual_match_score || 0,
          };
        });

      console.log(`Transformed ${transformedCards.length} search results`);
      setCards(transformedCards);
      setActualSearchType(searchType); // Update actual search type

      if (transformedCards.length === 0) {
        setError("No matching destinations found for your search.");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error performing search:", err);

      if (err instanceof Error) {
        if (
          err.message.includes("Authentication required") ||
          err.message.includes("Please log in again") ||
          err.message.includes("401")
        ) {
          handleAuthError(err);
          setError("Your session has expired. Redirecting to login page...");
        } else if (err.message.includes("404") || err.message.includes("No destinations found")) {
          setError("No matching destinations found for your search.");
        } else {
          setError(err.message || "Failed to perform search. Please try again.");
        }
      } else {
        setError("Failed to perform search. Please try again.");
      }

      // Always ensure loading is stopped and cards are cleared on error
      setCards([]);
      setIsLoading(false);
    }
  };

  // Immediate cache check for image searches on component mount
  useEffect(() => {
    if (searchType === 'image' && !cacheRestored && !imageFile) {
      const immediateCache = sessionStorage.getItem('searchResults_image_latest');
      if (immediateCache) {
        try {
          const parsed = JSON.parse(immediateCache);
          if (parsed.cards && parsed.cards.length > 0) {
            const hasMatchScores = parsed.cards.some(card =>
              card.match_score !== undefined && card.match_score !== null
            );
            if (hasMatchScores) {
              console.log('🚀 Immediate cache hit for image search with match scores');
              setCards(parsed.cards);
              setActualSearchType('image'); // Ensure we know this is an image search
              setIsLoading(false);
              setCacheRestored(true);
              setError(null);
              return;
            }
          }
        } catch (e) {
          console.log('Immediate cache parse failed:', e);
        }
      }
    }
  }, [searchType, cacheRestored, imageFile]);

  // Try to restore cached results on component mount
  useEffect(() => {
    let foundCache = false;
    let cachedData = null;
    let cacheKey = '';

    // For image searches, always try to find the most recent image search cache
    if (searchType === 'image' && !imageFile) {
      // First, try the generic latest cache key
      const genericKey = 'searchResults_image_latest';
      cachedData = sessionStorage.getItem(genericKey);

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed.cards && parsed.cards.length > 0) {
            // Validate that cached cards have match_score data for image searches
            const hasMatchScores = parsed.cards.some(card =>
              card.match_score !== undefined && card.match_score !== null
            );
            if (searchType === 'image' && !hasMatchScores) {
              console.log('Image cache missing match scores, invalidating cache');
              sessionStorage.removeItem(genericKey);
              cachedData = null;
            } else {
              cacheKey = genericKey;
              console.log('Found image search cache with latest key, match scores present:', hasMatchScores);
            }
          } else {
            cachedData = null;
          }
        } catch (e) {
          console.log('Corrupted cache data, removing:', e);
          sessionStorage.removeItem(genericKey);
          cachedData = null;
        }
      }

      // If no generic cache found, look for any recent image search cache
      if (!cachedData) {
        let mostRecentKey = null;
        let mostRecentTimestamp = 0;

        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('searchResults_image_')) {
            const testData = sessionStorage.getItem(key);
            if (testData) {
              try {
                const parsed = JSON.parse(testData);
                if (parsed.cards && parsed.cards.length > 0 &&
                    parsed.timestamp && parsed.timestamp > mostRecentTimestamp) {
                  mostRecentKey = key;
                  mostRecentTimestamp = parsed.timestamp;
                  cachedData = testData;
                }
              } catch (e) {
                console.log('Removing corrupted cache:', key);
                sessionStorage.removeItem(key);
              }
            }
          }
        }

        if (mostRecentKey) {
          cacheKey = mostRecentKey;
          console.log('Found most recent image search cache:', mostRecentKey);
        }
      }
    } else {
      // For text searches, use specific cache key
      cacheKey = `searchResults_${searchType}_${searchQuery}`;
      cachedData = sessionStorage.getItem(cacheKey);
    }

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);

        // For image searches, ensure match_score data integrity
        let restoredCards = parsed.cards;
        if (searchType === 'image') {
          restoredCards = parsed.cards.map(card => ({
            ...card,
            match_score: card.match_score !== undefined ? card.match_score : (card.score || 0),
            score: card.score !== undefined ? card.score : (card.match_score || 0)
          }));

          console.log('Image search cache restoration - cards with match_score:',
            restoredCards.filter(c => c.match_score !== undefined).length);
        }

        setSearchResultsCache(parsed);
        setCards(restoredCards);
        setActualSearchType(parsed.searchType || searchType); // Use cached search type
        setIsLoading(false);
        foundCache = true;
        setCacheRestored(true);
        setError(null);

        console.log(`Restored ${searchType} search results from cache:`, cacheKey);
        console.log('Cache validation - first card match_score:', restoredCards[0]?.match_score);
        return;
      } catch (e) {
        console.log('Cache parsing failed, removing corrupted cache:', e);
        if (cacheKey) {
          sessionStorage.removeItem(cacheKey);
        }
      }
    }

    // Only perform search if we didn't find cache and have search data
    if (!foundCache) {
      // If we have search parameters, perform search
      if (searchQuery || imageFile) {
        performSearch();
      } else {
        // If no search parameters, try to restore from back state
        try {
          const searchBackState = sessionStorage.getItem('searchBackState');
          if (searchBackState) {
            const parsedBackState = JSON.parse(searchBackState);
            console.log('Attempting to restore from searchBackState:', parsedBackState);

            // Try to find cache based on back state
            let backStateCacheKey = '';
            if (parsedBackState.searchType === 'image') {
              backStateCacheKey = 'searchResults_image_latest';
            } else {
              backStateCacheKey = `searchResults_${parsedBackState.searchType}_${parsedBackState.searchQuery}`;
            }

            const backStateCache = sessionStorage.getItem(backStateCacheKey);
            if (backStateCache) {
              const parsed = JSON.parse(backStateCache);
              setSearchResultsCache(parsed);
              setCards(parsed.cards);
              setIsLoading(false);
              setError(null);
              console.log('Restored search results from back state cache');
              return;
            }
          }
        } catch (e) {
          console.log('Failed to restore from back state:', e);
        }

        // If still no cache found, show appropriate error
        if (searchType === 'image' && !imageFile) {
          setError("Image search data not available. Please try searching again.");
        } else {
          setError("No search query provided");
        }
        setIsLoading(false);
      }
    }
  }, [searchQuery, imageFile, isAuthenticated]);

  // Save results to cache whenever cards are updated
  useEffect(() => {
    if (cards.length > 0) {
      const timestamp = Date.now();

      // For image searches, ensure match_score is preserved
      const validatedCards = searchType === 'image'
        ? cards.map(card => ({
            ...card,
            match_score: card.match_score !== undefined ? card.match_score : 0,
            score: card.score !== undefined ? card.score : card.match_score || 0
          }))
        : cards;

      const cacheData = {
        cards: validatedCards,
        timestamp,
        searchType,
        searchQuery,
        imageFile: searchType === 'image' ? {
          name: imageFileName,
          size: imageFileSize,
          type: imageFile?.type
        } : null
      };

      if (searchType === 'image') {
        // For image searches, always save with a consistent latest key
        const latestKey = 'searchResults_image_latest';
        sessionStorage.setItem(latestKey, JSON.stringify(cacheData));

        // Also save with a timestamped key for backup
        const timestampedKey = `searchResults_image_${timestamp}`;
        sessionStorage.setItem(timestampedKey, JSON.stringify(cacheData));

        console.log('Saved image search cache with keys:', latestKey, timestampedKey);
        console.log('Cache save validation - first card match_score:', cards[0]?.match_score);
        console.log('Cache save validation - cards with match_score:', cards.filter(c => c.match_score !== undefined).length);

        // Clean up old image search caches (keep only the latest 3)
        const imageKeys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('searchResults_image_') && key !== latestKey) {
            imageKeys.push(key);
          }
        }

        // Sort by timestamp (extract from key) and remove oldest
        imageKeys.sort((a, b) => {
          const aTimestamp = parseInt(a.split('_').pop() || '0');
          const bTimestamp = parseInt(b.split('_').pop() || '0');
          return bTimestamp - aTimestamp;
        });

        // Remove excess caches (keep latest 3)
        if (imageKeys.length > 3) {
          for (let i = 3; i < imageKeys.length; i++) {
            sessionStorage.removeItem(imageKeys[i]);
          }
        }
      } else {
        // For text searches, use specific cache key
        const cacheKey = `searchResults_${searchType}_${searchQuery}`;
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('Saved text search cache with key:', cacheKey);
      }
    }
  }, [cards, searchType, searchQuery, imageFileName, imageFileSize, imageFile]);

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
        return (a: SearchResultCard, b: SearchResultCard) => (b.match_score || 0) - (a.match_score || 0);
      case "alphabetical":
        return (a: SearchResultCard, b: SearchResultCard) => a.name.localeCompare(b.name);
      default:
        return (a: SearchResultCard, b: SearchResultCard) => (b.match_score || 0) - (a.match_score || 0);
    }
  };

  // Filter cards based on selected filters - use backend filter data
  const filteredCards = cards
    .filter((card) => {
      // Check if any of the card's area types match selected areas
      // If no areaTypes available, fallback to using the card's type property
      if (card.areaTypes && card.areaTypes.length > 0) {
        return card.areaTypes.some(areaType => selectedAreas.includes(areaType));
      } else {
        // Fallback to using the primary type if no areaTypes available
        return selectedAreas.includes(card.type);
      }
    })
    .sort(getSortFunction(sortBy));

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>Authentication Required</h2>
          <p className="mb-6" style={{ color: 'var(--text-600)' }}>
            Please log in to search destinations.
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
          {/* Filters Sidebar - Remove Budget and Sort By */}
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
                        { value: 'alphabetical', label: 'Alphabetical' }
                      ]}
                    />
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setSelectedAreas(areas.map((a) => a.id));
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
            {/* Header - Modified text and removed Edit Questionnaire button */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h1 className="mb-2" style={{ color: 'var(--text-900)' }}>
                    Search Results
                  </h1>
                  <p style={{ color: 'var(--text-600)' }}>
                    {isLoading
                      ? "Searching for matching destinations..."
                      : `Found ${filteredCards.length} matching results`}
                  </p>
                  {searchType === 'text' && searchQuery && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-600)' }}>
                      Searching for: "{searchQuery}"
                    </p>
                  )}
                  {searchType === 'image' && imageFile && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-600)' }}>
                      Image search: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
              {error && (
                <div className="card p-4 border-l-4" style={{
                  background: 'var(--primary-100)',
                  borderLeftColor: 'var(--primary-600)',
                  borderColor: 'var(--primary-200)'
                }}>
                  <p style={{ color: 'var(--primary-700)' }}>ℹ️ {error}</p>
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
                        {/* Destination Image */}
                        <div className="relative h-48 overflow-hidden">
                          {card.thumbnail_img ? (
                            <img
                              src={`https://ikmangamanlk-production.up.railway.app${card.thumbnail_img}`}
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
                        </div>

                        {/* Card Content - Modified based on search type */}
                        <div className="flex-grow p-4">
                          {/* Name */}
                          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-900)' }}>
                            {card.name}
                          </h3>

                          {/* Description - Only show for image search with match quality */}
                          {actualSearchType === 'image' && card.match_score !== undefined && (
                            <p className="text-sm mb-3" style={{ color: 'var(--text-600)' }}>
                              {card.match_score >= 0.85 ? 'Good Match' :
                               card.match_score >= 0.70 ? 'Average Match' :
                               'Bad Match'}
                            </p>
                          )}

                          {/* Match Score - Only show for image search */}
                          {actualSearchType === 'image' && card.match_score !== undefined && card.match_score !== null && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium" style={{ color: 'var(--text-600)' }}>
                                  Match Score
                                </span>
                                <span className="text-xs font-semibold" style={{ color: 'var(--text-900)' }}>
                                  {Math.round(Math.min((card.match_score || 0) * 100, 100))}%
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className={`progress-fill ${(card.match_score || 0) >= 0.85 ? 'progress-green' :
                                    (card.match_score || 0) >= 0.70 ? 'progress-sky' :
                                      'progress-amber'
                                    }`}
                                  style={{
                                    width: `${Math.min((card.match_score || 0) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Button always at bottom */}
                        <div className="p-4 pt-0">
                          <button
                            onClick={() => {
                              // Clear temporary questionnaire data when navigating to a different destination
                              sessionStorage.removeItem('tempQuestionnaireData');
                              sessionStorage.removeItem('tempQuestionnaireDestinationData');
                              sessionStorage.removeItem('tempQuestionnaireParams');
                              console.log('Cleared temporary questionnaire data - navigating to new destination');

                              // Store current search state for easy back navigation
                              const backState = {
                                searchQuery,
                                searchType,
                                imageFile,
                                cards,
                                filters: { selectedAreas, sortBy }
                              };
                              sessionStorage.setItem('searchBackState', JSON.stringify(backState));

                              navigate(`/search/destination/${card.id}`, {
                                state: { fromSearch: true, backState }
                              });
                            }}
                            className="btn btn-primary btn-md w-full"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card p-8 text-center" style={{ background: 'var(--surface)' }}>
                    <div className="text-6xl mb-4" style={{ color: 'var(--text-600)' }}>🔍</div>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                      No matching destinations found
                    </h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-600)' }}>
                      {error || "Try adjusting your search criteria or filters to find more destinations."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          // Clear temporary questionnaire data when returning to recommendations
                          sessionStorage.removeItem('tempQuestionnaireData');
                          sessionStorage.removeItem('has_visited_create_itinerary');
                          console.log('Cleared temporary questionnaire data - navigating to recommendations');
                          navigate("/recommendation");
                        }}
                        className="btn btn-primary btn-md"
                      >
                        Browse Recommendations
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAreas(areas.map((a) => a.id));
                          setSortBy("best_match");
                        }}
                        className="btn btn-secondary btn-md"
                      >
                        Reset Filters
                      </button>
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

export default SearchResultsForm;
