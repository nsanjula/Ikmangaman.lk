import { useEffect } from "react";
import Header from "../components/Header";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password | Ikmangaman.lk";
  }, []);

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <ForgotPasswordForm onBack={handleBack} />
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
