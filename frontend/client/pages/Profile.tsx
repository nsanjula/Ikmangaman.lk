import { useEffect } from "react";
import Header from "../components/HeaderLogged";
import ProfileSection from "../components/ProfileSection";
import Footer from "../components/Footer";

const Profile: React.FC = () => {
  useEffect(() => {
    document.title = "Profile | Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <ProfileSection />
      <Footer />
    </div>
  );
};

export default Profile;
