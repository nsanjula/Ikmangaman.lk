import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, DestinationDetails } from '../lib/api';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

interface QuestionnaireData {
  starting_location_latitudes: number;
  starting_location_longitudes: number;
  [key: string]: any;
}

interface DestinationContextData {
  destinationData: DestinationDetails | null;
  questionnaireData: QuestionnaireData | null;
  loading: boolean;
  error: string | null;
  isFallbackData: boolean;
  retry: () => void;
}

const DestinationContext = createContext<DestinationContextData | undefined>(undefined);

export const useDestination = () => {
  const context = useContext(DestinationContext);
  if (!context) {
    throw new Error('useDestination must be used within a DestinationProvider');
  }
  return context;
};

// Helper function to get coordinates for location names
const getLocationCoordinates = (locationName: string) => {
  const locationCoords: Record<string, { lat: number; lng: number }> = {
    "Ella": { lat: 6.8667, lng: 81.0467 },
    "Kandy": { lat: 7.2906, lng: 80.6337 },
    "Mirissa": { lat: 5.9485, lng: 80.4714 },
    "Sigiriya": { lat: 7.957, lng: 80.7603 },
    "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
    "Anuradhapura": { lat: 8.3114, lng: 80.4037 },
    "Galle": { lat: 6.032, lng: 80.217 },
    "Trincomalee": { lat: 8.5874, lng: 81.2152 },
    "Polonnaruwa": { lat: 7.9403, lng: 81.0188 },
    "Jaffna": { lat: 9.6615, lng: 80.0255 },
    "Arugam Bay": { lat: 6.8433, lng: 81.8339 },
    "Haputale": { lat: 6.7652, lng: 80.9512 },
    "Negombo": { lat: 7.2083, lng: 79.8358 },
    "Matale": { lat: 7.4659, lng: 80.6234 },
    "Kalpitiya": { lat: 8.2294, lng: 79.7168 },
    "Kitulgala": { lat: 6.9883, lng: 80.422 },
    "Dambulla": { lat: 7.8567, lng: 80.6492 },
    "Bentota": { lat: 6.4214, lng: 80.0041 },
    "Udawalawe": { lat: 6.4241, lng: 80.888 },
    "Colombo": { lat: 6.9271, lng: 79.8612 },
    "Yala": { lat: 6.4014, lng: 81.5194 },
    "Badulla": { lat: 6.9934, lng: 81.055 },
    "Mannar": { lat: 8.9775, lng: 79.9044 },
    "Ratnapura": { lat: 6.6828, lng: 80.3994 },
    "Puttalam": { lat: 8.035, lng: 79.8428 },
    "Hambantota": { lat: 6.1243, lng: 81.1185 },
    "Pasikuda": { lat: 7.9252, lng: 81.5612 },
    "Katharagama": { lat: 6.4211, lng: 81.3312 },
    // Legacy entries for backward compatibility
    "Pollonaruwa": { lat: 7.9403, lng: 81.0188 }, // Alternative spelling
    "Matara": { lat: 5.9485, lng: 80.5353 },
    "Batticaloa": { lat: 7.7102, lng: 81.6924 },
    "Kurunegala": { lat: 7.4818, lng: 80.3609 },
    "Vavniya": { lat: 8.7514, lng: 80.4971 },
    "Kalutara": { lat: 6.5854, lng: 79.9607 },
    "Ampara": { lat: 7.2981, lng: 81.6821 },
  };

  return locationCoords[locationName] || { lat: 6.9271, lng: 79.8612 }; // Fallback to Colombo
};

// Global helper function to clear all destination cache (for debugging)
export const clearAllDestinationCache = (): void => {
  const allKeys = Object.keys(sessionStorage);
  const destinationCacheKeys = allKeys.filter(key =>
    key.startsWith('tempQuestionnaireData_') ||
    key.startsWith('tempQuestionnaireDestinationData_') ||
    key.startsWith('tempDestinationData_') ||
    key.startsWith('tempQuestionnaireParams_')
  );

  console.log(`🧹 Clearing all destination cache keys:`, destinationCacheKeys);
  destinationCacheKeys.forEach(key => sessionStorage.removeItem(key));

  // Make it globally accessible for debugging
  if (typeof window !== 'undefined') {
    (window as any).clearDestinationCache = clearAllDestinationCache;
  }
};

