import { useEffect } from "react";
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

const ItineraryDestinationDetailContent: React.FC = () => {
  const { destinationData } = useDestination();
  const navigate = useNavigate();
  const { itineraryId, dayNumber } = useParams<{ itineraryId: string; dayNumber: string; destinationId: string }>();

  useEffect(() => {
    if (destinationData?.destination_name) {
      document.title = `${destinationData.destination_name} - Day ${dayNumber} | Itinerary | Ikmangaman.lk`;
    } else {
      document.title = "Destination Details | Itinerary | Ikmangaman.lk";
    }
  }, [destinationData, dayNumber]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Back to Itinerary Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              // Navigate back to create-itinerary with state preservation
              // The CreateItinerary component should restore state from sessionStorage
              navigate('/create-itinerary');
            }}
            className="flex items-center gap-2 px-4 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Itinerary
          </button>
        </div>

        {/* Day Badge */}
        {dayNumber && (
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
              Day {dayNumber} Destination
            </span>
          </div>
        )}

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

const ItineraryDestinationDetail: React.FC = () => {
  const { itineraryId, dayNumber, destinationId } = useParams<{ 
    itineraryId: string; 
    dayNumber: string; 
    destinationId: string; 
  }>();

  // Immediately scroll to top when the destination page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!itineraryId || !dayNumber || !destinationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid URL</h1>
          <p className="text-gray-600 mb-6">Missing required parameters for itinerary destination.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <GoogleMapsProvider>
      <DestinationProvider 
        destinationId={parseInt(destinationId)}
        itineraryId={parseInt(itineraryId)}
        dayNumber={parseInt(dayNumber)}
        useItineraryContext={true}
      >
        <ItineraryDestinationDetailContent />
      </DestinationProvider>
    </GoogleMapsProvider>
  );
};

export default ItineraryDestinationDetail;
