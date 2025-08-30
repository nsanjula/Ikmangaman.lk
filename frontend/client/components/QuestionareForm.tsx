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

  // Mapping interests to their corresponding background images
  const interestImages: Record<string, string> = {
    "Local life":
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F4ec83662d1844aeaa5d323e052270e37?format=webp&width=800",
    Luxury:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2Fb9752f869d914243ab37cd32ddf978a0?format=webp&width=800",
    Nature:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2Fb9fae89a2725405795c1a68c528afb19?format=webp&width=800",
    Relaxation:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F9351df570981411084084178dc2eeb49?format=webp&width=800",
    Spirituality:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F5a6149acb383492ab4fa53113c9a2962?format=webp&width=800",
    Wellness:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2Fb5bbad88083b47c49dfb8636d3271b42?format=webp&width=800",
    Wildlife:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F6cff4f41eed047a58eff03b5da95fde0?format=webp&width=800",
    Adventure:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2Fe9cfb9f2071744dc9fe1f77c068e8cad?format=webp&width=800",
    Culture:
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F167baa7d93c54fca8b563210bd1a245e?format=webp&width=800",
    "Eco Tourism":
      "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F94e2006a44cd4377896ea592f5fdf60e?format=webp&width=800",
    Food: "https://cdn.builder.io/api/v1/image/assets%2F2c4e52b2e49747388d27aa588eb168b1%2F9e48fa9fe6c7465ab88c0da4e2a4f560?format=webp&width=800",
  };

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
  const [hasExistingQuestionnaire, setHasExistingQuestionnaire] =
    useState(false);

  // Helper function to find the closest location name from coordinates
  const getLocationFromCoordinates = (
    lat: number,
    lng: number,
    locations: string[],
  ): string => {
    // Predefined coordinates for Sri Lankan cities (approximations)
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
      Kilinochchi: { lat: 9.397, lng: 80.403 },
      Mullaitivu: { lat: 9.267, lng: 80.814 },
      Mannar: { lat: 8.977, lng: 79.904 },
      "Point Pedro": { lat: 9.816, lng: 80.233 },
      Chavakachcheri: { lat: 9.661, lng: 80.165 },
      Kankesanthurai: { lat: 9.791, lng: 80.038 },
      Valvettithurai: { lat: 9.817, lng: 80.071 },
      Kodikamam: { lat: 9.647, lng: 80.198 },
      Pooneryn: { lat: 9.267, lng: 79.904 },
      Velanai: { lat: 9.63, lng: 79.919 },
      Kayts: { lat: 9.673, lng: 79.918 },
      Pallai: { lat: 9.627, lng: 80.273 },
      Akkaraipattu: { lat: 7.217, lng: 81.849 },
      Kalmunai: { lat: 7.416, lng: 81.816 },
      Sainthamaruthu: { lat: 7.363, lng: 81.833 },
      Eravur: { lat: 7.783, lng: 81.6 },
      Valachchenai: { lat: 7.922, lng: 81.567 },
      Oddamavadi: { lat: 7.903, lng: 81.566 },
      Kattankudy: { lat: 7.704, lng: 81.7 },
      Mawanella: { lat: 7.25, lng: 80.445 },
      Gampola: { lat: 7.164, lng: 80.571 },
      Hatton: { lat: 6.899, lng: 80.595 },
      Nawalapitiya: { lat: 7.046, lng: 80.529 },
      Talawakele: { lat: 6.936, lng: 80.653 },
      Haputale: { lat: 6.768, lng: 80.951 },
      Bandarawela: { lat: 6.828, lng: 80.986 },
      Wellawaya: { lat: 6.739, lng: 81.104 },
      Monaragala: { lat: 6.871, lng: 81.349 },
      Buttala: { lat: 6.714, lng: 81.239 },
      Kataragama: { lat: 6.422, lng: 81.332 },
      Tissamaharama: { lat: 6.28, lng: 81.286 },
      Embilipitiya: { lat: 6.342, lng: 80.849 },
      Balangoda: { lat: 6.661, lng: 80.704 },
      Belihuloya: { lat: 6.713, lng: 80.704 },
      Seethawaka: { lat: 6.956, lng: 80.248 },
      Avissawella: { lat: 6.954, lng: 80.204 },
      Homagama: { lat: 6.843, lng: 80.002 },
      Maharagama: { lat: 6.844, lng: 79.928 },
      Kottawa: { lat: 6.841, lng: 79.959 },
      Moratuwa: { lat: 6.774, lng: 79.882 },
      Panadura: { lat: 6.716, lng: 79.951 },
      Beruwala: { lat: 6.478, lng: 79.983 },
      Wadduwa: { lat: 6.642, lng: 79.959 },
      Kalpitiya: { lat: 8.229, lng: 79.716 },
      Chilaw: { lat: 7.575, lng: 79.795 },
      Wennappuwa: { lat: 7.333, lng: 79.866 },
      Dankotuwa: { lat: 7.283, lng: 79.95 },
      Minuwangoda: { lat: 7.166, lng: 79.953 },
      Divulapitiya: { lat: 7.2, lng: 79.978 },
      Katunayake: { lat: 7.169, lng: 79.89 },
      Seeduwa: { lat: 7.129, lng: 79.901 },
      Ragama: { lat: 7.027, lng: 79.922 },
      Wattala: { lat: 6.989, lng: 79.889 },
      "Ja-Ela": { lat: 7.027, lng: 79.876 },
      Kelaniya: { lat: 6.955, lng: 79.922 },
      Kiribathgoda: { lat: 6.977, lng: 79.93 },
      Gampaha: { lat: 7.089, lng: 79.994 },
      Nittambuwa: { lat: 7.144, lng: 80.06 },
      Warakapola: { lat: 7.235, lng: 80.203 },
      Alawwa: { lat: 7.33, lng: 80.242 },
      Melsiripura: { lat: 7.471, lng: 80.497 },
      Galewela: { lat: 7.692, lng: 80.568 },
      Dambulla: { lat: 7.857, lng: 80.649 },
      Habarana: { lat: 8.036, lng: 80.745 },
      Sigiriya: { lat: 7.957, lng: 80.76 },
      Kekirawa: { lat: 8.041, lng: 80.598 },
      Medawachchiya: { lat: 8.632, lng: 80.493 },
      Padaviya: { lat: 8.933, lng: 80.767 },
      Horowpathana: { lat: 8.616, lng: 80.683 },
      Mihintale: { lat: 8.35, lng: 80.5 },
      Madhu: { lat: 8.8, lng: 80.133 },
      Murunkan: { lat: 8.733, lng: 80.05 },
      Pesalai: { lat: 9, lng: 79.833 },
      "Talai Mannar": { lat: 8.983, lng: 79.917 },
      Nanattan: { lat: 8.733, lng: 79.933 },
      Pallimunai: { lat: 9, lng: 79.883 },
      Erukkulampiddi: { lat: 8.967, lng: 79.9 },
      Silavathurai: { lat: 8.7, lng: 79.883 },
      Marichchukaddi: { lat: 8.617, lng: 79.833 },
      Dehiwala: { lat: 6.8531, lng: 79.8651 },
    };

    let closestLocation = locations[0] || "Colombo";
    let minDistance = Infinity;

    // Find the closest location based on distance
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
          "Colombo","Kandy","Galle","Jaffna","Trincomalee","Anuradhapura","Pollonaruwa","Nuwara Eliya","Ella","Matara","Negombo","Batticaloa","Badulla","Kurunegala","Ratnapura","Hambantota","Puttalam","Vavniya","Kalutara","Ampara",
          "Kilinochchi","Mullaitivu","Mannar","Point Pedro","Chavakachcheri","Kankesanthurai","Valvettithurai","Kodikamam","Pooneryn","Velanai","Kayts","Pallai",
          "Akkaraipattu","Kalmunai","Sainthamaruthu","Eravur","Valachchenai","Oddamavadi","Kattankudy",
          "Mawanella","Gampola","Hatton","Nawalapitiya","Talawakele","Haputale","Bandarawela","Wellawaya","Monaragala","Buttala","Kataragama","Tissamaharama","Embilipitiya","Balangoda","Belihuloya","Seethawaka","Avissawella","Homagama","Maharagama","Kottawa","Moratuwa","Panadura","Beruwala","Wadduwa",
          "Kalpitiya","Chilaw","Wennappuwa","Dankotuwa","Minuwangoda","Divulapitiya","Katunayake","Seeduwa","Ragama","Wattala","Ja-Ela","Kelaniya","Kiribathgoda","Gampaha","Nittambuwa","Warakapola","Alawwa","Melsiripura","Galewela",
          "Dambulla","Habarana","Sigiriya","Kekirawa","Medawachchiya","Padaviya","Horowpathana","Mihintale","Madhu","Murunkan","Pesalai","Talai Mannar","Nanattan","Pallimunai","Erukkulampiddi","Silavathurai","Marichchukaddi","Dehiwala"
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStartingLocations();
  }, []);

  // Load existing questionnaire after locations are available
  useEffect(() => {
    if (availableLocations.length > 0) {
      const loadExistingQuestionnaireData = async () => {
        try {
          console.log("Loading existing questionnaire data...");
          const existingData = await authAPI.getQuestionnaire();
          console.log("Existing questionnaire data:", existingData);

          setHasExistingQuestionnaire(true);

          // Map interests from boolean fields
          const existingInterests: string[] = [];
          if (existingData.nature) existingInterests.push("Nature");
          if (existingData.adventure) existingInterests.push("Adventure");
          if (existingData.luxury) existingInterests.push("Luxury");
          if (existingData.culture) existingInterests.push("Culture");
          if (existingData.relaxation) existingInterests.push("Relaxation");
          if (existingData.wellness) existingInterests.push("Wellness");
          if (existingData.local_life) existingInterests.push("Local life");
          if (existingData.wild_life) existingInterests.push("Wildlife");
          if (existingData.food) existingInterests.push("Food");
          if (existingData.spirituality) existingInterests.push("Spirituality");
          if (existingData.eco_tourism) existingInterests.push("Eco Tourism");

          setSelectedInterests(existingInterests);

          // Set travel month
          if (existingData.travel_month) {
            console.log(
              "Setting travel month from existing data:",
              existingData.travel_month,
            );
            setTravelMonth(existingData.travel_month);
          }

          // Set group size
          if (existingData.no_of_people) {
            setGroupSize(existingData.no_of_people);
          }

          // Convert coordinates to location name and set starting location
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
            console.log("Converted coordinates to location:", locationName);
            setStartLocation(locationName);
          }
        } catch (error) {
          console.log(
            "No existing questionnaire found or failed to load:",
            error,
          );
          setHasExistingQuestionnaire(false);
          // Don't show error to user as this is expected for first-time users
        }
      };

      loadExistingQuestionnaireData();
    }
  }, [availableLocations]);

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

      console.log("Submitting questionnaire data:", questionnaireData);
      console.log("Travel month being saved:", travelMonth);
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
                    className={`relative h-24 overflow-hidden rounded-lg transition-all group ${
                      selectedInterests.includes(interest)
                        ? "ring-4 ring-white shadow-2xl transform scale-105"
                        : "hover:ring-2 hover:ring-cyan-300 hover:shadow-xl hover:transform hover:scale-101"
                    }`}
                    style={{
                      backgroundImage: `url(${interestImages[interest]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* Dark overlay for text readability */}
                    <div
                      className={`absolute inset-0 transition-all ${
                        selectedInterests.includes(interest)
                          ? "bg-black bg-opacity-40"
                          : "bg-black bg-opacity-50 group-hover:bg-opacity-30"
                      }`}
                    ></div>

                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedInterests.includes(interest)}
                      readOnly
                      className="absolute top-2 left-2 scale-125 accent-white z-10"
                    />

                    {/* Interest text */}
                    <span className="relative z-10 text-white font-bold text-lg drop-shadow-lg">
                      {interest}
                    </span>

                    {/* Selected indicator */}
                    {selectedInterests.includes(interest) && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                        </div>
                      </div>
                    )}
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
                max={60}
                value={groupSize}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setGroupSize(value);
                  // Update CSS custom property for progress fill
                  const percentage = ((value - 1) / (60 - 1)) * 100;
                  e.target.style.setProperty(
                    "--thumb-position",
                    `${percentage}%`,
                  );
                }}
                className="w-full slider"
                style={
                  {
                    "--thumb-position": `${((groupSize - 1) / (60 - 1)) * 100}%`,
                  } as React.CSSProperties
                }
              />
              <p className="text-center mt-2 text-xl">
                {groupSize} {groupSize === 1 ? "person" : "people"}
              </p>
            </div>

            {/* Question 4 - Updated with Searchable Dropdown */}
            <div className="bg-cyan-800 p-6 rounded-lg">
              <p className="text-lg font-semibold mb-4">
                4. Where will you be starting your trip?
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
                ) : hasExistingQuestionnaire ? (
                  "Update your Travel Plan →"
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