// Initialize global helper on module load
if (typeof window !== 'undefined') {
  (window as any).clearDestinationCache = clearAllDestinationCache;

  // Add authentication troubleshooting helper
  (window as any).debugDestinationAuth = () => {
    const token = authAPI.getToken();
    console.log('🔍 Destination Auth Debug:');
    console.log('- Token exists:', !!token);
    console.log('- Token preview:', token ? `${token.substring(0, 20)}...` : 'none');
    console.log('- Current URL:', window.location.href);
    console.log('- Session storage keys:', Object.keys(sessionStorage).filter(k => k.includes('temp')));

    if (!token) {
      console.log('❌ No authentication token found. Please log in.');
      return { authenticated: false, hasToken: false };
    }

    if (token.length < 10 || !token.includes('.')) {
      console.log('❌ Token appears malformed.');
      return { authenticated: false, hasToken: true, tokenMalformed: true };
    }

    console.log('✅ Token appears valid.');
    return { authenticated: true, hasToken: true, tokenValid: true };
  };
}

interface DestinationProviderProps {
  children: React.ReactNode;
  destinationId: number;
  itineraryId?: number;
  dayNumber?: number;
  useItineraryContext?: boolean;
  contextType?: 'search' | 'saved' | 'itinerary';
}

export const DestinationProvider: React.FC<DestinationProviderProps> = ({
  children,
  destinationId,
  itineraryId,
  dayNumber,
  useItineraryContext = false,
  contextType
}) => {
  const [destinationData, setDestinationData] = useState<DestinationDetails | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isAuthenticated, logout } = useAuth();
  const { startLoading, setProgress, finishLoading } = useLoading();

  const fetchAllData = useCallback(async () => {
    if (!destinationId) {
      setLoading(false);
      return;
    }

    // Comprehensive authentication check
    const token = authAPI.getToken();
    if (!isAuthenticated || !token) {
      console.log("🚫 User not authenticated or no token found");
      console.log("isAuthenticated:", isAuthenticated, "token exists:", !!token);

      if (!token) {
        // Clear auth state to ensure consistency
        logout();
      }

      setLoading(false);
      setError("Please log in to view destination details.");
      return;
    }

    // For itinerary context, we need both itineraryId and dayNumber
    if (useItineraryContext && (!itineraryId || !dayNumber)) {
      setError("Missing itinerary information for context-aware destination details");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsFallbackData(false);

      // Ensure any previous loading state is cleared first
      finishLoading('destination-data');

      // Small delay to ensure cleanup completes before starting new loading
      await new Promise(resolve => setTimeout(resolve, 50));

      // Start loading screen and ensure it's visible by scrolling to top
      startLoading('destination-data', `Loading destination details...`);
      // Scroll to top immediately to ensure loading animation is visible
      window.scrollTo({ top: 0, behavior: 'instant' });
      setProgress(10);

      // Check authentication status first
      const token = authAPI.getToken();
      if (!token) {
        console.log("🔐 No token found, triggering logout");
        logout();
        throw new Error("Please log in to view destination details.");
      }

      // Additional validation: check if token looks valid (not empty or malformed)
      if (token.length < 10 || !token.includes('.')) {
        console.log("🔐 Token appears malformed, clearing and triggering logout");
        authAPI.removeToken();
        logout();
        throw new Error("Invalid authentication token. Please log in again.");
      }

      console.log(`🔑 Using token for API call: ${token.substring(0, 20)}...`);

      // Set progress for concurrent API calls
      setProgress(30);

      // Create destination-specific and context-aware cache keys
      let contextPrefix: string;
      if (contextType) {
        contextPrefix = contextType === 'itinerary' ? `itinerary_${itineraryId}_${dayNumber}` : contextType;
      } else {
        contextPrefix = useItineraryContext ? `itinerary_${itineraryId}_${dayNumber}` : 'search';
      }
      const tempQuestionnaireKey = `tempQuestionnaireData_${contextPrefix}_${destinationId}`;
      const tempData = sessionStorage.getItem(tempQuestionnaireKey);
      const tempCompletedKey = `tempQuestionnaireDestinationData_${contextPrefix}_${destinationId}`;
      const tempCompletedData = sessionStorage.getItem(tempCompletedKey);
      const tempDestinationKey = `tempDestinationData_${contextPrefix}_${destinationId}`;
      const tempDestinationData = sessionStorage.getItem(tempDestinationKey);
      const tempQuestionnaireParamsKey = `tempQuestionnaireParams_${contextPrefix}_${destinationId}`;

      // Debug logging for cache state
      console.log(`🔍 Cache lookup for destination ${destinationId} with context "${contextPrefix}"`);
      console.log(`📋 Cache keys being checked:`, {
        tempQuestionnaireKey,
        tempCompletedKey,
        tempDestinationKey,
        tempQuestionnaireParamsKey
      });

      // Clear any stale cache from other destinations to prevent cross-contamination
      const allKeys = Object.keys(sessionStorage);
      const destinationCacheKeys = allKeys.filter(key =>
        key.startsWith('tempQuestionnaireData_') ||
        key.startsWith('tempQuestionnaireDestinationData_') ||
        key.startsWith('tempDestinationData_') ||
        key.startsWith('tempQuestionnaireParams_')
      );

      console.log(`📊 All destination cache keys found:`, destinationCacheKeys);

      destinationCacheKeys.forEach(key => {
        if (!key.includes(`_${destinationId}`)) {
          console.log(`🧹 Clearing stale cache key: ${key}`);
          sessionStorage.removeItem(key);
        }
      });

      let useTemporaryQuestionnaire = false;
      let temporaryQuestionnaireData = null;

      // Check for itinerary temp destination data first (for itinerary context)
      if (useItineraryContext && tempDestinationData) {
        try {
          const parsedTempDestData = JSON.parse(tempDestinationData);
          console.log('Using itinerary temp destination data:', parsedTempDestData);

          // Check if this data contains the new questionnaire structure (destination_id, travel_month, etc.)
          if (parsedTempDestData.destination_id && parsedTempDestData.travel_month &&
              parsedTempDestData.no_of_people && parsedTempDestData.start_location) {

            // Make API call to get destination details with temp questionnaire
            setProgress(50);
            const tempQuestionnairePayload = {
              destination_id: parsedTempDestData.destination_id,
              travel_month: parsedTempDestData.travel_month,
              no_of_people: parsedTempDestData.no_of_people,
              start_location: parsedTempDestData.start_location
            };

            console.log('Making temp questionnaire API call with payload:', tempQuestionnairePayload);
            const destinationDetailsWithTemp = await authAPI.getDestinationWithTempQuestionnaire(tempQuestionnairePayload);

            // Create questionnaire data for map
            const locationCoords = getLocationCoordinates(parsedTempDestData.start_location);
            const questionnaireDataForMap = {
              starting_location_latitudes: locationCoords.lat,
              starting_location_longitudes: locationCoords.lng,
              travel_month: parsedTempDestData.travel_month,
              no_of_people: parsedTempDestData.no_of_people,
              start_location: parsedTempDestData.start_location
            };

            setDestinationData(destinationDetailsWithTemp);
            setQuestionnaireData(questionnaireDataForMap);
            setIsFallbackData(false);
            setLoading(false);
            setError(null);
            setProgress(100);
            finishLoading('destination-data');

            // Clean up the temp data after successful use
            sessionStorage.removeItem(tempDestinationKey);
            console.log('✅ Successfully loaded destination with temp questionnaire data');
            return;

          } else if (parsedTempDestData.travel_month && parsedTempDestData.no_of_people && parsedTempDestData.start_location) {
            // Handle legacy temp destination data structure (for backward compatibility)
            setProgress(50);
            const tempQuestionnairePayload = {
              destination_id: destinationId,
              travel_month: parsedTempDestData.travel_month,
              no_of_people: parsedTempDestData.no_of_people,
              start_location: parsedTempDestData.start_location
            };

            const destinationDetailsWithTemp = await authAPI.getDestinationWithTempQuestionnaire(tempQuestionnairePayload);

            // Create questionnaire data for map
            const locationCoords = getLocationCoordinates(parsedTempDestData.start_location);
            const questionnaireDataForMap = {
              starting_location_latitudes: locationCoords.lat,
              starting_location_longitudes: locationCoords.lng,
              travel_month: parsedTempDestData.travel_month,
              no_of_people: parsedTempDestData.no_of_people,
              start_location: parsedTempDestData.start_location
            };

            setDestinationData(destinationDetailsWithTemp);
            setQuestionnaireData(questionnaireDataForMap);
            setIsFallbackData(false);
            setLoading(false);
            setError(null);
            setProgress(100);
            finishLoading('destination-data');

            // Clean up the temp data after successful use
            sessionStorage.removeItem(tempDestinationKey);
            console.log('✅ Successfully loaded destination with legacy temp data');
            return;
          }
        } catch (e) {
          console.warn('Failed to use itinerary temp destination data:', e);
          // Fall through to other methods
        }
      }

      // If itinerary context and no tempDestinationData yet, derive from previous day's selected destination
      if (useItineraryContext && itineraryId && dayNumber && (!tempDestinationData)) {
        try {
          const saved = localStorage.getItem('create_itinerary_state');
          if (saved) {
            const parsed = JSON.parse(saved);
            const prevDay = Number(dayNumber) - 1;
            const prevName: string | undefined = prevDay > 0 ? parsed?.days?.[prevDay]?.destination_name : undefined;
            const startLoc: string | undefined = prevDay > 0 ? prevName : parsed?.start_location;
            if (startLoc) {
              const payload = {
                destination_id: destinationId,
                travel_month: parsed?.travel_month || 'December',
                no_of_people: parsed?.no_of_people || 2,
                start_location: startLoc,
              };

              // Store for consistency with existing flow
              const derivedKey = `tempDestinationData_itinerary_${itineraryId}_${dayNumber}_${destinationId}`;
              sessionStorage.setItem(derivedKey, JSON.stringify(payload));

              // Call API same as tempDestinationData path
              setProgress(50);
              const destinationDetailsWithTemp = await authAPI.getDestinationWithTempQuestionnaire(payload);
              const coords = getLocationCoordinates(startLoc);
              const questionnaireDataForMap = {
                starting_location_latitudes: coords.lat,
                starting_location_longitudes: coords.lng,
                travel_month: payload.travel_month,
                no_of_people: payload.no_of_people,
                start_location: startLoc,
              };
              setDestinationData(destinationDetailsWithTemp);
              setQuestionnaireData(questionnaireDataForMap);
              setIsFallbackData(false);
              setLoading(false);
              setError(null);
              setProgress(100);
              finishLoading('destination-data');
              console.log('✅ Derived start location from previous day:', startLoc);
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to derive previous-day start location:', e);
        }
      }

      // Check for completed temp questionnaire data (from API call)
      if (tempCompletedData) {
        try {
          const parsedTempData = JSON.parse(tempCompletedData);
          // Use the destination data from temp questionnaire API call
          console.log('Using completed temp questionnaire destination data:', parsedTempData);

          // Also get the temp questionnaire parameters to create proper questionnaire data
          const tempQuestionnaireParams = sessionStorage.getItem(tempQuestionnaireParamsKey);
          let questionnaireDataForMap = null;

          if (tempQuestionnaireParams) {
            try {
              const params = JSON.parse(tempQuestionnaireParams);
              // Create questionnaire data with starting location coordinates
              // We need to convert location name to coordinates for the map
              const locationCoords = getLocationCoordinates(params.start_location);
              questionnaireDataForMap = {
                starting_location_latitudes: locationCoords.lat,
                starting_location_longitudes: locationCoords.lng,
                travel_month: params.travel_month,
                no_of_people: params.no_of_people,
                start_location: params.start_location
              };
              console.log('Created questionnaire data for map:', questionnaireDataForMap);
            } catch (e) {
              console.warn('Failed to parse temp questionnaire params:', e);
            }
          }

          setDestinationData(parsedTempData);
          setQuestionnaireData(questionnaireDataForMap);
          setIsFallbackData(false);
          setLoading(false);
          setError(null);

          // Don't clear temp data immediately - keep for potential return visits
          // sessionStorage.removeItem(tempCompletedKey);
          // sessionStorage.removeItem('tempQuestionnaireParams');
          return;
        } catch (e) {
          console.warn('Failed to parse completed temp questionnaire data, removing:', e);
          sessionStorage.removeItem(tempCompletedKey);
          // Also clean up related keys
          sessionStorage.removeItem(tempQuestionnaireParamsKey);
        }
      }

      // Fallback to regular temp questionnaire data (for search results)
      if (tempData) {
        try {
          temporaryQuestionnaireData = JSON.parse(tempData);
          useTemporaryQuestionnaire = true;
          console.log('Using temporary questionnaire data for destination:', temporaryQuestionnaireData);
        } catch (e) {
          console.warn('Failed to parse temporary questionnaire data, removing:', e);
          sessionStorage.removeItem(tempQuestionnaireKey);
        }
      }

      // Make API calls - if we have temporary questionnaire data, only get destination details
      let destinationResult, questionnaireResult;

      if (useTemporaryQuestionnaire) {
        // Only fetch destination details, use temporary questionnaire data
        const destinationPromise = useItineraryContext && itineraryId && dayNumber
          ? authAPI.getItineraryDestinationDetails(itineraryId, dayNumber, destinationId)
          : authAPI.getDestinationDetails(destinationId);

        const results = await Promise.allSettled([destinationPromise]);
        destinationResult = results[0];
        questionnaireResult = { status: 'fulfilled' as const, value: temporaryQuestionnaireData };
      } else {
        // Fetch both destination and questionnaire data from API
        const destinationPromise = useItineraryContext && itineraryId && dayNumber
          ? authAPI.getItineraryDestinationDetails(itineraryId, dayNumber, destinationId)
          : authAPI.getDestinationDetails(destinationId);

        const results = await Promise.allSettled([
          destinationPromise,
          authAPI.getQuestionnaire().catch((err) => {
            console.warn("Questionnaire data failed, using fallback:", err);
            // Return fallback questionnaire data
            return {
              starting_location_latitudes: 6.9271, // Colombo fallback
              starting_location_longitudes: 79.8612,
              nature: true,
              adventure: true,
              luxury: false,
              culture: true,
              relaxation: false,
              wellness: false,
              local_life: true,
              wild_life: false,
              food: true,
              spirituality: false,
              eco_tourism: true,
              travel_month: "December",
              no_of_people: 2,
              start_location: "Colombo"
            };
          })
        ]);
        destinationResult = results[0];
        questionnaireResult = results[1];
      }

      setProgress(70);

      // Handle destination data
      if (destinationResult.status === 'fulfilled') {
        setDestinationData(destinationResult.value);

        // Check if this is fallback data
        if (destinationResult.value.description?.includes(
          "temporarily limited due to service maintenance"
        )) {
          setIsFallbackData(true);
        }
      } else {
        throw destinationResult.reason;
      }

      // Handle questionnaire data
      if (questionnaireResult.status === 'fulfilled') {
        setQuestionnaireData(questionnaireResult.value);
      } else {
        // Already handled with fallback in the catch above
        console.warn("Using fallback questionnaire data");
      }

      setProgress(90);

      // Small delay to ensure smooth loading experience
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);

    } catch (err) {
      console.error("DestinationProvider error:", err);

      // Handle authentication errors
      if (
        err instanceof Error &&
        (err.message.includes("Authentication failed") ||
          err.message.includes("Authentication required") ||
          err.message.includes("Please log in again") ||
          err.message.includes("Invalid authentication token"))
      ) {
        console.log("🔐 Authentication error detected - clearing token and ensuring logout");

        // Clear any existing token immediately
        authAPI.removeToken();

        // Trigger logout which will redirect to login page
        logout();

        // Set a clear error message
        setError("Your session has expired. Please log in again to access destination details.");

        // Force redirect to login after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            console.log("🔄 Forcing redirect to login page");
            window.location.href = '/login';
          }
        }, 1000);

      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch destination data");
      }
    } finally {
      setLoading(false);
      // Always finish loading, even on error
      finishLoading('destination-data');
    }
  }, [destinationId, isAuthenticated, retryCount, logout, useItineraryContext, itineraryId, dayNumber]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  // Effect to clear stale cache when destination changes
  useEffect(() => {
    // Only perform cleanup if we're not currently loading to prevent conflicts
    if (loading) {
      console.log('⏸️ Skipping cache cleanup during loading to prevent conflicts');
      return;
    }

    let currentContextPrefix: string;
    if (contextType) {
      currentContextPrefix = contextType === 'itinerary' ? `itinerary_${itineraryId}_${dayNumber}` : contextType;
    } else {
      currentContextPrefix = useItineraryContext ? `itinerary_${itineraryId}_${dayNumber}` : 'search';
    }

    // Clear any cache that doesn't match the current destination and context
    const allKeys = Object.keys(sessionStorage);
    allKeys.forEach(key => {
      if (
        (key.startsWith('tempQuestionnaireData_') ||
         key.startsWith('tempQuestionnaireDestinationData_') ||
         key.startsWith('tempDestinationData_') ||
         key.startsWith('tempQuestionnaireParams_')) &&
        !key.includes(`_${currentContextPrefix}_${destinationId}`)
      ) {
        console.log(`🧹 Navigation cleanup - removing cache key: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
  }, [destinationId, useItineraryContext, itineraryId, dayNumber, contextType, loading]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Cleanup effect to ensure loading is finished on unmount
  useEffect(() => {
    return () => {
      // Force finish loading when component unmounts to prevent stuck states
      console.log('🧹 DestinationProvider unmounting - ensuring loading is finished');
      finishLoading('destination-data');
    };
  }, [finishLoading]);

  const contextValue: DestinationContextData = {
    destinationData,
    questionnaireData,
    loading,
    error,
    isFallbackData,
    retry,
  };

  return (
    <DestinationContext.Provider value={contextValue}>
      {children}
    </DestinationContext.Provider>
  );
};
