import HeaderLogged from "../components/HeaderLogged";
import QuestionareForm from "../components/QuestionareForm";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

const Questionare: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <HeaderLogged />
        <QuestionareForm />
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Questionare;
