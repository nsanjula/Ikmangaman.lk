import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAuth } from "../contexts/AuthContext";
import { useApiWithLoading } from "../contexts/LoadingContext";
import { authAPI } from "../lib/api";
import DayInterestsQuestionnaire from "../components/DayInterestsQuestionnaire";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

interface PendingBackendCall {
  type: 'assign_destination' | 'day_recommendations';
  itinerary_id: number;
  day_number: number;
  destination_id?: number;
  estimated_budget?: number;
  interests?: InterestData;
}

const CreateItinerary: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, handleAuthError } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  
  // State management
  const [itinerary, setItinerary] = useState<ItineraryState>({
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionnaireSaved, setQuestionnaireSaved] = useState(false);
  const [currentDayRecommendations, setCurrentDayRecommendations] = useState<Destination[]>([]);
  const [showingRecommendationsForDay, setShowingRecommendationsForDay] = useState<number | null>(null);
  const [showingInterestsForDay, setShowingInterestsForDay] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [hasNavigatedToQuestionnaire, setHasNavigatedToQuestionnaire] = useState(false);
  const [hasInitializedFromSessionData, setHasInitializedFromSessionData] = useState(false);
  
  // New state for optimized loading management
  const [pendingBackendCalls, setPendingBackendCalls] = useState<PendingBackendCall[]>([]);
  const [selectedDestinationForDay, setSelectedDestinationForDay] = useState<{[key: number]: Destination | null}>({});
  const [latestSelectedDay, setLatestSelectedDay] = useState<number | null>(null);
  const [lockedDays, setLockedDays] = useState<Set<number>>(new Set());
  const [completedQuestionnaireDays, setCompletedQuestionnaireDays] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(true);
  const [budgetFilter, setBudgetFilter] = useState(500000);
  const [scrollY, setScrollY] = useState(0);
  const [showCancelSelection, setShowCancelSelection] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Cleanup temp destination data when starting a new itinerary session
  useEffect(() => {
    // Only cleanup if we're starting fresh (no itinerary_id and no questionnaire saved)
    if (!questionnaireSaved && itinerary.itinerary_id === null) {
      // Clean up any old temp destination data from previous sessions
      sessionStorage.removeItem('tempDestinationData');
      sessionStorage.removeItem('tempDataUsedSuccessfully');
    }
  }, [questionnaireSaved, itinerary.itinerary_id]);

  // Handler for initial questionnaire (steps 2 & 3)
  const handleInitialQuestionnaire = () => {
    if (hasNavigatedToQuestionnaire) return; // Prevent multiple navigations

    setHasNavigatedToQuestionnaire(true);
    // Store flag to indicate this is the first questionnaire access
    sessionStorage.setItem('questionnaire_from_create_itinerary', 'true');
    // Use replace to prevent back button issues
    navigate("/questionnaire-metrics?mode=create-itinerary", {
      replace: true,
      state: { fromCreateItinerary: true, backToRecommendations: true }
    });
  };

  // Check if user should be redirected to initial questionnaire
  useEffect(() => {
    if (isAuthenticated && !questionnaireSaved && itinerary.itinerary_id === null && !hasInitializedFromSessionData) {
      // Check if we came from recommendations page (create itinerary button)
      const fromCreateItineraryBtn = sessionStorage.getItem('navigate_from_recommendations');
      const savedData = sessionStorage.getItem('itinerary_questionnaire_data');

      if (!savedData && fromCreateItineraryBtn === 'true') {
        // Clear the flag after using it
        sessionStorage.removeItem('navigate_from_recommendations');
        // Use immediate navigation without delay
        handleInitialQuestionnaire();
      } else {
        // If we have existing data or didn't come from recommendations, don't show questionnaire
        setHasInitializedFromSessionData(true);
      }
    }
  }, [isAuthenticated, questionnaireSaved, itinerary.itinerary_id, hasInitializedFromSessionData]);

  // Handle browser back button - simplified to prevent navigation loops
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clean up session storage when leaving the page
      if (!questionnaireSaved && itinerary.itinerary_id === null) {
        sessionStorage.removeItem('tempQuestionnaireData');
        sessionStorage.removeItem('itinerary_questionnaire_data');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [questionnaireSaved, itinerary.itinerary_id]);

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
    if (showingInterestsForDay) {
      // Mark this day as having completed the questionnaire
      setCompletedQuestionnaireDays(prev => new Set([...prev, showingInterestsForDay]));
    }
    setCurrentDayRecommendations(recommendations);
    setShowingRecommendationsForDay(showingInterestsForDay);
    setShowingInterestsForDay(null);
    // Show cancel selection button after returning from questionnaire
    setShowCancelSelection(true);
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
          setHasInitializedFromSessionData(true);
          sessionStorage.removeItem('itinerary_questionnaire_data');
        } catch (error) {
          console.error('Error parsing questionnaire data:', error);
        }
      } else {
        // Mark as initialized even if no data found
        setHasInitializedFromSessionData(true);
      }
    };

    checkQuestionnaireCompletion();
  }, [questionnaireSaved]);

  // Restore detailed itinerary state when returning from destination details
  useEffect(() => {
    const restoreItineraryState = () => {
      const tempData = sessionStorage.getItem('tempDestinationData');
      const cacheTimestamp = sessionStorage.getItem('tempDestinationDataTimestamp');

      if (tempData && questionnaireSaved) {
        try {
          const data = JSON.parse(tempData);
          const timestamp = cacheTimestamp ? parseInt(cacheTimestamp) : 0;
          const now = Date.now();
          const maxAge = 30 * 60 * 1000; // 30 minutes cache

          // Check if cache is still valid
          if (now - timestamp > maxAge) {
            console.log('Cache expired, not restoring state');
            sessionStorage.removeItem('tempDestinationData');
            sessionStorage.removeItem('tempDestinationDataTimestamp');
            return;
          }

          console.log('Restoring itinerary state from cache...');

          // Restore the full itinerary state
          if (data.currentItineraryState && data.currentItineraryState.itinerary_id) {
            setItinerary(data.currentItineraryState);
            console.log('Restored itinerary state');
          }

          // Restore recommendations and UI state
          if (data.currentDayRecommendations && data.currentDayRecommendations.length > 0) {
            setCurrentDayRecommendations(data.currentDayRecommendations);
            if (data.showingRecommendationsForDay) {
              setShowingRecommendationsForDay(data.showingRecommendationsForDay);
            }
            console.log('Restored recommendations state');
          }

          // Restore selection state
          if (data.selectedDestinationForDay && Object.keys(data.selectedDestinationForDay).length > 0) {
            setSelectedDestinationForDay(data.selectedDestinationForDay);

            // Find the latest selected day
            const selectedDays = Object.keys(data.selectedDestinationForDay).map(Number);
            if (selectedDays.length > 0) {
              setLatestSelectedDay(Math.max(...selectedDays));
            }
            console.log('Restored selection state');
          }

          // Restore questionnaire completion state
          if (data.completedQuestionnaireDays && Array.isArray(data.completedQuestionnaireDays)) {
            setCompletedQuestionnaireDays(new Set(data.completedQuestionnaireDays));
            console.log('Restored questionnaire completion state');
          }

          // Restore filter state
          if (data.sortBy) {
            setSortBy(data.sortBy);
          }
          if (data.budgetFilter) {
            setBudgetFilter(data.budgetFilter);
          }

          // Clean up the temp data after using it
          sessionStorage.removeItem('tempDestinationData');
          sessionStorage.removeItem('tempDestinationDataTimestamp');
          console.log('State restoration completed and cache cleared');

        } catch (error) {
          console.error('Error restoring itinerary state:', error);
          sessionStorage.removeItem('tempDestinationData');
          sessionStorage.removeItem('tempDestinationDataTimestamp');
        }
      }
    };

    // Only restore state if questionnaire is saved (itinerary is active)
    if (questionnaireSaved && hasInitializedFromSessionData) {
      // Delay restoration to ensure all other state is properly initialized
      setTimeout(restoreItineraryState, 100);
    }

    // Also try to restore on mount if we have temp data
    if (!questionnaireSaved && !hasInitializedFromSessionData) {
      const tempData = sessionStorage.getItem('tempDestinationData');
      if (tempData) {
        // Try immediate restoration for mount-time scenarios
        setTimeout(restoreItineraryState, 500);
      }
    }
  }, [questionnaireSaved, hasInitializedFromSessionData]);

  // Handle immediate state restoration on component mount
  useEffect(() => {
    const immediateRestore = () => {
      const tempData = sessionStorage.getItem('tempDestinationData');
      if (tempData && isAuthenticated) {
        console.log('Attempting immediate state restoration on mount...');

        try {
          const data = JSON.parse(tempData);

          // If we have itinerary data, restore it immediately
          if (data.currentItineraryState && data.currentItineraryState.itinerary_id) {
            console.log('Restoring itinerary state on mount');
            setItinerary(data.currentItineraryState);
            setQuestionnaireSaved(true);
            setHasInitializedFromSessionData(true);

            // Restore other states too
            if (data.selectedDestinationForDay) {
              setSelectedDestinationForDay(data.selectedDestinationForDay);
              const selectedDays = Object.keys(data.selectedDestinationForDay).map(Number);
              if (selectedDays.length > 0) {
                setLatestSelectedDay(Math.max(...selectedDays));
              }
            }

            if (data.completedQuestionnaireDays) {
              setCompletedQuestionnaireDays(new Set(data.completedQuestionnaireDays));
            }

            if (data.currentDayRecommendations && data.currentDayRecommendations.length > 0) {
              setCurrentDayRecommendations(data.currentDayRecommendations);
              if (data.showingRecommendationsForDay) {
                setShowingRecommendationsForDay(data.showingRecommendationsForDay);
              }
            }
          }
        } catch (error) {
          console.error('Error in immediate restoration:', error);
        }
      }
    };

    // Try immediate restoration
    immediateRestore();
  }, [isAuthenticated]);

  // Track scroll position for floating filter
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Process pending backend calls when user navigates to next day or generates plan
  const processPendingBackendCalls = async () => {
    if (pendingBackendCalls.length === 0) return;

    try {
      setIsLoading(true);
      
      for (const call of pendingBackendCalls) {
        if (call.type === 'assign_destination') {
          await callWithLoading(
            async () => {
              return await authAPI.assignDestinationToDay(
                call.itinerary_id,
                call.day_number,
                {
                  destination_id: call.destination_id!,
                  estimated_budget: call.estimated_budget!
                }
              );
            },
            'assign-destination',
            `Adding destination to Day ${call.day_number}...`
          );
        }
      }

      // Clear pending calls after successful processing
      setPendingBackendCalls([]);

    } catch (error) {
      console.error('Error processing pending backend calls:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag end for destination cards
  const handleDragEnd = (result: DropResult) => {
    try {
      const { source, destination, draggableId } = result;

      // If dropped outside a valid droppable area, do nothing
      if (!destination) {
        return;
      }

      // If dropped in the same place, do nothing
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      // If dropped on a day container
      if (destination.droppableId.startsWith('day-')) {
        const dayNumber = parseInt(destination.droppableId.split('-')[1]);
        const destinationCardId = parseInt(draggableId.split('-')[1]);
        const destinationCard = currentDayRecommendations.find(d => d.destination_id === destinationCardId);

        if (destinationCard && itinerary.itinerary_id) {
          // Update local state immediately for better UX
          setItinerary(prev => ({
            ...prev,
            days: {
              ...prev.days,
              [dayNumber]: {
                destination_id: destinationCard.destination_id,
                destination_name: destinationCard.name,
                destination_image: destinationCard.thumbnail_img,
                estimated_budget: destinationCard.estimated_budget
              }
            }
          }));

          // Store selected destination for this day
          setSelectedDestinationForDay(prev => ({
            ...prev,
            [dayNumber]: destinationCard
          }));

          // Track this as the latest selected day
          setLatestSelectedDay(dayNumber);

          // Hide cancel selection button when destination is selected
          setShowCancelSelection(false);

          // Add to pending backend calls instead of calling immediately
          setPendingBackendCalls(prev => [
            ...prev.filter(call => !(call.type === 'assign_destination' && call.day_number === dayNumber)),
            {
              type: 'assign_destination',
              itinerary_id: itinerary.itinerary_id!,
              day_number: dayNumber,
              destination_id: destinationCard.destination_id,
              estimated_budget: destinationCard.estimated_budget
            }
          ]);

          // Keep the original recommendations but mark this one as selected
          // Don't modify currentDayRecommendations to preserve the list for retraction
        }
      }
    } catch (error) {
      console.error('Error in drag and drop handling:', error);
      // Gracefully handle any drag and drop errors to prevent invariant violations
    }
  };

  // Handle container click for retraction
  const handleContainerRetraction = (dayNumber: number) => {
    const dayData = itinerary.days[dayNumber];
    if (!dayData.destination_id) return;

    // Allow retracting any selected destination that's not locked
    if (lockedDays.has(dayNumber)) return;

    // Find the selected destination
    const selectedDestination = selectedDestinationForDay[dayNumber];
    if (!selectedDestination) return;

    // Clear the day's selection
    setItinerary(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dayNumber]: {
          destination_id: null,
          destination_name: null,
          destination_image: null,
          estimated_budget: null
        }
      }
    }));

    // Remove from selected destinations
    setSelectedDestinationForDay(prev => {
      const updated = { ...prev };
      delete updated[dayNumber];
      return updated;
    });

    // Update latest selected day to the previous one
    const remainingDays = Object.keys(selectedDestinationForDay)
      .map(Number)
      .filter(day => day !== dayNumber);
    setLatestSelectedDay(remainingDays.length > 0 ? Math.max(...remainingDays) : null);

    // Remove from pending backend calls
    setPendingBackendCalls(prev =>
      prev.filter(call => !(call.type === 'assign_destination' && call.day_number === dayNumber))
    );

    // After retraction, show the recommendations for this day if they exist
    if (currentDayRecommendations.length > 0) {
      setShowingRecommendationsForDay(dayNumber);
    } else {
      // If no recommendations exist, trigger the questionnaire to get new ones
      handleDayQuestionnaire(dayNumber);
    }
  };

  // Generate PDF with pending backend calls processing
  const generatePlan = async () => {
    if (!itinerary.itinerary_id) {
      setError("No itinerary to export");
      return;
    }

    try {
      // Process any pending backend calls first
      await processPendingBackendCalls();

      setIsLoading(true);
      
      const response = await callWithLoading(
        async () => {
          // Create a blob URL for PDF download
          const response = await fetch(`https://ikmangamanlk-production.up.railway.app/itinerary/${itinerary.itinerary_id}/export`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authAPI.getToken()}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }
          
          return response.blob();
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
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
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

  // Handle next day access - process pending calls before showing questionnaire
  const handleNextDayAccess = async (dayNumber: number) => {
    if (!itinerary.itinerary_id) {
      setError("Please complete the initial questionnaire first");
      return;
    }

    // Process any pending backend calls before proceeding
    await processPendingBackendCalls();

    // No need to lock days automatically - only lock when questionnaire is taken
    // Now show the interests questionnaire for the next day
    handleDayQuestionnaire(dayNumber);
  };

  // Sort and filter recommendations
  const sortedRecommendations = currentDayRecommendations
    .filter(dest => dest.estimated_budget <= budgetFilter)
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

  // Count selected destinations
  const selectedDestinationsCount = Object.values(itinerary.days).filter(day => day.destination_id).length;

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />

      {/* Main Content */}
      <main className="container iframe-container py-12">
        {/* Title and Generate Plan Button */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>Create Your Travel Plan</h1>
            <button
              onClick={generatePlan}
              disabled={selectedDestinationsCount === 0 || isLoading}
              className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Plan
            </button>
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

        {/* Drag and Drop Context */}
        <DragDropContext
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(result) => {
            setIsDragging(false);
            handleDragEnd(result);
          }}
          key={`dnd-context-${itinerary.itinerary_id || 'new'}`}
        >
          {/* Travel Plan Containers */}
          {!showingInterestsForDay && (
            <div className="mb-12">
              <div className="flex gap-6 flex-wrap justify-center">
                {/* Day containers */}
                {[1, 2, 3, 4].map((dayNum) => {
                  const dayData = itinerary.days[dayNum];
                  const isSelected = dayData.destination_id !== null;
                  const nextDay = getNextAvailableDay();
                  const hasCompletedQuestionnaire = completedQuestionnaireDays.has(dayNum);
                  const isClickable = questionnaireSaved && (
                    // Can always click if selected (for retraction) OR if it's the next day OR if it's day 1
                    isSelected ||
                    (!isSelected && dayNum === nextDay) ||
                    dayNum === 1
                  );
                  const shouldShow = questionnaireSaved && (dayNum === 1 || itinerary.days[dayNum - 1]?.destination_id !== null);

                  // Don't render containers that shouldn't be shown yet
                  if (!shouldShow) {
                    return null;
                  }

                  return (
                    <Droppable
                      key={dayNum}
                      droppableId={`day-${dayNum}`}
                      type="DESTINATION"
                      isDropDisabled={isSelected || !showingRecommendationsForDay}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`relative w-64 h-64 rounded-xl border-2 shadow-lg transition-all duration-300 ${
                            isSelected 
                              ? 'border-gray-300 bg-cover bg-center' 
                              : `border-gray-300 bg-gray-100 hover:border-cyan-400 hover:shadow-xl ${
                                  snapshot.isDraggingOver ? 'border-cyan-500 bg-cyan-50' : ''
                                }`
                          } ${(
                            (isSelected && !showingRecommendationsForDay) ||
                            (!isSelected && isClickable && !showingRecommendationsForDay)
                          ) ? 'cursor-pointer' : (shouldShow ? 'cursor-not-allowed opacity-60' : 'hidden')}`}
                          style={isSelected && dayData.destination_image ? {
                            backgroundImage: `url(https://ikmangamanlk-production.up.railway.app${dayData.destination_image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          } : {}}
                          onClick={() => {
                            if (isLoading || isDragging) return;

                            // Disable clicking on containers when recommendations are showing
                            if (showingRecommendationsForDay) return;

                            if (isSelected) {
                              // Allow retraction of any selected destination
                              handleContainerRetraction(dayNum);
                            } else if (!isSelected && isClickable) {
                              // Show questionnaire for this day
                              handleNextDayAccess(dayNum);
                            }
                          }}
                        >
                          {/* Day overlay for selected destinations */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex flex-col justify-end p-6">
                              <div className="text-white">
                                <div className="text-xl font-medium mb-1">Day {dayNum}</div>
                                <div className="text-2xl font-bold">{dayData.destination_name}</div>
                                {!showingRecommendationsForDay && (
                                  <div className="text-sm text-gray-300 mt-2">Tap to unselect</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Content for empty containers */}
                          {!isSelected && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                              <Plus
                                size={48}
                                className={`${isClickable ? 'text-gray-400' : 'text-gray-300'} transition-colors duration-200 mb-3 ${
                                  snapshot.isDraggingOver ? 'text-cyan-500' : ''
                                }`}
                              />
                              <div className="text-xl font-bold text-gray-600 mb-2">
                                Day {dayNum}
                              </div>
                              <div className={`text-sm font-medium ${
                                isClickable ? 'text-gray-500' : 'text-gray-400'
                              } transition-colors duration-200`}>
                                {showingRecommendationsForDay
                                  ? "Drag Your Destination Here"
                                  : isClickable
                                    ? "Click to Select Interests"
                                    : "Complete previous day first"
                                }
                              </div>
                            </div>
                          )}

                          {/* Drop indicator - Enhanced for better visibility */}
                          {snapshot.isDraggingOver && !isSelected && showingRecommendationsForDay && (
                            <div className="absolute inset-0 border-4 border-dashed border-cyan-500 rounded-xl bg-cyan-100 bg-opacity-80 flex items-center justify-center z-10">
                              <div className="text-cyan-700 font-bold text-lg bg-white px-4 py-2 rounded-lg shadow-lg">
                                Drop here for Day {dayNum}
                              </div>
                            </div>
                          )}

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {!showingInterestsForDay && showingRecommendationsForDay && currentDayRecommendations.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filter */}
              <div className="lg:w-1/4">
                <div className="card p-6 sticky top-4" style={{
                  background: 'var(--surface)',
                  zIndex: 30
                }}>
                  <div
                    className="flex items-center justify-between cursor-pointer mb-4"
                    onClick={() => setShowFilters(!showFilters)}
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
                          Budget: LKR {budgetFilter.toLocaleString()}
                        </label>
                        <input
                          type="range"
                          min="5000"
                          max="500000"
                          step="5000"
                          value={budgetFilter}
                          onChange={(e) => setBudgetFilter(Number(e.target.value))}
                          className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${((budgetFilter - 5000) / (500000 - 5000)) * 100}%, #d1d5db ${((budgetFilter - 5000) / (500000 - 5000)) * 100}%, #d1d5db 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-600)' }}>
                          <span>LKR 5,000</span>
                          <span>LKR 500,000</span>
                        </div>
                      </div>

                      {/* Sort Order Filter */}
                      <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-900)' }}>
                          Sort by
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                          style={{
                            color: 'var(--text-900)',
                            backgroundColor: 'var(--surface)',
                            borderColor: '#E2E8F0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <option value="distance">Distance: Nearest first</option>
                          <option value="budget">Budget: Low → High</option>
                          <option value="match_score">Best Match</option>
                        </select>
                        {/* Sort indicator */}
                        <div className="mt-2 text-xs" style={{ color: 'var(--text-600)' }}>
                          {sortBy === 'match_score' && 'Showing most relevant destinations first'}
                          {sortBy === 'budget' && 'Showing cheapest destinations first'}
                          {sortBy === 'distance' && 'Showing nearest destinations first'}
                        </div>
                      </div>

                      {/* Reset Button */}
                      <button
                        onClick={() => {
                          setBudgetFilter(500000);
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

              {/* Content Section */}
              <div className="lg:w-3/4">
                <div className="card p-8" style={{ background: 'var(--surface)' }}>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Available Destinations
                    </h2>
                    <p className="text-gray-600">
                      Found {currentDayRecommendations.filter(dest => dest.estimated_budget <= budgetFilter).length} destinations for Day {showingRecommendationsForDay}
                    </p>
                  </div>

              {/* Check if any destination from current recommendations is selected */}
              {(() => {
                const selectedFromCurrent = sortedRecommendations.find(dest =>
                  Object.values(selectedDestinationForDay).some(
                    selected => selected?.destination_id === dest.destination_id
                  )
                );

                if (selectedFromCurrent) {
                  // Show "Already Selected" message in a container-like display
                  return (
                    <div className="flex justify-center">
                      <div className="w-64 h-64 rounded-xl border-2 border-gray-300 bg-gray-100 flex flex-col items-center justify-center shadow-lg">
                        <div className="text-gray-500 text-xl font-bold mb-4">Already Selected</div>
                        <div className="text-gray-600 text-lg">{selectedFromCurrent.name}</div>
                        <div className="text-sm text-gray-500 mt-2 text-center px-4">
                          You can unselect by tapping the latest filled day container above
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show all available destinations
                return (
                  <Droppable droppableId={`recommendations-list-day-${showingRecommendationsForDay}`} type="DESTINATION">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                      >
                        {sortedRecommendations.map((destination, index) => (
                          <Draggable
                            key={destination.destination_id}
                            draggableId={`destination-${destination.destination_id}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                                  snapshot.isDragging
                                    ? 'shadow-2xl ring-2 ring-cyan-500 transform scale-105'
                                    : 'hover:shadow-xl hover:transform hover:scale-102'
                                }`}
                              >
                                {/* Destination Image with Price Tag */}
                                <div className="h-48 bg-gray-200 relative">
                                  {destination.thumbnail_img ? (
                                    <img
                                      src={`https://ikmangamanlk-production.up.railway.app${destination.thumbnail_img}`}
                                      alt={destination.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement
                                          ?.querySelector(".fallback-content")
                                          ?.classList.remove("hidden");
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`fallback-content absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gray-200 ${
                                      destination.thumbnail_img ? "hidden" : ""
                                    }`}
                                  >
                                    <div className="text-4xl mb-2">🏞️</div>
                                    <div className="text-sm font-medium text-gray-600">
                                      {destination.name}
                                    </div>
                                  </div>

                                  {/* Price Tag */}
                                  <div className="absolute top-4 right-4 bg-cyan-600 text-white px-3 py-1 rounded-lg font-bold">
                                    LKR {destination.estimated_budget.toLocaleString()}
                                  </div>

                                  {/* Drag indicator */}
                                  {snapshot.isDragging && (
                                    <div className="absolute inset-0 bg-cyan-500 bg-opacity-20 flex items-center justify-center">
                                      <div className="text-white font-bold text-lg drop-shadow-lg">
                                        Drag me to a day!
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {destination.name}
                                  </h3>

                                  <div className="text-gray-600 mb-4">
                                    {destination.rating_label} ({destination.distance}, {destination.travel_time})
                                  </div>

                                  <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-gray-600">Match Score</span>
                                      <span className="font-bold text-lg">{Math.round(destination.match_score * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${destination.match_score * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      // Store comprehensive itinerary state for destination details
                                      const tempData = {
                                        itinerary_id: itinerary.itinerary_id,
                                        day_number: showingRecommendationsForDay,
                                        travel_month: itinerary.travel_month,
                                        no_of_people: itinerary.no_of_people,
                                        start_location: itinerary.start_location,
                                        currentItineraryState: itinerary,
                                        currentDayRecommendations: currentDayRecommendations,
                                        showingRecommendationsForDay: showingRecommendationsForDay,
                                        selectedDestinationForDay: selectedDestinationForDay,
                                        completedQuestionnaireDays: Array.from(completedQuestionnaireDays),
                                        questionnaireSaved: questionnaireSaved,
                                        sortBy: sortBy,
                                        budgetFilter: budgetFilter
                                      };
                                      sessionStorage.setItem('tempDestinationData', JSON.stringify(tempData));
                                      sessionStorage.setItem('tempDestinationDataTimestamp', Date.now().toString());
                                      console.log('Stored itinerary state for destination details navigation');
                                      navigate(`/itinerary/${itinerary.itinerary_id}/day/${showingRecommendationsForDay}/destination/${destination.destination_id}`);
                                    }}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-lg font-bold text-lg transition-colors duration-200"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })()}

                  {/* Cancel Selection - Only show when returning from questionnaire */}
                  {showCancelSelection && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => {
                          setCurrentDayRecommendations([]);
                          setShowingRecommendationsForDay(null);
                          setShowCancelSelection(false);
                          // Clear the completed questionnaire for this day to allow re-selection
                          if (showingRecommendationsForDay) {
                            setCompletedQuestionnaireDays(prev => {
                              const updated = new Set(prev);
                              updated.delete(showingRecommendationsForDay);
                              return updated;
                            });
                          }
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors duration-200 shadow-lg"
                      >
                        Cancel Selection
                      </button>
                    </div>
                  )}

                  {/* Drag Instructions */}
                  {!sortedRecommendations.some(dest =>
                    Object.values(selectedDestinationForDay).some(
                      selected => selected?.destination_id === dest.destination_id
                    )
                  ) && (
                    <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <p className="text-cyan-700 text-center">
                        <strong>How to select:</strong> Drag destination cards and drop them on day containers above.
                        Cards will automatically rearrange when you make a selection.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DragDropContext>

        {/* Initial state message */}
        {!showingInterestsForDay && !questionnaireSaved && (
          <div className="card p-8 text-center" style={{ background: 'var(--primary-100)', borderColor: 'var(--primary-600)' }}>
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--primary-700)' }}>
              Ready to Plan Your Adventure?
            </h3>
            <p className="mb-6" style={{ color: 'var(--primary-700)' }}>
              Click on the first container to start creating your personalized travel itinerary.
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
