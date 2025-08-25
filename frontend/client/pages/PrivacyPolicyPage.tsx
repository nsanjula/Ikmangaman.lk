import { useEffect } from "react";
import Header from "../components/Header";
import PrivacyPolicySection from "../components/PrivacyPolicy";
import Footer from "../components/Footer";

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        document.title = "About Us | Ikmangaman.lk";
    }, []);

    return (
        <div className="min-h-screen">
            <Header />
            <PrivacyPolicySection />
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
