import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
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

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handler for initial questionnaire (steps 2 & 3)
  const handleInitialQuestionnaire = () => {
    if (hasNavigatedToQuestionnaire) return; // Prevent multiple navigations

    setHasNavigatedToQuestionnaire(true);
    // Use normal navigation (not replace) to preserve proper back button behavior
    navigate("/questionnaire-metrics?mode=create-itinerary", {
      state: { fromCreateItinerary: true, backToRecommendations: true }
    });
  };

  // Check if user should be redirected to initial questionnaire
  useEffect(() => {
    if (isAuthenticated && !questionnaireSaved && itinerary.itinerary_id === null) {
      // If no questionnaire data is saved, redirect to initial questionnaire
      const savedData = sessionStorage.getItem('itinerary_questionnaire_data');
      if (!savedData) {
        // Add a small delay to prevent issues with rapid navigation
        const timeoutId = setTimeout(() => {
          handleInitialQuestionnaire();
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isAuthenticated, questionnaireSaved, itinerary.itinerary_id]);

  // Handle browser back button to prevent getting stuck in loops
  useEffect(() => {
    let navigationHandled = false;

    const handleBackButton = (event: PopStateEvent) => {
      if (navigationHandled) return;

      console.log('Back button pressed on create-itinerary page');

      // If we're on create-itinerary and have no data, go back to recommendations
      if (!questionnaireSaved && itinerary.itinerary_id === null) {
        const savedData = sessionStorage.getItem('itinerary_questionnaire_data');
        if (!savedData) {
          navigationHandled = true;

          // Clean up any remaining temporary data
          sessionStorage.removeItem('tempQuestionnaireData');
          sessionStorage.removeItem('itinerary_questionnaire_data');

          // Navigate to recommendations page
          navigate('/recommendation', { replace: true });
        }
      }
    };

    // Remove pageshow handler that was causing cache-related reload issues
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [questionnaireSaved, itinerary.itinerary_id, navigate]);

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
  }, [questionnaireSaved]);

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

  // Generate PDF
  const generatePlan = async () => {
    if (!itinerary.itinerary_id) {
      setError("No itinerary to export");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await callWithLoading(
        async () => {
          // Create a blob URL for PDF download
          const response = await fetch(`http://localhost:8000/itinerary/${itinerary.itinerary_id}/export`, {
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

  // Sort recommendations
  const sortedRecommendations = currentDayRecommendations.slice().sort((a, b) => {
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

        {/* Travel Plan Containers */}
        {!showingInterestsForDay && (
          <div className="mb-12">
            <div className="flex gap-6 flex-wrap">
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
                    className={`relative w-64 h-64 rounded-xl border-2 shadow-lg transition-all duration-300 ${
                      isSelected 
                        ? 'border-gray-300 bg-cover bg-center' 
                        : 'border-gray-300 bg-gray-100 hover:border-cyan-400 hover:shadow-xl'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    style={isSelected && dayData.destination_image ? {
                      backgroundImage: `url(http://localhost:8000${dayData.destination_image})`,
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

                    {/* Plus icon for empty containers */}
                    {!isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plus 
                          size={48} 
                          className={`${isClickable ? 'text-gray-400' : 'text-gray-300'} transition-colors duration-200`}
                        />
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
          <div className="card p-8" style={{ background: 'var(--surface)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Day {showingRecommendationsForDay.toString().padStart(2, '0')}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-700">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium"
                >
                  <option value="distance">Distance</option>
                  <option value="budget">Budget</option>
                  <option value="match_score">Match Score</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRecommendations.map((destination) => (
                <div
                  key={destination.destination_id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Destination Image */}
                  <div className="h-52 bg-gray-200 relative">
                    {destination.thumbnail_img ? (
                      <img
                        src={`http://localhost:8000${destination.thumbnail_img}`}
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
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {destination.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-semibold">LKR {destination.estimated_budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <span className={`font-semibold ${
                          destination.rating_label === 'Very Good' ? 'text-green-600' :
                          destination.rating_label === 'Good' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {destination.rating_label} ({destination.distance}, {destination.travel_time})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Match Score:</span>
                        <span className="font-semibold">{Math.round(destination.match_score * 100)}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => selectDestination(destination)}
                        disabled={isLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => navigate(`/itinerary/${itinerary.itinerary_id}/day/${showingRecommendationsForDay}/destination/${destination.destination_id}`)}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
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
        )}

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
