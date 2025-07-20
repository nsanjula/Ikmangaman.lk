import { useEffect } from "react";
import Header from "../components/Header";
import RegisterForm from "../components/RegisterForm";
import Footer from "../components/Footer";

export default function RegisterPage() {
  useEffect(() => {
    document.title = "Register | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <RegisterForm />
      <Footer />
    </div>
  );
}
