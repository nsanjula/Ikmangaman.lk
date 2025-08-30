import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useApiWithLoading } from "../contexts/LoadingContext";
import { authAPI, API_BASE_URL } from "../lib/api";
import DayInterestsQuestionnaire from "../components/DayInterestsQuestionnaire";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ensureRatesLoaded } from "../utils/currency";
import useCurrency from "../hooks/useCurrency";

// Hardcoded destination coordinates for recognizing start locations
const DESTINATION_COORDINATES = {
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
  "Habarana": { lat: 8.0362, lng: 80.745 },
  "Hatton": { lat: 6.8916, lng: 80.595 },
  "Belihuloya": { lat: 6.7135, lng: 80.7048 },
  "Ohiya": { lat: 6.8177, lng: 80.8929 },
  "Wellawaya": { lat: 6.7379, lng: 81.1043 },
  "Hiriketiya": { lat: 5.9575, lng: 80.6965 },
  "Matara": { lat: 5.9549, lng: 80.554 },
  "Hikkaduwa": { lat: 6.1405, lng: 80.1016 },
  "Ambalangoda": { lat: 6.2354, lng: 80.0532 },
  "Seethawaka": { lat: 6.956, lng: 80.245 },
  "Knuckles range": { lat: 7.4558, lng: 80.7847 },
  "Koggala": { lat: 5.9932, lng: 80.3335 }
};

// Types for the itinerary system
interface ItineraryState {
  itinerary_id: number | null;
  travel_month: string;
  no_of_people: number;
  start_location: string;
  days: {
    [key: number]: {
      destination_id: number | null;
      destination_name: string | null;
      destination_image: string | null;
      estimated_budget: number | null;
    };
  };
}

interface Destination {
  destination_id: number;
  name: string;
  match_score: number;
  rating_label: string;
  estimated_budget: number;
  filters: string[];
  distance: string;
  travel_time: string;
  thumbnail_img: string;
}

interface QuestionnaireSaveData {
  travel_month: string;
  no_of_people: number;
  start_location: string;
}

interface InterestData {
  nature: boolean;
  adventure: boolean;
  luxury: boolean;
  culture: boolean;
  relaxation: boolean;
  wellness: boolean;
  local_life: boolean;
  wild_life: boolean;
  food: boolean;
  spirituality: boolean;
  eco_tourism: boolean;
}

