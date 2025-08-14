import { useEffect } from "react";
import { useParams } from "react-router-dom";
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

const DestinationDetailContent: React.FC = () => {
  const { destinationData } = useDestination();

  useEffect(() => {
    if (destinationData?.destination_name) {
      document.title = `${destinationData.destination_name} | Destination | Ikmangaman.lk`;
    } else {
      document.title = "Destination | Ikmangaman.lk";
    }
  }, [destinationData]);

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

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Immediately scroll to top when the destination page loads
  // This ensures loading animation is visible even on page refresh
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <GoogleMapsProvider>
      <DestinationProvider destinationId={id}>
        <DestinationDetailContent />
      </DestinationProvider>
    </GoogleMapsProvider>
  );
};

export default DestinationDetail;
