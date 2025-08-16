import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/sections/HeroSection";
import BudgetSection from "../components/sections/BudgetSection";
import MapSection from "../components/sections/MapSection";
import PlacesToVisit from "../components/sections/PlacesToVist";
import WeatherCard from "../components/sections/WeatherCard";
import HotelsNearby from "../components/sections/HotelsNearby";
import LocalGuides from "../components/sections/LocalGuides";
import { DestinationProvider, useDestination } from "../contexts/DestinationContext";
import { GoogleMapsProvider } from "../contexts/GoogleMapsContext";
import { FiSettings } from "react-icons/fi";

const SavedPlaceDestinationDetailContent: React.FC = () => {
  const { destinationData } = useDestination();
  const navigate = useNavigate();

  // State to track if we're showing the full destination page (with questionnaire metrics) or the basic view
  const [showFullDestination, setShowFullDestination] = useState(false);

  // Check if we're coming from questionnaire metrics (temp questionnaire completed)
  useEffect(() => {
    const tempQuestionnaireCompleted = sessionStorage.getItem('tempQuestionnaireCompleted');
    const destinationId = destinationData?.destination_id;

    if (tempQuestionnaireCompleted === 'true' && destinationId) {
      setShowFullDestination(true);
      // Store the completion for this specific destination
      sessionStorage.setItem(`tempQuestionnaire_${destinationId}`, 'completed');
      // Clear the general flag
      sessionStorage.removeItem('tempQuestionnaireCompleted');
    } else if (destinationId) {
      // Check if this destination has had its questionnaire completed before
      const destinationQuestionnaireStatus = sessionStorage.getItem(`tempQuestionnaire_${destinationId}`);
      if (destinationQuestionnaireStatus === 'completed') {
        setShowFullDestination(true);
      }
    }
  }, [destinationData?.destination_id]);

  useEffect(() => {
    if (destinationData?.destination_name) {
      document.title = `${destinationData.destination_name} | Saved Places | Ikmangaman.lk`;
    } else {
      document.title = "Saved Place | Ikmangaman.lk";
    }
  }, [destinationData]);

  const handleQuestionnaireMetrics = () => {
    // Navigate to questionnaire with destination context and skip step 1 (interests)
    navigate('/questionnaire-metrics', {
      state: {
        destinationId: destinationData?.destination_id,
        destinationName: destinationData?.destination_name,
        skipInterests: true, // This will skip step 1 (interests)
        isSavedPlace: true // Flag to indicate this is from saved places
      }
    });
  };

  if (!showFullDestination) {
    // Show basic view with "Use Questionnaire Metrics" button
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <HeroSection />

          {/* Use Questionnaire Metrics Section */}
          <div className="card p-6 mb-6 text-center" style={{ background: 'var(--surface)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
              Get Personalized Travel Details
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--text-600)' }}>
              Complete a quick questionnaire to get budget breakdown, best route, and 5-day weather forecast for {destinationData?.destination_name}.
            </p>
            <button
              onClick={handleQuestionnaireMetrics}
              className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
            >
              <FiSettings className="w-5 h-5" />
              Use Questionnaire Metrics
            </button>
          </div>

          <div id="map-section">
            <MapSection />
          </div>
          <PlacesToVisit />
          <HotelsNearby />
          <LocalGuides />
        </div>
        <Footer />
      </div>
    );
  }

  // Show full destination page with all sections
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <HeroSection />
        <BudgetSection />
        <div id="map-section">
          <MapSection />
        </div>
        <PlacesToVisit />
        <WeatherCard />
        <HotelsNearby />
        <LocalGuides />
      </div>
      <Footer />
    </div>
  );
};

const SavedPlaceDestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Immediately scroll to top when the destination page loads
  // This ensures loading animation is visible even on page refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <GoogleMapsProvider>
      <DestinationProvider destinationId={id}>
        <SavedPlaceDestinationDetailContent />
      </DestinationProvider>
    </GoogleMapsProvider>
  );
};

export default SavedPlaceDestinationDetail;
