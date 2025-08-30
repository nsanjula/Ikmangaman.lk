import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, QuestionnaireRequest } from "../lib/api";
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
const MultiStepQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelMonth, setTravelMonth] = useState(() => months[new Date().getMonth()] || "April");
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
          const existingData = await authAPI.getQuestionnaire();
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

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Please log in to complete the questionnaire and get your personalized recommendations.",
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

      await callWithLoading(
        () => authAPI.submitQuestionnaire(questionnaireData),
        'questionnaire-submit',
        'Creating your personalized travel plan...'
      );
      navigate("/recommendation");
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
        return selectedInterests.length > 0;
      case 2:
        return travelMonth && groupSize;
      case 3:
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
            Travel Preferences Questionnaire
          </h1>
          <p className="text-lg mx-auto text-center max-w-md" style={{ color: 'var(--text-600)' }}>
            Tell us about your travel preferences to get personalized recommendations
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-4">
              {[1, 2, 3].map((step) => (
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
                  {step < 3 && (
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
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>
                What are your interests?
              </h2>
              <p className="text-gray-600 mx-auto text-center max-w-md mb-8">
                Select one or more activities that interest you
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`relative h-32 overflow-hidden rounded-lg transition-all group ${selectedInterests.includes(interest)
                      ? "ring-2 ring-cyan-500 shadow-2xl transform scale-105"
                      : "hover:ring-2 hover:ring-cyan-300 hover:shadow-xl hover:transform hover:scale-101"
                      }`}
                    style={{
                      backgroundImage: `url(${interestImages[interest]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div
                      className={`absolute inset-0 transition-all ${selectedInterests.includes(interest)
                        ? "bg-black bg-opacity-40"
                        : "bg-black bg-opacity-50 group-hover:bg-opacity-30"
                        }`}
                    />
                    {selectedInterests.includes(interest) && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <span className="relative z-10 text-white font-bold text-lg drop-shadow-lg">
                      {interest}
                    </span>
                  </button>
                ))}
              </div>

              {selectedInterests.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-3 mx-auto text-center max-w-md">Selected interests:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                        <button
                          onClick={() => toggleInterest(interest)}
                          className="ml-2 text-cyan-500 hover:text-cyan-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                Travel Details
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

          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-900)' }}>
                Starting Location
              </h2>

              <div className="max-w-lg mx-auto">
                <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-900)' }}>
                  Where will you be starting your trip?
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
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0 max-w-4xl mx-auto mt-12 mb-8 sm:mb-0 px-4 sm:px-0">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center justify-center px-6 py-3 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium"
            >
              ← Previous
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : hasExistingQuestionnaire ? (
                <>
                  <span className="hidden sm:inline">Update Plan →</span>
                  <span className="sm:hidden">Update →</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Create Plan →</span>
                  <span className="sm:hidden">Create →</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepQuestionnaire;
