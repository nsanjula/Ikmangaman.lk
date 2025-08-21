import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, QuestionnaireRequest, TempQuestionnaire } from "../lib/api";
import { useApiWithLoading } from "../contexts/LoadingContext";
import SearchableDropdown from "./ui/searchable-dropdown";

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
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
        <span>{value}</span>
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
              key={option}
              type="button"
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`w-full px-4 py-2 text-sm text-left transition-all duration-150 ${option === value
                ? 'bg-cyan-500 text-white'
                : hoveredOption === option
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-900 hover:bg-cyan-50'
                }`}
              style={{
                color: option === value ? 'white' : 'var(--text-900)',
                backgroundColor: option === value
                  ? '#06B6D4'
                  : hoveredOption === option
                    ? '#F0F9FF'
                    : 'transparent'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
const QuestionnaireMetrics: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { callWithLoading } = useApiWithLoading();

  // Parse URL parameters to determine mode
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode'); // 'create-itinerary', 'day-interests', or null (default)
  const dayNumber = searchParams.get('day') ? parseInt(searchParams.get('day')!) : null;

  // Determine flow configuration based on mode
  const isItineraryMode = mode === 'create-itinerary';
  const isDayInterestsMode = mode === 'day-interests';
  const isDefaultMode = !mode;

  // Set current step and total steps based on mode
  const [currentStep, setCurrentStep] = useState(isDayInterestsMode ? 1 : 1);
  const totalSteps = isDayInterestsMode ? 1 : 2; // Day interests only has 1 step, others have 2

  // Get destination data from navigation state (for default mode)
  const destinationId = location.state?.destinationId;
  const destinationName = location.state?.destinationName;
  const isSavedPlace = location.state?.isSavedPlace || false;
  const fromCreateItinerary = location.state?.fromCreateItinerary || false;
  const backToRecommendations = location.state?.backToRecommendations || false;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const [travelMonth, setTravelMonth] = useState("April");
  const [groupSize, setGroupSize] = useState(6);
  const [startLocation, setStartLocation] = useState("");
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingQuestionnaire, setHasExistingQuestionnaire] = useState(false);

  // Interests state for day-interests mode
  const [interests, setInterests] = useState({
    nature: false,
    adventure: false,
    luxury: false,
    culture: false,
    relaxation: false,
    wellness: false,
    local_life: false,
    wild_life: false,
    food: false,
    spirituality: false,
    eco_tourism: false,
  });

  // Helper function to find the closest location name from coordinates
  const getLocationFromCoordinates = (
    lat: number,
    lng: number,
    locations: string[],
  ): string => {
    const locationCoords: Record<string, { lat: number; lng: number }> = {
      Colombo: { lat: 6.9319, lng: 79.8478 },
      Kandy: { lat: 7.2906, lng: 80.6337 },
      Galle: { lat: 6.0329, lng: 80.2168 },
      Jaffna: { lat: 9.6615, lng: 80.0255 },
      Trincomalee: { lat: 8.5874, lng: 81.2152 },
      Anuradhapura: { lat: 8.3114, lng: 80.4037 },
      Pollonaruwa: { lat: 7.9403, lng: 81.0188 },
      "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
      Ella: { lat: 6.8679, lng: 81.0461 },
      Matara: { lat: 5.9549, lng: 80.555 },
      Negombo: { lat: 7.2083, lng: 79.8358 },
      Batticaloa: { lat: 7.7102, lng: 81.6924 },
      Badulla: { lat: 6.9934, lng: 81.055 },
      Kurunegala: { lat: 7.4818, lng: 80.3609 },
      Ratnapura: { lat: 6.6828, lng: 80.3992 },
      Hambantota: { lat: 6.1241, lng: 81.1185 },
      Puttalam: { lat: 8.0362, lng: 79.8083 },
      Vavniya: { lat: 8.7514, lng: 80.4971 },
      Kalutara: { lat: 6.5854, lng: 79.9607 },
      Ampara: { lat: 7.322, lng: 81.675 },
    };

    let closestLocation = locations[0] || "Colombo";
    let minDistance = Infinity;

    locations.forEach((location) => {
      const coords = locationCoords[location];
      if (coords) {
        const distance = Math.sqrt(
          Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = location;
        }
      }
    });

    return closestLocation;
  };

  // Load starting locations on component mount
  useEffect(() => {
    const loadStartingLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAPI.getStartingLocations();
        setAvailableLocations(response.locations);
      } catch (error) {
        // Fallback to hardcoded locations if API fails
        setAvailableLocations([
          "Colombo", "Kandy", "Galle", "Jaffna", "Trincomalee", "Anuradhapura",
          "Pollonaruwa", "Nuwara Eliya", "Ella", "Matara", "Negombo", "Batticaloa",
          "Badulla", "Kurunegala", "Ratnapura", "Hambantota", "Puttalam", "Vavniya",
          "Kalutara", "Ampara",
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStartingLocations();
  }, []);

  // Handle browser back button properly and cache management
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clean up session storage when leaving the page
      if (isItineraryMode || fromCreateItinerary || backToRecommendations) {
        sessionStorage.removeItem('tempQuestionnaireData');
        sessionStorage.removeItem('itinerary_questionnaire_data');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isItineraryMode, fromCreateItinerary, backToRecommendations]);

  // Load existing questionnaire after locations are available (only step 2 and 3 data)
  useEffect(() => {
    if (availableLocations.length > 0) {
      const loadExistingQuestionnaireData = async () => {
        try {
          // First, try to load temporary questionnaire data if available
          const tempQuestionnaireKey = 'tempQuestionnaireData';
          const tempData = sessionStorage.getItem(tempQuestionnaireKey);

          if (tempData) {
            try {
              const parsedTempData = JSON.parse(tempData);
              console.log('Loading from temporary questionnaire data:', parsedTempData);

              setHasExistingQuestionnaire(true);

              // Pre-fill fields with temporary data
              if (parsedTempData.travel_month) {
                setTravelMonth(parsedTempData.travel_month);
              }
              if (parsedTempData.no_of_people) {
                setGroupSize(parsedTempData.no_of_people);
              }
              if (parsedTempData.start_location) {
                setStartLocation(parsedTempData.start_location);
              }
              return;
            } catch (e) {
              console.log('Failed to parse temporary questionnaire data, falling back to database');
              sessionStorage.removeItem(tempQuestionnaireKey);
            }
          }

          // Fall back to database questionnaire data
          const existingData = await authAPI.getQuestionnaire();
          setHasExistingQuestionnaire(true);

          if (existingData.travel_month) {
            setTravelMonth(existingData.travel_month);
          }

          if (existingData.no_of_people) {
            setGroupSize(existingData.no_of_people);
          }

          if (
            existingData.starting_location_latitudes &&
            existingData.starting_location_longitudes &&
            availableLocations.length > 0
          ) {
            const locationName = getLocationFromCoordinates(
              existingData.starting_location_latitudes,
              existingData.starting_location_longitudes,
              availableLocations,
            );
            setStartLocation(locationName);
          }
        } catch (error) {
          setHasExistingQuestionnaire(false);
        }
      };

      loadExistingQuestionnaireData();
    }
  }, [availableLocations]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Please log in to complete the questionnaire and get your personalized recommendations.",
        },
      });
      return;
    }

    // Handle day interests mode
    if (isDayInterestsMode) {
      const itineraryId = sessionStorage.getItem('itinerary_id');
      if (!itineraryId || !dayNumber) {
        setError("Missing itinerary information");
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        // Get day recommendations using the interests
        const recommendations = await callWithLoading(
          async () => {
            return await authAPI.getDayRecommendations(
              parseInt(itineraryId),
              dayNumber,
              interests
            );
          },
          'day-recommendations',
          'Getting recommendations for your day...'
        );

        // Store recommendations in session storage for the create itinerary page
        sessionStorage.setItem('day_recommendations', JSON.stringify(recommendations));

        // Navigate back to create itinerary page
        navigate('/create-itinerary');
        return;

      } catch (error) {
        console.error('Error getting day recommendations:', error);
        if (error instanceof Error) {
          setError(error.message);
        }
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Handle create-itinerary mode
    if (isItineraryMode) {
      if (!startLocation) {
        setError("Please select a starting location.");
        return;
      }

      // Store itinerary questionnaire data for the create itinerary page
      const itineraryData = {
        travel_month: travelMonth,
        no_of_people: groupSize,
        start_location: startLocation
      };

      sessionStorage.setItem('itinerary_questionnaire_data', JSON.stringify(itineraryData));
      // Clean up questionnaire flag
      sessionStorage.removeItem('questionnaire_from_create_itinerary');
      navigate('/create-itinerary', { replace: true });
      return;
    }

    // Handle default mode (destination-specific)
    if (!startLocation) {
      setError("Please select a starting location.");
      return;
    }

    if (!destinationId) {
      setError("No destination selected. Please go back and select a destination.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get existing interests or use defaults if this is a new questionnaire
      let existingInterests = {};
      if (hasExistingQuestionnaire) {
        try {
          const existingData = await authAPI.getQuestionnaire();
          existingInterests = {
            nature: existingData.nature || false,
            adventure: existingData.adventure || false,
            luxury: existingData.luxury || false,
            culture: existingData.culture || false,
            relaxation: existingData.relaxation || false,
            wellness: existingData.wellness || false,
            local_life: existingData.local_life || false,
            wild_life: existingData.wild_life || false,
            food: existingData.food || false,
            spirituality: existingData.spirituality || false,
            eco_tourism: existingData.eco_tourism || false,
          };
        } catch (error) {
          // Use default interests if we can't fetch existing ones
          existingInterests = {
            nature: true,
            adventure: false,
            luxury: false,
            culture: true,
            relaxation: false,
            wellness: false,
            local_life: false,
            wild_life: false,
            food: false,
            spirituality: false,
            eco_tourism: false,
          };
        }
      } else {
        // Default interests for new users
        existingInterests = {
          nature: true,
          adventure: false,
          luxury: false,
          culture: true,
          relaxation: false,
          wellness: false,
          local_life: false,
          wild_life: false,
          food: false,
          spirituality: false,
          eco_tourism: false,
        };
      }

      // Prepare temp questionnaire data for backend API
      const tempQuestionnaireData: TempQuestionnaire = {
        destination_id: destinationId,
        travel_month: travelMonth,
        no_of_people: groupSize,
        start_location: startLocation,
      };

      console.log('Submitting temp questionnaire data to backend:', tempQuestionnaireData);
      console.log('Start location selected:', startLocation);
      console.log('Available locations:', availableLocations);

      // Store the temp questionnaire parameters for the DestinationContext to use
      const tempQuestionnaireParams = {
        travel_month: travelMonth,
        no_of_people: groupSize,
        start_location: startLocation,
      };
      sessionStorage.setItem('tempQuestionnaireParams', JSON.stringify(tempQuestionnaireParams));

      // Call the temp questionnaire API to get destination data with personalized metrics
      const destinationWithTempData = await callWithLoading(
        async () => {
          return await authAPI.getDestinationWithTempQuestionnaire(tempQuestionnaireData);
        },
        'temp-questionnaire',
        'Getting personalized destination details...'
      );

      console.log('Received temp questionnaire destination data:', destinationWithTempData);

      // Store temp questionnaire completion flag and data for DestinationContext
      if (isSavedPlace) {
        sessionStorage.setItem('tempQuestionnaireCompleted', 'true');
        sessionStorage.setItem('tempQuestionnaireDestinationData', JSON.stringify(destinationWithTempData));
        // Navigate back to saved place destination page which will now show full details
        navigate(`/saved-destination/${destinationId}`);
      } else {
        // For search results, store both the API result and the questionnaire data for compatibility
        sessionStorage.setItem('tempQuestionnaireDestinationData', JSON.stringify(destinationWithTempData));

        const questionnaireData: QuestionnaireRequest = {
          ...existingInterests,
          travel_month: travelMonth,
          no_of_people: groupSize,
          start_location: startLocation,
        };

        const tempQuestionnaireKey = 'tempQuestionnaireData';
        sessionStorage.setItem(tempQuestionnaireKey, JSON.stringify(questionnaireData));

        console.log('Stored temporary questionnaire data for search results:', questionnaireData);

        // Navigate to destination detail page
        navigate(`/destination/${destinationId}`, {
          state: {
            fromQuestionnaire: true,
            questionnaireCompleted: true,
            destinationName: destinationName,
            isTemporaryQuestionnaire: true
          }
        });
      }
    } catch (error) {
      console.error("Failed to submit questionnaire:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit questionnaire",
      );
      if (
        error instanceof Error &&
        (error.message.includes("Authentication required") ||
          error.message.includes("Please log in again"))
      ) {
        console.log("🔐 Authentication error detected, logging out user");
        logout(); // Clear authentication state
        navigate("/login", {
          state: {
            message: "Your session has expired. Please log in again to continue.",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (isDayInterestsMode) {
      // For day interests, at least one interest should be selected
      return Object.values(interests).some(value => value);
    }

    switch (currentStep) {
      case 1:
        return travelMonth && groupSize;
      case 2:
        return startLocation;
      default:
        return false;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center max-w-md shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Authentication Required</h2>
          <p className="mb-6 text-gray-600">Please log in to access the questionnaire.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-cyan-600 text-white px-6 py-2 rounded font-medium hover:bg-cyan-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Only require destination for default mode
  if (isDefaultMode && (!destinationId || !destinationName)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center max-w-md shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Invalid Destination</h2>
          <p className="mb-6 text-gray-600">No destination selected. Please go back and select a destination.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-cyan-600 text-white px-6 py-2 rounded font-medium hover:bg-cyan-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
            {isDayInterestsMode ? `Day ${dayNumber} Preferences` :
              isItineraryMode ? 'Create Your Travel Plan' :
                'Complete Your Travel Details'}
          </h1>
          <p className="text-lg mx-auto text-center max-w-md" style={{ color: 'var(--text-600)' }}>
            {isDayInterestsMode ? 'Select your interests to get personalized recommendations' :
              isItineraryMode ? 'Set up your basic travel information' :
                `Provide your travel preferences for ${destinationName}`}
          </p>
        </div>

        {/* Step Indicator - Only show for multi-step flows */}
        {!isDayInterestsMode && (
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-4 mb-4">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${step === currentStep
                        ? 'bg-cyan-600'
                        : step < currentStep
                          ? 'bg-cyan-500'
                          : 'bg-gray-300'
                        }`}
                    >
                      {step}
                    </div>
                    {step < 2 && (
                      <div
                        className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-cyan-500' : 'bg-gray-300'
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 max-w-2xl mx-auto">
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Day Interests Mode - Single Step */}
          {isDayInterestsMode && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                What interests you for Day {dayNumber}?
              </h2>

              <div className="max-w-3xl mx-auto">
                <p className="text-lg mb-8" style={{ color: 'var(--text-600)' }}>
                  Select your interests to get personalized destination recommendations
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(interests).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-cyan-50 transition-colors"
                      style={{
                        borderColor: value ? '#06B6D4' : '#E2E8F0',
                        backgroundColor: value ? '#F0F9FF' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setInterests(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-900)' }}>
                        {key.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Travel Details Step - Show for both create-itinerary and default modes */}
          {!isDayInterestsMode && currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                {isItineraryMode ? 'Travel Details' : 'Travel Details'}
              </h2>

              <div className="max-w-lg mx-auto space-y-8">
                <div>
                  <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                    What is your preferred travel month?
                  </label>
                  <CustomDropdown
                    value={travelMonth}
                    onChange={setTravelMonth}
                    options={months}
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                    How many people are joining your trip?
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((groupSize - 1) / (60 - 1)) * 100}%, #e5e7eb ${((groupSize - 1) / (60 - 1)) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="text-center mt-4">
                    <span className="text-2xl font-bold text-cyan-600">
                      {groupSize} {groupSize === 1 ? "person" : "people"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isDayInterestsMode && currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                Starting Location
              </h2>

              <div className="max-w-lg mx-auto">
                <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                  {isItineraryMode
                    ? "Where will you be starting your trip?"
                    : `Where will you be starting your trip to ${destinationName}?`
                  }
                </label>
                <div className="w-full">
                  <SearchableDropdown
                    options={availableLocations}
                    value={startLocation}
                    onChange={setStartLocation}
                    placeholder="Search and select your starting location..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0 max-w-4xl mx-auto mt-12 mb-8 sm:mb-12 px-4 sm:px-0">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center justify-center px-6 py-3 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium text-center"
            >
              ← Previous
            </button>
          ) : (
            <button
              onClick={() => {
                if (isDayInterestsMode) {
                  navigate('/create-itinerary');
                } else if (isItineraryMode || backToRecommendations) {
                  // Always go back to recommendations for itinerary mode
                  navigate('/recommendation');
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center justify-center px-6 py-3 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              <span className="hidden sm:inline">{isDayInterestsMode || isItineraryMode ? '← Back to Recommendations' : '← Back to Destination'}</span>
              <span className="sm:hidden">← Back to Recommendations</span>
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-center"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">{isDayInterestsMode ? 'Getting Recommendations...' : 'Creating Plan...'}</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{isDayInterestsMode ? 'Get Recommendations →' : isItineraryMode ? 'Continue →' : 'Create Travel Plan →'}</span>
                  <span className="sm:hidden">{isDayInterestsMode ? 'Get Recommendations →' : 'Next →'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireMetrics;
