import { useEffect } from "react";
import Header from "../components/HeaderLogged";
import NoRecommendationForm from "../components/NoRecommendationForm";
import Footer from "../components/Footer";

const NoRecommendation: React.FC = () => {
  useEffect(() => {
    document.title = "No Recommendation | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <NoRecommendationForm />
      <Footer />
    </div>
  );
};

export default NoRecommendation;
