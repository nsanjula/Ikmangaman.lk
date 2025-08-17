import { useEffect } from "react";
import Header from "../components/Header";
import QuestionnaireMetrics from "../components/QuestionnaireMetrics";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

const QuestionnaireMetricsPage: React.FC = () => {
  useEffect(() => {
    document.title = "Travel Preferences | Ikmangaman.lk";
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <QuestionnaireMetrics />
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default QuestionnaireMetricsPage;
