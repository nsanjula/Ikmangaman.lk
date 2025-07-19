import Header from "../components/Header";
import LoginForm from "../components/LoginForm";
import Footer from "../components/Footer";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
};

export default LoginPage;