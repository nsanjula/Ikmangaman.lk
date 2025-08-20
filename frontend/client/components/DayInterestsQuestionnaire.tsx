import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../lib/api";
import { useApiWithLoading } from "../contexts/LoadingContext";

interface DayInterestsQuestionnaireProps {
  dayNumber: number;
  itineraryId: number;
  onComplete: (recommendations: any[]) => void;
  onCancel: () => void;
}

const DayInterestsQuestionnaire: React.FC<DayInterestsQuestionnaireProps> = ({
  dayNumber,
  itineraryId,
  onComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { callWithLoading } = useApiWithLoading();

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

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert selected interests to the API format
      const interestsData = {
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
      };

      const recommendations = await callWithLoading(
        async () => {
          return await authAPI.getDayRecommendations(
            itineraryId,
            dayNumber,
            interestsData
          );
        },
        'day-recommendations',
        'Getting recommendations for your day...'
      );

      onComplete(recommendations);

    } catch (error) {
      console.error('Error getting day recommendations:', error);
      console.error('Error details:', {
        error,
        type: typeof error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to get recommendations. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
          Day {dayNumber.toString().padStart(2, '0')} - What interests you?
        </h2>
        <p className="text-lg mx-auto text-center max-w-md" style={{ color: 'var(--text-600)' }}>
          Select your interests to get personalized destination recommendations for this day
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Interests Grid */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {interests.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              disabled={isSubmitting}
              className={`relative h-32 overflow-hidden rounded-lg transition-all group ${selectedInterests.includes(interest)
                ? "ring-2 ring-cyan-500 shadow-2xl transform scale-105"
                : "hover:ring-2 hover:ring-cyan-300 hover:shadow-xl hover:transform hover:scale-101"
                } ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3 mx-auto text-center max-w-md">Selected interests:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                >
                  {interest}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleInterest(interest);
                    }}
                    className="ml-2 text-cyan-500 hover:text-cyan-700"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-0">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center justify-center px-6 py-3 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={selectedInterests.length === 0 || isSubmitting}
          className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span className="hidden sm:inline">Getting Recommendations...</span>
              <span className="sm:hidden">Loading...</span>
            </>
          ) : (
            'Get Recommendations'
          )}
        </button>
      </div>
    </div>
  );
};

export default DayInterestsQuestionnaire;
