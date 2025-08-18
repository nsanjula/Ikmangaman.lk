import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/sections/HeroSection";
import MapSection from "../components/sections/MapSection";
import PlacesToVisit from "../components/sections/PlacesToVist";
import HotelsNearby from "../components/sections/HotelsNearby";
import LocalGuides from "../components/sections/LocalGuides";
import { DestinationProvider, useDestination } from "../contexts/DestinationContext";
import { GoogleMapsProvider } from "../contexts/GoogleMapsContext";
import { FiSettings } from "react-icons/fi";

const SearchDestinationDetailContent: React.FC = () => {
  const { destinationData } = useDestination();
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuestionnaireMetrics, setShowQuestionnaireMetrics] = useState(true);

  // On entry to this page (typically via back navigation), clear any temporary questionnaire state
  // so the basic destination view loads cleanly without getting stuck in loading.
  useEffect(() => {
    const nav = (window.history.state && (window.history.state as any).usr) || location.state || {};
    if (!nav || !nav.fromQuestionnaire) {
      sessionStorage.removeItem('tempQuestionnaireData');
      sessionStorage.removeItem('tempQuestionnaireDestinationData');
      sessionStorage.removeItem('tempQuestionnaireParams');
    }
    // Always allow using questionnaire metrics again from this page
    setShowQuestionnaireMetrics(true);
  }, [location.state, destinationData?.destination_id]);

  useEffect(() => {
    if (destinationData?.destination_name) {
      document.title = `${destinationData.destination_name} | Search Result | Ikmangaman.lk`;
    } else {
      document.title = "Search Result | Ikmangaman.lk";
    }
  }, [destinationData]);

  const handleQuestionnaireMetrics = () => {
    navigate('/questionnaire-metrics', {
      state: {
        destinationId: destinationData?.destination_id,
        destinationName: destinationData?.destination_name,
        skipInterests: true,
        isSavedPlace: false
      }
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <HeroSection />

        {/* Use Questionnaire Metrics Section - Separate Card */}
        {showQuestionnaireMetrics && (
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
        )}

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
};

const SearchDestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Immediately scroll to top when the destination page loads
  // This ensures loading animation is visible even on page refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <GoogleMapsProvider>
      <DestinationProvider destinationId={parseInt(id || '0', 10)}>
        <SearchDestinationDetailContent />
      </DestinationProvider>
    </GoogleMapsProvider>
  );
};

export default SearchDestinationDetail;
