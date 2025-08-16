import { useEffect } from "react";
import Header from "../components/Header";
import ResetPasswordForm from "../components/ResetPasswordForm";
import Footer from "../components/Footer";

const ResetPasswordPage: React.FC = () => {
  useEffect(() => {
    document.title = "Reset Password | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <ResetPasswordForm />
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
