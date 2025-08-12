import { useEffect } from "react";
import HeaderLogged from "../components/HeaderLogged";
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
        <HeaderLogged />
        <MultiStepQuestionnaire />
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Questionare;