const CreateItinerary: React.FC = () => {
  const { format: formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const { isAuthenticated, handleAuthError, loading: authLoading } = useAuth();
  const { callWithLoading } = useApiWithLoading();

  // State management
  const [itinerary, setItinerary] = useState<ItineraryState>(() => {
    // Try to restore from localStorage on initial load
    try {
      const savedItinerary = localStorage.getItem('create_itinerary_state');
      if (savedItinerary) {
        const parsed = JSON.parse(savedItinerary);
        console.log('CreateItinerary: Restored from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('CreateItinerary: Error restoring from localStorage:', error);
      localStorage.removeItem('create_itinerary_state');
    }

    return {
      itinerary_id: null,
      travel_month: "",
      no_of_people: 1,
      start_location: "",
      days: {
        1: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null },
        2: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null },
        3: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null },
        4: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null }
      }
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionnaireSaved, setQuestionnaireSaved] = useState(() => {
    // Restore questionnaire saved state from localStorage
    try {
      const saved = localStorage.getItem('create_itinerary_questionnaire_saved');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [currentDayRecommendations, setCurrentDayRecommendations] = useState<Destination[]>([]);
  const [showingRecommendationsForDay, setShowingRecommendationsForDay] = useState<number | null>(null);
  const [showingInterestsForDay, setShowingInterestsForDay] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [hasNavigatedToQuestionnaire, setHasNavigatedToQuestionnaire] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    "hill_country",
    "coastal",
    "dry_zone",
    "urban",
  ]);

  // Load currency rates once
  useEffect(() => { try { ensureRatesLoaded(); } catch { } }, []);

  // Persist itinerary state to localStorage whenever it changes
  useEffect(() => {
    if (itinerary.itinerary_id) {
      localStorage.setItem('create_itinerary_state', JSON.stringify(itinerary));
      localStorage.setItem('create_itinerary_questionnaire_saved', JSON.stringify(questionnaireSaved));
      console.log('CreateItinerary: Saved state to localStorage');
    }
  }, [itinerary, questionnaireSaved]);

  // Check if user is authenticated - wait for auth loading to complete
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, authLoading]);

  // Cleanup effect to handle page unload or navigation away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't clear flag on page refresh - only on actual navigation away
      // This is handled by the handleNavigation function in Header
    };

    const handlePopState = () => {
      // Clear flag when user uses browser back/forward buttons to leave the page
      if (window.location.pathname !== '/create-itinerary') {
        sessionStorage.removeItem('has_visited_create_itinerary');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handler for initial questionnaire (steps 2 & 3)
  const handleInitialQuestionnaire = () => {
    // Navigate to questionnaire metrics page for initial setup
    navigate("/questionnaire-metrics?mode=create-itinerary");
  };

  // Check if user should be redirected to initial questionnaire or restore state
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('CreateItinerary: State check - questionnaireSaved:', questionnaireSaved, 'itinerary_id:', itinerary.itinerary_id);

    // Debug storage
    console.log('CreateItinerary: Storage debug:');
    console.log('- localStorage create_itinerary_state:', localStorage.getItem('create_itinerary_state'));
    console.log('- localStorage create_itinerary_questionnaire_saved:', localStorage.getItem('create_itinerary_questionnaire_saved'));
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('itinerary') || key.includes('temp') || key.includes('questionnaire') || key.includes('navigate')) {
        console.log(`- sessionStorage ${key}:`, sessionStorage.getItem(key));
      }
    });

    // If we already have a restored itinerary from localStorage (during component init),
    // make sure questionnaireSaved is set correctly
    if (itinerary.itinerary_id && !questionnaireSaved) {
      console.log('CreateItinerary: Found existing itinerary from localStorage, setting questionnaireSaved to true');
      setQuestionnaireSaved(true);
      return;
    }

    // Priority 1: Check for temp create itinerary data first (from destination detail navigation back)
    const tempCreateItineraryData = sessionStorage.getItem('tempCreateItineraryData');
    if (tempCreateItineraryData) {
      try {
        const data = JSON.parse(tempCreateItineraryData);
        if (data.currentItineraryState?.itinerary_id) {
          console.log('CreateItinerary: Restoring from temp create itinerary data...', data.currentItineraryState);
          setItinerary(data.currentItineraryState);
          setQuestionnaireSaved(true);

          // Restore recommendations if available
          if (data.currentDayRecommendations && data.showingRecommendationsForDay) {
            setCurrentDayRecommendations(data.currentDayRecommendations);
            setShowingRecommendationsForDay(data.showingRecommendationsForDay);
          }

          // Restore sort preference
          if (data.sortBy) {
            setSortBy(data.sortBy);
          }

          // Clean up temp data
          sessionStorage.removeItem('tempCreateItineraryData');
          sessionStorage.removeItem('tempCreateItineraryDataTimestamp');
          return;
        }
      } catch (error) {
        console.error('CreateItinerary: Error restoring from temp create itinerary data:', error);
        sessionStorage.removeItem('tempCreateItineraryData');
        sessionStorage.removeItem('tempCreateItineraryDataTimestamp');
      }
    }

    // Priority 2: Check for saved questionnaire data from questionnaire completion
    const savedData = sessionStorage.getItem('itinerary_questionnaire_data');
    if (savedData && !questionnaireSaved) {
      try {
        const data = JSON.parse(savedData);
        console.log('CreateItinerary: Found saved questionnaire data, creating itinerary...', data);

        setItinerary(prev => ({
          ...prev,
          travel_month: data.travel_month,
          no_of_people: data.no_of_people,
          start_location: data.start_location
        }));

        createItinerary(data);
        setQuestionnaireSaved(true);
        sessionStorage.removeItem('itinerary_questionnaire_data');
        return;
      } catch (error) {
        console.error('CreateItinerary: Error parsing saved questionnaire data:', error);
        sessionStorage.removeItem('itinerary_questionnaire_data');
      }
    }

    // Priority 3: Check for legacy temp data (backward compatibility)
    const tempData = sessionStorage.getItem('tempDestinationData');
    if (tempData && !questionnaireSaved && !itinerary.itinerary_id) {
      try {
        const data = JSON.parse(tempData);
        if (data.currentItineraryState?.itinerary_id) {
          console.log('CreateItinerary: Restoring from legacy temp data...', data.currentItineraryState);
          setItinerary(data.currentItineraryState);
          setQuestionnaireSaved(true);

          // Restore recommendations if available
          if (data.currentDayRecommendations && data.showingRecommendationsForDay) {
            setCurrentDayRecommendations(data.currentDayRecommendations);
            setShowingRecommendationsForDay(data.showingRecommendationsForDay);
          }

          // Restore sort preference
          if (data.sortBy) {
            setSortBy(data.sortBy);
          }

          // Clean up temp data
          sessionStorage.removeItem('tempDestinationData');
          sessionStorage.removeItem('tempDestinationDataTimestamp');
          return;
        }
      } catch (error) {
        console.error('CreateItinerary: Error restoring from legacy temp data:', error);
        sessionStorage.removeItem('tempDestinationData');
        sessionStorage.removeItem('tempDestinationDataTimestamp');
      }
    }

    // Priority 4: Check if we already have active itinerary state
    if (questionnaireSaved || itinerary.itinerary_id) {
      console.log('CreateItinerary: Already have questionnaire/itinerary, skipping initialization');
      return;
    }

    // Priority 5: Handle new navigation and first-time visits
    const fromRecommendations = sessionStorage.getItem('navigate_from_recommendations');
    const hasVisitedCreateItinerary = sessionStorage.getItem('has_visited_create_itinerary');

    if (fromRecommendations) {
      console.log('CreateItinerary: Coming from recommendations');
      // Clean up the flag
      sessionStorage.removeItem('navigate_from_recommendations');

      // Set flag to indicate user has visited this page
      sessionStorage.setItem('has_visited_create_itinerary', 'true');

      // Try to get existing questionnaire data from the API instead of forcing temp questionnaire
      authAPI.getQuestionnaire().then(existingData => {
        if (existingData && existingData.travel_month && existingData.start_location) {
          // Create itinerary data from existing questionnaire
          const questionnaireData = {
            travel_month: existingData.travel_month,
            no_of_people: existingData.no_of_people,
            start_location: existingData.start_location
          };

          console.log('CreateItinerary: Using existing questionnaire data for itinerary creation:', questionnaireData);

          // Trigger the itinerary creation directly
          setItinerary(prev => ({
            ...prev,
            travel_month: questionnaireData.travel_month,
            no_of_people: questionnaireData.no_of_people,
            start_location: questionnaireData.start_location
          }));

          createItinerary(questionnaireData);
          setQuestionnaireSaved(true);
        } else if (!hasNavigatedToQuestionnaire) {
          // Only redirect to questionnaire if we don't have existing data
          console.log('CreateItinerary: No existing questionnaire data, redirecting to questionnaire');
          setHasNavigatedToQuestionnaire(true);
          handleInitialQuestionnaire();
        }
      }).catch(error => {
        console.log('CreateItinerary: No existing questionnaire data found, will need to redirect to questionnaire');
        if (!hasNavigatedToQuestionnaire) {
          setHasNavigatedToQuestionnaire(true);
          handleInitialQuestionnaire();
        }
      });
    } else if (hasVisitedCreateItinerary) {
      // User has visited before but no active state - try to restore from existing questionnaire
      console.log('CreateItinerary: Has visited before, trying to restore from existing questionnaire');
      authAPI.getQuestionnaire().then(existingData => {
        if (existingData && existingData.travel_month && existingData.start_location) {
          // Create itinerary data from existing questionnaire
          const questionnaireData = {
            travel_month: existingData.travel_month,
            no_of_people: existingData.no_of_people,
            start_location: existingData.start_location
          };

          console.log('CreateItinerary: Restoring from existing questionnaire after refresh:', questionnaireData);

          // Trigger the itinerary creation directly
          setItinerary(prev => ({
            ...prev,
            travel_month: questionnaireData.travel_month,
            no_of_people: questionnaireData.no_of_people,
            start_location: questionnaireData.start_location
          }));

          createItinerary(questionnaireData);
          setQuestionnaireSaved(true);
        }
      }).catch(error => {
        console.log('CreateItinerary: No existing questionnaire data found on refresh');
      });
    } else if (!hasNavigatedToQuestionnaire) {
      // True first visit - redirect to questionnaire
      console.log('CreateItinerary: First visit, redirecting to questionnaire');
      setHasNavigatedToQuestionnaire(true);
      handleInitialQuestionnaire();
    }
  }, [isAuthenticated, questionnaireSaved, itinerary.itinerary_id, hasNavigatedToQuestionnaire]);

  // Handler for day-specific questionnaire (step 1 - interests)
  const handleDayQuestionnaire = (dayNumber: number) => {
    if (!itinerary.itinerary_id) {
      setError("Please complete the initial questionnaire first");
      return;
    }

    setShowingInterestsForDay(dayNumber);
    setCurrentDayRecommendations([]);
    setShowingRecommendationsForDay(null);
  };

  // Handler for interests questionnaire completion
  const handleInterestsComplete = (recommendations: Destination[]) => {
    setCurrentDayRecommendations(recommendations);
    setShowingRecommendationsForDay(showingInterestsForDay);
    setShowingInterestsForDay(null);
  };

  // Handler for interests questionnaire cancellation
  const handleInterestsCancel = () => {
    setShowingInterestsForDay(null);
  };

  // Load itinerary data from questionnaire completion
  useEffect(() => {
    const checkQuestionnaireCompletion = () => {
      const savedData = sessionStorage.getItem('itinerary_questionnaire_data');
      if (savedData && !questionnaireSaved) {
        try {
          const data: QuestionnaireSaveData = JSON.parse(savedData);
          setItinerary(prev => ({
            ...prev,
            travel_month: data.travel_month,
            no_of_people: data.no_of_people,
            start_location: data.start_location
          }));

          // Create itinerary in backend
          createItinerary(data);
          setQuestionnaireSaved(true);
          sessionStorage.removeItem('itinerary_questionnaire_data');
        } catch (error) {
          console.error('Error parsing questionnaire data:', error);
        }
      }
    };

    checkQuestionnaireCompletion();
  }, [questionnaireSaved, isAuthenticated]); // Add isAuthenticated to trigger when auth state changes

  // Create itinerary in backend
  const createItinerary = async (data: QuestionnaireSaveData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await callWithLoading(
        async () => {
          return await authAPI.createItinerary({
            travel_month: data.travel_month,
            no_of_people: data.no_of_people,
            start_location: data.start_location
          });
        },
        'create-itinerary',
        'Creating your itinerary...'
      );

      setItinerary(prev => ({
        ...prev,
        itinerary_id: response.itinerary_id
      }));

    } catch (error) {
      console.error('Error creating itinerary:', error);
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("Authentication")) {
          handleAuthError(error);
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to create itinerary. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Select destination for a day
  const selectDestination = async (destination: Destination) => {
    if (!itinerary.itinerary_id || !showingRecommendationsForDay) return;

    try {
      setIsLoading(true);

      await callWithLoading(
        async () => {
          return await authAPI.assignDestinationToDay(
            itinerary.itinerary_id!,
            showingRecommendationsForDay,
            {
              destination_id: destination.destination_id,
              estimated_budget: destination.estimated_budget
            }
          );
        },
        'assign-destination',
        'Adding destination to your itinerary...'
      );

      // Update local state
      setItinerary(prev => ({
        ...prev,
        days: {
          ...prev.days,
          [showingRecommendationsForDay]: {
            destination_id: destination.destination_id,
            destination_name: destination.name,
            destination_image: destination.thumbnail_img,
            estimated_budget: destination.estimated_budget
          }
        }
      }));

      // Clear recommendations view
      setCurrentDayRecommendations([]);
      setShowingRecommendationsForDay(null);

    } catch (error) {
      console.error('Error assigning destination:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export as text (fallback option)
  const exportAsText = () => {
    if (!itinerary.itinerary_id) {
      setError("No itinerary to export");
      return;
    }

    const selectedDays = Object.entries(itinerary.days)
      .filter(([_, day]) => day.destination_id)
      .map(([dayNum, day]) =>
        `Day ${dayNum}: ${day.destination_name} (Budget: ${day.estimated_budget != null ? formatCurrency(day.estimated_budget) : 'N/A'})`
      )
      .join('\n');

    const totalBudget = Object.values(itinerary.days)
      .reduce((sum, day) => sum + (day.estimated_budget || 0), 0);

    const textContent = `
MY TRAVEL ITINERARY
===================

Travel Details:
- Month: ${itinerary.travel_month}
- People: ${itinerary.no_of_people}
- Starting Location: ${itinerary.start_location}
- Total Estimated Budget: ${formatCurrency(totalBudget)}

Itinerary:
${selectedDays}

---
Generated by Ikmangaman.lk - AI-powered travel planning
    `.trim();

    // Create and download text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerary_${itinerary.itinerary_id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate PDF
  const generatePlan = async () => {
    if (!itinerary.itinerary_id) {
      setError("No itinerary to export");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First test backend connectivity
      console.log('Testing backend connectivity...');
      const connectivityTest = await fetch(`${API_BASE_URL}/docs`, {
        method: 'HEAD',
        mode: 'no-cors' // Use no-cors to avoid CORS issues in test
      }).catch(() => null);

      console.log('Connectivity test result:', connectivityTest ? 'Success' : 'Failed');

      const response = await callWithLoading(
        async () => {
          return await authAPI.exportItineraryPDF(itinerary.itinerary_id!);
        },
        'generate-pdf',
        'Generating your travel plan PDF...'
      );

      // Create download link
      const url = URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `itinerary_${itinerary.itinerary_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PDF:', error);

      // Automatically fallback to text export if PDF fails due to network issues
      if (error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("CORS"))) {

        console.log('PDF generation failed due to network issues, falling back to text export...');

        try {
          // Fallback to text export
          exportAsText();
          setError("PDF generation is currently unavailable in this environment. Your itinerary has been downloaded as a text file instead.");
        } catch (textError) {
          setError("Both PDF and text export failed. Please try again later or contact support.");
        }
      } else if (error instanceof Error) {
        // Provide more specific error messages with potential solutions
        if (error.message.includes("PDF generation service is currently unavailable") ||
          error.message.includes("PDFSHIFT") ||
          error.message.includes("502") ||
          error.message.includes("not available on this server")) {
          setError(
            `${error.message}\n\nAlternative: You can use the "Export Text" button to download your itinerary details.`
          );
        } else {
          setError(`${error.message}\n\nAlternative: Try using the "Export Text" button for a downloadable version of your itinerary.`);
        }
      } else {
        setError('Failed to generate PDF. Please try using the "Export Text" button as an alternative.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new itinerary - clear all data and redirect to questionnaire
  const startNewItinerary = () => {
    try {
      // Clear all session storage data related to itineraries
      sessionStorage.removeItem('itinerary_questionnaire_data');
      sessionStorage.removeItem('tempCreateItineraryData');
      sessionStorage.removeItem('tempCreateItineraryDataTimestamp');
      sessionStorage.removeItem('tempDestinationData');
      sessionStorage.removeItem('tempDestinationDataTimestamp');
      sessionStorage.removeItem('has_visited_create_itinerary');
      sessionStorage.removeItem('navigate_from_recommendations');
      sessionStorage.removeItem('tempQuestionnaireData');
      sessionStorage.removeItem('tempQuestionnaireParams');
      sessionStorage.removeItem('tempQuestionnaireCompleted');
      sessionStorage.removeItem('tempQuestionnaireDestinationData');

      // Clear localStorage data
      localStorage.removeItem('create_itinerary_state');
      localStorage.removeItem('create_itinerary_questionnaire_saved');

      console.log('StartNewItinerary: Cleared all itinerary session and local storage data');

      // Reset component state to initial values
      setItinerary({
        itinerary_id: null,
        travel_month: "",
        no_of_people: 1,
        start_location: "",
        days: {
          1: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null },
          2: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null },
          3: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null },
          4: { destination_id: null, destination_name: null, destination_image: null, estimated_budget: null }
        }
      });

      setQuestionnaireSaved(false);
      setCurrentDayRecommendations([]);
      setShowingRecommendationsForDay(null);
      setShowingInterestsForDay(null);
      setSortBy("distance");
      setError(null);

      // Navigate to questionnaire to start fresh
      navigate("/questionnaire-metrics?mode=create-itinerary");

    } catch (error) {
      console.error('Error starting new itinerary:', error);
      setError('Failed to start new itinerary. Please try again.');
    }
  };

  // Get the next available day
  const getNextAvailableDay = () => {
    for (let day = 1; day <= 4; day++) {
      if (!itinerary.days[day].destination_id) {
        return day;
      }
    }
    return null;
  };

  // Filter and sort recommendations
  const filteredAndSortedRecommendations = currentDayRecommendations
    .filter((dest) => {
      if (dest.filters && dest.filters.length > 0) {
        return dest.filters.some(filter => selectedAreas.includes(filter));
      }
      return true;
    })
    .slice().sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return parseFloat(a.distance.split(' ')[0]) - parseFloat(b.distance.split(' ')[0]);
        case "budget":
          return a.estimated_budget - b.estimated_budget;
        case "match_score":
          return b.match_score - a.match_score;
        default:
          return 0;
      }
    });

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

  // Count selected destinations
  const selectedDestinationsCount = Object.values(itinerary.days).filter(day => day.destination_id).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />

      {/* Main Content */}
      <main className="container iframe-container py-12">
        {/* Title */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-900)' }}>Create Your Travel Plan</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={startNewItinerary}
                disabled={isLoading}
                className="btn btn-secondary btn-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                New Itinerary
              </button>
              <button
                onClick={generatePlan}
                disabled={selectedDestinationsCount === 0 || isLoading}
                className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                Generate Plan
              </button>
              <button
                onClick={exportAsText}
                disabled={selectedDestinationsCount === 0 || isLoading}
                className="btn btn-tertiary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as text file (backup option)"
              >
                Export Text
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 card p-4 border-l-4" style={{
            background: 'var(--surface)',
            borderLeftColor: '#F87171',
            borderColor: '#FECACA'
          }}>
            <p style={{ color: '#DC2626' }}>{error}</p>
          </div>
        )}

        {/* Day Interests Questionnaire Modal */}
        {showingInterestsForDay && itinerary.itinerary_id && (
          <div className="mb-12">
            <DayInterestsQuestionnaire
              dayNumber={showingInterestsForDay}
              itineraryId={itinerary.itinerary_id}
              onComplete={handleInterestsComplete}
              onCancel={handleInterestsCancel}
            />
          </div>
        )}

        {/* Travel Plan Containers */}
        {!showingInterestsForDay && (
          <div className="mb-12">
            <div className="flex gap-6 flex-wrap justify-center">
              {/* Day containers */}
              {[1, 2, 3, 4].map((dayNum) => {
                const dayData = itinerary.days[dayNum];
                const isSelected = dayData.destination_id !== null;
                const nextDay = getNextAvailableDay();
                const isClickable = questionnaireSaved && (dayNum === nextDay || isSelected);
                const shouldShow = questionnaireSaved && (dayNum === 1 || itinerary.days[dayNum - 1]?.destination_id !== null);

                // Don't render containers that shouldn't be shown yet
                if (!shouldShow) {
                  return null;
                }

                return (
                  <div
                    key={dayNum}
                    className={`relative w-64 h-64 rounded-xl border-2 shadow-lg transition-all duration-300 ${isSelected
                      ? 'border-gray-300 bg-cover bg-center'
                      : 'border-gray-300 bg-gray-100 hover:border-cyan-400 hover:shadow-xl'
                      } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    style={isSelected && dayData.destination_image ? {
                      backgroundImage: `url(https://ikmangamanlk-production.up.railway.app${dayData.destination_image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : {}}
                    onClick={() => {
                      if (!isClickable || isLoading) return;

                      if (!isSelected && dayNum === nextDay) {
                        handleDayQuestionnaire(dayNum);
                      }
                    }}
                  >
                    {/* Day overlay for selected destinations */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex flex-col justify-end p-6">
                        <div className="text-white">
                          <div className="text-xl font-medium mb-1">Day {dayNum}</div>
                          <div className="text-2xl font-bold">{dayData.destination_name}</div>
                        </div>
                      </div>
                    )}

                    {/* Empty state for day containers */}
                    {!isSelected && (
                      <div className="absolute inset-0 flex rounded-xl dark:bg-gray-800 flex-col items-center justify-center text-center p-6">
                        <Plus
                          size={46}
                          className={`${isClickable ? 'text-gray-400' : 'text-gray-300'} transition-colors duration-200 mb-4`}
                        />
                        <div className="text-2xl font-bold text-gray-600 mb-2">Day {dayNum}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">Click to Select Interests</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {!showingInterestsForDay && showingRecommendationsForDay && currentDayRecommendations.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4 relative">
              <div
                className="card p-6"
                style={{
                  background: 'var(--surface)',
                  zIndex: 30,
                  position: 'sticky',
                  top: '20px',
                  width: '100%',
                  maxHeight: 'calc(100vh - 40px)',
                  overflowY: 'auto',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.2s ease, opacity 0.2s ease'
                }}
              >
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

                    <div>
                      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-900)' }}>
                        Sort by
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 text-sm text-left bg-white border border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                        style={{
                          color: 'var(--text-900)',
                          backgroundColor: 'var(--surface)',
                          borderColor: '#E2E8F0',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <option value="distance">Distance</option>
                        <option value="budget">Budget</option>
                        <option value="match_score">Match Score</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAreas(areas.map((a) => a.id));
                        setSortBy("distance");
                      }}
                      className="w-full btn btn-secondary btn-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations Content */}
            <div className="lg:w-3/4">
              <div className="card p-8" style={{ background: 'var(--surface)' }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--text-900)' }}>
                    Day {showingRecommendationsForDay.toString().padStart(2, '0')}
                  </h2>
                  <div className="text-sm" style={{ color: 'var(--text-600)' }}>
                    Found {filteredAndSortedRecommendations.length} recommendations
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedRecommendations.map((destination) => (
                    <div
                      key={destination.destination_id}
                      className="group card p-0 flex flex-col overflow-hidden cursor-pointer hover:scale-102 transition-all duration-300 hover:shadow-lg"
                      style={{ background: 'var(--surface)' }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        {destination.thumbnail_img ? (
                          <img
                            src={`https://ikmangamanlk-production.up.railway.app${destination.thumbnail_img}`}
                            alt={destination.name}
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
                          className={`fallback-content absolute inset-0 flex flex-col items-center justify-center text-center p-2 ${destination.thumbnail_img ? "hidden" : ""}`}
                          style={{ background: 'var(--surface-alt)', color: 'var(--text-600)' }}
                        >
                          <div className="text-4xl mb-2">🏞️</div>
                          <div className="text-sm font-medium">
                            {destination.name}
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-1 rounded text-white text-sm font-semibold" style={{ background: 'var(--primary-700)' }}>
                          {formatCurrency(destination.estimated_budget)}
                        </div>
                      </div>

                      <div className="flex-grow p-4">
                        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-900)' }}>
                          {destination.name}
                        </h3>

                        <p className="text-sm mb-3" style={{ color: 'var(--text-600)' }}>
                          {destination.rating_label} match ({destination.distance}, {destination.travel_time})
                        </p>

                        {/* Show filter tags */}
                        {destination.filters && destination.filters.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {destination.filters.map((filter) => (
                              <span
                                key={filter}
                                className="px-2 py-1 text-xs rounded-full text-white"
                                style={{ background: 'var(--primary-600)' }}
                              >
                                {areas.find(a => a.id === filter)?.name || filter}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-600)' }}>
                              Match Score
                            </span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-900)' }}>
                              {Math.round(Math.min(destination.match_score * 100, 100))}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${destination.match_score >= 0.85 ? 'progress-green' :
                                destination.match_score >= 0.70 ? 'progress-sky' :
                                  'progress-amber'
                                }`}
                              style={{
                                width: `${Math.min(destination.match_score * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => selectDestination(destination)}
                            disabled={isLoading}
                            className="btn btn-primary btn-md w-full"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => {
                              // Determine start location based on the day
                              let tempStartLocation = itinerary.start_location;

                              // For days other than 1, use the previous day's destination name as start location
                              if (showingRecommendationsForDay > 1) {
                                const previousDay = showingRecommendationsForDay - 1;
                                const previousDestinationName = itinerary.days[previousDay]?.destination_name;
                                if (previousDestinationName) {
                                  tempStartLocation = previousDestinationName;
                                }
                              }

                              // Prepare temp questionnaire data for the destination details API
                              const tempQuestionnaireData = {
                                destination_id: destination.destination_id,
                                travel_month: itinerary.travel_month,
                                no_of_people: itinerary.no_of_people,
                                start_location: tempStartLocation
                              };

                              // Store temp questionnaire data for the destination context with itinerary-specific key
                              const tempDestinationKey = `tempDestinationData_itinerary_${itinerary.itinerary_id}_${showingRecommendationsForDay}_${destination.destination_id}`;
                              sessionStorage.setItem(tempDestinationKey, JSON.stringify(tempQuestionnaireData));

                              // Store state for navigation back
                              const backData = {
                                currentItineraryState: itinerary,
                                currentDayRecommendations: currentDayRecommendations,
                                showingRecommendationsForDay: showingRecommendationsForDay,
                                questionnaireSaved: questionnaireSaved,
                                sortBy: sortBy
                              };
                              sessionStorage.setItem('tempCreateItineraryData', JSON.stringify(backData));
                              sessionStorage.setItem('tempCreateItineraryDataTimestamp', Date.now().toString());

                              navigate(`/itinerary/${itinerary.itinerary_id}/day/${showingRecommendationsForDay}/destination/${destination.destination_id}`);
                            }}
                            className="btn btn-secondary btn-md w-full"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cancel Selection */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setCurrentDayRecommendations([]);
                      setShowingRecommendationsForDay(null);
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial state message */}
        {!showingInterestsForDay && !questionnaireSaved && (
          <div className="card p-8 text-center bg-[var(--primary-100)] border-[var(--primary-600)] dark:bg-gray-800">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-2">
              Ready to Plan Your Adventure?
            </h3>
            <p className="mb-6 mx-auto text-center ">
              Click on "New Itinerary" to start creating your personalized travel itinerary.
              We'll ask you a few questions to get started.
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateItinerary;
