import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, QuestionnaireRequest } from "../lib/api";
import { useApiWithLoading } from "../contexts/LoadingContext";
import SearchableDropdown from "./ui/searchable-dropdown";

const QuestionnaireMetrics: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const [currentStep, setCurrentStep] = useState(1); // Start from step 1 (which is step 2 in the original flow)
  const totalSteps = 2; // Only 2 steps: travel details and starting location

  // Get destination data from navigation state
  const destinationId = location.state?.destinationId;
  const destinationName = location.state?.destinationName;

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

      const questionnaireData: QuestionnaireRequest = {
        ...existingInterests,
        travel_month: travelMonth,
        no_of_people: groupSize,
        start_location: startLocation,
      };

      // Store temporary questionnaire data in sessionStorage instead of submitting to database
      // This allows for temporary changes when exploring search destinations
      const tempQuestionnaireKey = 'tempQuestionnaireData';
      sessionStorage.setItem(tempQuestionnaireKey, JSON.stringify(questionnaireData));

      console.log('Stored temporary questionnaire data:', questionnaireData);

      // Navigate directly to the destination detail page with temporary questionnaire context
      navigate(`/destination/${destinationId}`, {
        state: {
          fromQuestionnaire: true,
          questionnaireCompleted: true,
          destinationName: destinationName,
          isTemporaryQuestionnaire: true // Flag to indicate this is temporary
        }
      });
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

  if (!destinationId || !destinationName) {
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
            Complete Your Travel Details
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-600)' }}>
            Provide your travel preferences for {destinationName}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      step === currentStep
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
                      className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-cyan-500' : 'bg-gray-300'
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 max-w-2xl mx-auto">
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                Travel Details
              </h2>
              
              <div className="max-w-lg mx-auto space-y-8">
                <div>
                  <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                    What is your preferred travel month?
                  </label>
                  <div className="relative">
                    <select
                      value={travelMonth}
                      onChange={(e) => setTravelMonth(e.target.value)}
                      className="w-full px-4 py-3 text-sm text-left bg-white border border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 cursor-pointer appearance-none"
                      style={{
                        color: 'var(--text-900)',
                        backgroundColor: 'var(--surface)',
                        borderColor: '#E2E8F0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 transition-transform duration-200"
                        style={{ color: '#64748B' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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

          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                Starting Location
              </h2>
              
              <div className="max-w-lg mx-auto">
                <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                  Where will you be starting your trip to {destinationName}?
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
        <div className="flex justify-between items-center max-w-4xl mx-auto mt-12">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center px-6 py-3 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
            >
              ← Previous
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-6 py-3 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Destination
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Plan...
                </>
              ) : (
                "Create Travel Plan →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireMetrics;
