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

interface DestinationProviderProps {
  children: React.ReactNode;
  destinationId: string | undefined;
}

export const DestinationProvider: React.FC<DestinationProviderProps> = ({ 
  children, 
  destinationId 
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

      // Make both API calls in parallel for better performance
      const [destinationResult, questionnaireResult] = await Promise.allSettled([
        authAPI.getDestinationDetails(parseInt(destinationId)),
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
  }, [destinationId, isAuthenticated, retryCount, logout]);

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
