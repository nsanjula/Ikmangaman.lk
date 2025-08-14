import { useEffect } from "react";
import Header from "../components/Header";
import MultiStepQuestionnaire from "../components/MultiStepQuestionnaire";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

const Questionare: React.FC = () => {
  useEffect(() => {
    document.title = "Questionnaire | Ikmangaman.lk";
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <MultiStepQuestionnaire />
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Questionare;
