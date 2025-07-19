import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, QuestionnaireRequest } from "../lib/api";
import SearchableDropdown from "./ui/searchable-dropdown";

const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const interests = [
    "Nature",
    "Adventure",
    "Luxury",
    "Culture",
    "Relaxation",
    "Eco Tourism",
    "Wellness",
    "Local life",
    "Wildlife",
    "Food",
    "Spirituality",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelMonth, setTravelMonth] = useState("January");
  const [groupSize, setGroupSize] = useState(2);
  const [startLocation, setStartLocation] = useState("");
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load starting locations on component mount
  useEffect(() => {
    const loadStartingLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Loading starting locations from API...");
        const response = await authAPI.getStartingLocations();
        console.log(
          "Starting locations loaded successfully:",
          response.locations.length,
          "locations",
        );
        setAvailableLocations(response.locations);
      } catch (error) {
        console.warn(
          "Starting locations API failed, using fallback locations:",
          error,
        );
        // Don't show error to user since we have working fallback
        // Fallback to hardcoded locations if API fails
        setAvailableLocations([
          "Colombo",
          "Kandy",
          "Galle",
          "Jaffna",
          "Trincomalee",
          "Anuradhapura",
          "Pollonaruwa",
          "Nuwara Eliya",
          "Ella",
          "Matara",
          "Negombo",
          "Batticaloa",
          "Badulla",
          "Kurunegala",
          "Ratnapura",
          "Hambantota",
          "Puttalam",
          "Vavniya",
          "Kalutara",
          "Ampara",
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStartingLocations();
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const mapInterestToApiField = (
    interest: string,
  ): keyof QuestionnaireRequest => {
    const mapping: Record<string, keyof QuestionnaireRequest> = {
      Nature: "nature",
      Adventure: "adventure",
      Luxury: "luxury",
      Culture: "culture",
      Relaxation: "relaxation",
      "Eco Tourism": "eco_tourism",
      Wellness: "wellness",
      "Local life": "local_life",
      Wildlife: "wild_life",
      Food: "food",
      Spirituality: "spirituality",
    };
    return mapping[interest] || "nature";
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message:
            "Please log in to complete the questionnaire and get your personalized recommendations.",
        },
      });
      return;
    }

    if (!startLocation || selectedInterests.length === 0) {
      setError("Please select at least one interest and a starting location.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create questionnaire data object
      const questionnaireData: QuestionnaireRequest = {
        nature: selectedInterests.includes("Nature"),
        adventure: selectedInterests.includes("Adventure"),
        luxury: selectedInterests.includes("Luxury"),
        culture: selectedInterests.includes("Culture"),
        relaxation: selectedInterests.includes("Relaxation"),
        wellness: selectedInterests.includes("Wellness"),
        local_life: selectedInterests.includes("Local life"),
        wild_life: selectedInterests.includes("Wildlife"),
        food: selectedInterests.includes("Food"),
        spirituality: selectedInterests.includes("Spirituality"),
        eco_tourism: selectedInterests.includes("Eco Tourism"),
        travel_month: travelMonth,
        no_of_people: groupSize,
        start_location: startLocation,
      };

      await authAPI.submitQuestionnaire(questionnaireData);
      navigate("/recommendation");
    } catch (error) {
      console.error("Failed to submit questionnaire:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit questionnaire",
      );
      if (
        error instanceof Error &&
        (error.message.includes("Authentication required") ||
          error.message.includes("Please log in again"))
      ) {
        navigate("/login", {
          state: {
            message:
              "Your session has expired. Please log in again to continue.",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyan-700 text-white flex items-center justify-center">
        <div className="bg-cyan-600 p-8 rounded-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">Please log in to access the questionnaire.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-cyan-700 px-6 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-700 text-white">
      <main className="px-6 py-10 max-w-4xl mx-auto space-y-10">
        <h2 className="text-2xl font-bold">Travel Preferences Questionnaire</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-red-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-cyan-600 p-6 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading questionnaire...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Question 1 */}
            <div className="bg-cyan-800 p-6 rounded-lg">
              <p className="text-lg font-semibold mb-4">
                1. What are your interests? (Select one or more)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`relative h-20 bg-cyan-600 flex items-center justify-center text-lg font-medium rounded-lg transition-all ${
                      selectedInterests.includes(interest)
                        ? "ring-2 ring-white bg-cyan-500"
                        : "bg-cyan-600 hover:bg-cyan-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInterests.includes(interest)}
                      readOnly
                      className="absolute top-2 left-2 scale-125 accent-white"
                    />
                    <span>{interest}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-cyan-800 p-6 rounded-lg">
              <p className="text-lg font-semibold mb-4">
                2. What is your travel month?
              </p>
              <select
                value={travelMonth}
                onChange={(e) => setTravelMonth(e.target.value)}
                className="bg-cyan-600 text-white px-4 py-2 rounded w-full md:w-1/2"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Question 3 */}
            <div className="bg-cyan-800 p-6 rounded-lg">
              <p className="text-lg font-semibold mb-4">
                3. How many people joining your trip?
              </p>
              <input
                type="range"
                min={1}
                max={30}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-center mt-2 text-xl">
                {groupSize} {groupSize === 1 ? "person" : "people"}
              </p>
            </div>

            {/* Question 4 - Updated with Searchable Dropdown */}
            <div className="bg-cyan-800 p-6 rounded-lg">
              <p className="text-lg font-semibold mb-4">
                4. Where will you be starting your adventure?
              </p>
              <div className="w-full md:w-1/2">
                <SearchableDropdown
                  options={availableLocations}
                  value={startLocation}
                  onChange={setStartLocation}
                  placeholder="Search and select your starting location..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-10">
              <button
                onClick={handleSubmit}
                className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={
                  !startLocation ||
                  selectedInterests.length === 0 ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  "Create your Travel Plan →"
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default QuestionnairePage;
