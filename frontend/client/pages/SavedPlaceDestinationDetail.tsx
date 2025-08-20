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
import { clearSavedPlaceQuestionnaireStorage, debugSessionStorage } from "../utils/debugSessionStorage";

const SavedPlaceDestinationDetailContent: React.FC = () => {
  const { destinationData } = useDestination();
  const navigate = useNavigate();

  // State to track if we're showing the full destination page (with questionnaire metrics) or the basic view
  // Default to false for saved places to ensure the questionnaire button shows
  const [showFullDestination, setShowFullDestination] = useState(false);

  // Check URL parameters to see if we should force basic view
  const urlParams = new URLSearchParams(window.location.search);
  const forceBasicView = urlParams.get('view') === 'basic';

  // Check if we're coming from questionnaire metrics (temp questionnaire completed)
  useEffect(() => {
    const destinationId = destinationData?.destination_id;

    if (!destinationId) return;

    // Check for destination-specific completed questionnaire data using new cache key format
    const tempCompletedKey = `tempQuestionnaireDestinationData_saved_${destinationId}`;
    const tempCompletedData = sessionStorage.getItem(tempCompletedKey);
    const tempQuestionnaireParamsKey = `tempQuestionnaireParams_saved_${destinationId}`;

    // Check for old-style completion flag (for backward compatibility)
    const tempQuestionnaireCompleted = sessionStorage.getItem('tempQuestionnaireCompleted');
    const oldCompletionKey = sessionStorage.getItem(`tempQuestionnaire_${destinationId}`);

    console.log('🔍 Saved place questionnaire check:', {
      destinationId,
      tempCompletedKey,
      hasCompletedData: !!tempCompletedData,
      tempQuestionnaireCompleted,
      oldCompletionKey
    });

    // Check if URL parameter forces basic view
    if (forceBasicView) {
      console.log('🔄 URL parameter forcing basic view');
      setShowFullDestination(false);
      // Clear the URL parameter after processing
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
      return;
    }

    // Always start with basic view for saved places unless we have EXPLICIT completion for THIS destination
    // This ensures saved places show the questionnaire button by default
    let shouldShowFullView = false;

    // Priority 1: Check if we have completed questionnaire data for this specific saved destination
    if (tempCompletedData) {
      console.log('✅ Found completed questionnaire data for saved destination');
      shouldShowFullView = true;
    }
    // Priority 2: Check for fresh completion flag (just returned from questionnaire)
    else if (tempQuestionnaireCompleted === 'true' && destinationId) {
      console.log('✅ Fresh questionnaire completion detected for saved destination');
      shouldShowFullView = true;
      // Store the completion for this specific SAVED destination with timestamp
      sessionStorage.setItem(`tempQuestionnaire_saved_${destinationId}`, 'completed');
      sessionStorage.setItem(`tempQuestionnaire_saved_${destinationId}_time`, Date.now().toString());
      // Clear the general flag after processing
      sessionStorage.removeItem('tempQuestionnaireCompleted');
    }
    // Priority 3: Check for stored completion flag for this destination
    else {
      const savedDestinationSpecificFlag = sessionStorage.getItem(`tempQuestionnaire_saved_${destinationId}`);

      if (savedDestinationSpecificFlag === 'completed') {
        // Check if this saved destination completion is recent (within 1 hour)
        const completionTime = sessionStorage.getItem(`tempQuestionnaire_saved_${destinationId}_time`);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        if (completionTime && (now - parseInt(completionTime)) < oneHour) {
          console.log('✅ Found recent saved destination completion');
          shouldShowFullView = true;
        } else {
          console.log('ℹ️ Found expired saved destination completion - resetting to basic view');
          sessionStorage.removeItem(`tempQuestionnaire_saved_${destinationId}`);
          sessionStorage.removeItem(`tempQuestionnaire_saved_${destinationId}_time`);
          shouldShowFullView = false;
        }
      } else {
        console.log('ℹ️ No valid saved destination questionnaire completion - showing basic view with questionnaire button');
        shouldShowFullView = false;

        // Clear any stale questionnaire data to ensure clean state for saved destinations
        const allKeys = Object.keys(sessionStorage);
        allKeys.forEach(key => {
          // Only clear keys that are NOT for other contexts but could interfere
          if ((key.startsWith('tempQuestionnaireDestinationData_') && !key.includes('_saved_')) ||
              (key.startsWith('tempQuestionnaireParams_') && !key.includes('_saved_')) ||
              (key.startsWith('tempDestinationData_') && !key.includes('_saved_'))) {
            console.log(`🧹 Clearing non-saved questionnaire cache: ${key}`);
            sessionStorage.removeItem(key);
          }
        });
      }
    }

    console.log('🔍 Saved destination final decision:', {
      shouldShowFullView,
      tempCompletedData: !!tempCompletedData,
      tempQuestionnaireCompleted,
      destinationId
    });

    setShowFullDestination(shouldShowFullView);
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
            <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-600)' }}>
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

  // Clear any questionnaire data that shouldn't apply to saved places
  useEffect(() => {
    const destinationId = id;
    if (!destinationId) return;

    // IMMEDIATE cleanup - use debug utility for thorough cleanup
    console.log('🔍 Before cleanup - current session storage state:');
    debugSessionStorage();

    // Clear any questionnaire data that doesn't belong to this saved destination
    const clearedCount = clearSavedPlaceQuestionnaireStorage(destinationId);
    console.log(`🧹 Cleared ${clearedCount} interfering questionnaire keys`);

    // Clear general questionnaire flags that might interfere (except the ones for this saved place)
    const generalFlags = ['tempQuestionnaireData', 'questionnaire_from_create_itinerary', 'itinerary_questionnaire_data'];
    generalFlags.forEach(flag => {
      if (sessionStorage.getItem(flag)) {
        console.log(`🧹 Clearing general questionnaire flag: ${flag}`);
        sessionStorage.removeItem(flag);
      }
    });

    console.log('🔍 After cleanup - remaining session storage:');
    debugSessionStorage();

    // Only keep saved-place specific questionnaire data
    console.log('ℹ️ Saved place initialized for destination:', destinationId, '- cleaned up interfering data');
  }, [id]);

  // Immediately scroll to top when the destination page loads
  // This ensures loading animation is visible even on page refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <GoogleMapsProvider>
      <DestinationProvider destinationId={parseInt(id || '0')} contextType="saved">
        <SavedPlaceDestinationDetailContent />
      </DestinationProvider>
    </GoogleMapsProvider>
  );
};

export default SavedPlaceDestinationDetail;
