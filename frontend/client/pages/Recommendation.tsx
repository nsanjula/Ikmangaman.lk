import { useEffect } from "react";
import Header from "../components/HeaderLogged";
import RecommendationForm from "../components/RecommendationForm";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

const Recommendation: React.FC = () => {
  useEffect(() => {
    document.title = "Recommendations | Ikmangaman.lk";
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <RecommendationForm />
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Recommendation;
