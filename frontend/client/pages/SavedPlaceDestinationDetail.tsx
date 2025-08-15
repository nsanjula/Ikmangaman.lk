import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/sections/HeroSection";
import MapSection from "../components/sections/MapSection";
import PlacesToVisit from "../components/sections/PlacesToVist";
import HotelsNearby from "../components/sections/HotelsNearby";
import LocalGuides from "../components/sections/LocalGuides";
import { DestinationProvider, useDestination } from "../contexts/DestinationContext";
import { GoogleMapsProvider } from "../contexts/GoogleMapsContext";

const SavedPlaceDestinationDetailContent: React.FC = () => {
  const { destinationData } = useDestination();

  useEffect(() => {
    if (destinationData?.destination_name) {
      document.title = `${destinationData.destination_name} | Saved Places | Ikmangaman.lk`;
    } else {
      document.title = "Saved Place | Ikmangaman.lk";
    }
  }, [destinationData]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <HeroSection />
        {/* Removed BudgetSection for saved places */}
        <div id="map-section">
          <MapSection />
        </div>
        <PlacesToVisit />
        {/* Removed WeatherCard for saved places */}
        <HotelsNearby />
        <LocalGuides />
        {/* Note: Best Route section is not included for saved places */}
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
