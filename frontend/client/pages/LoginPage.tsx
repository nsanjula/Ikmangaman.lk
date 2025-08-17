import { useEffect } from "react";
import Header from "../components/Header";
import LoginForm from "../components/LoginForm";
import Footer from "../components/Footer";

const LoginPage: React.FC = () => {
  useEffect(() => {
    document.title = "Login | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface-alt) 100%)' }}>
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
};

export default LoginPage;
