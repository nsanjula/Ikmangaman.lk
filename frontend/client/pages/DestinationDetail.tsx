import Header from "../components/HeaderLogged";
import Footer from "../components/Footer";
import HeroSection from "../components/sections/HeroSection";
import BudgetSection from "../components/sections/BudgetSection";
import MapSection from "../components/sections/MapSection";
import PlacesToVisit from "../components/sections/PlacesToVist";
import WeatherCard from "../components/sections/WeatherCard";
import HotelsNearby from "../components/sections/HotelsNearby";
import LocalGuides from "../components/sections/LocalGuides";

const DestinationDetail: React.FC = () => {
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

export default DestinationDetail;
