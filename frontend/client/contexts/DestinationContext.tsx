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
    "Colombo": { lat: 6.9271, lng: 79.8612 },
    "Kandy": { lat: 7.2906, lng: 80.6337 },
    "Galle": { lat: 6.0535, lng: 80.2210 },
    "Jaffna": { lat: 9.6615, lng: 80.0255 },
    "Trincomalee": { lat: 8.5874, lng: 81.2152 },
    "Anuradhapura": { lat: 8.3114, lng: 80.4037 },
    "Pollonaruwa": { lat: 7.9403, lng: 81.0188 },
    "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
    "Ella": { lat: 6.8667, lng: 81.0667 },
    "Matara": { lat: 5.9485, lng: 80.5353 },
    "Negombo": { lat: 7.2084, lng: 79.8380 },
    "Batticaloa": { lat: 7.7102, lng: 81.6924 },
    "Badulla": { lat: 6.9934, lng: 81.0550 },
    "Kurunegala": { lat: 7.4818, lng: 80.3609 },
    "Ratnapura": { lat: 6.6828, lng: 80.4037 },
    "Hambantota": { lat: 6.1241, lng: 81.1185 },
    "Puttalam": { lat: 8.0362, lng: 79.8283 },
    "Vavniya": { lat: 8.7514, lng: 80.4971 },
    "Kalutara": { lat: 6.5854, lng: 79.9607 },
    "Ampara": { lat: 7.2981, lng: 81.6821 },
  };

  return locationCoords[locationName] || { lat: 6.9271, lng: 79.8612 }; // Fallback to Colombo
};

interface DestinationProviderProps {
  children: React.ReactNode;
  destinationId: number;
  itineraryId?: number;
  dayNumber?: number;
  useItineraryContext?: boolean;
}

export const DestinationProvider: React.FC<DestinationProviderProps> = ({
  children,
  destinationId,
  itineraryId,
  dayNumber,
  useItineraryContext = false
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
    if (!destinationId || !isAuthenticated) {
      setLoading(false);
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

      // Set progress for concurrent API calls
      setProgress(30);

      // Check for temporary questionnaire data first
      const tempQuestionnaireKey = 'tempQuestionnaireData';
      const tempData = sessionStorage.getItem(tempQuestionnaireKey);
      const tempCompletedKey = 'tempQuestionnaireDestinationData';
      const tempCompletedData = sessionStorage.getItem(tempCompletedKey);
      let useTemporaryQuestionnaire = false;
      let temporaryQuestionnaireData = null;

      // Check for completed temp questionnaire data first (from API call)
      if (tempCompletedData) {
        try {
          const parsedTempData = JSON.parse(tempCompletedData);
          // Use the destination data from temp questionnaire API call
          console.log('Using completed temp questionnaire destination data:', parsedTempData);

          // Also get the temp questionnaire parameters to create proper questionnaire data
          const tempQuestionnaireParams = sessionStorage.getItem('tempQuestionnaireParams');
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

          // Clear the temp data after using it
          sessionStorage.removeItem(tempCompletedKey);
          sessionStorage.removeItem('tempQuestionnaireParams');
          return;
        } catch (e) {
          console.warn('Failed to parse completed temp questionnaire data, removing:', e);
          sessionStorage.removeItem(tempCompletedKey);
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
          err.message.includes("Authentication required"))
      ) {
        console.log("🔐 Authentication error detected - ensuring logout");
        logout();
        setError("Your session has expired. Please log in again to view destination details.");
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

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
