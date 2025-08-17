import { useEffect } from "react";
import Header from "../components/Header";
import RegisterForm from "../components/RegisterForm";
import Footer from "../components/Footer";

export default function RegisterPage() {
  useEffect(() => {
    document.title = "Register | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface-alt) 100%)' }}>
      <Header />
      <RegisterForm />
      <Footer />
    </div>
  );
}
