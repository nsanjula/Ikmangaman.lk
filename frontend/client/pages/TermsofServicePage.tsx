import { useEffect } from "react";
import Header from "../components/Header";
import TermsofServiceSection from "../components/TermsofService";
import Footer from "../components/Footer";

const TermsOfService: React.FC = () => {
    useEffect(() => {
        document.title = "About Us | Ikmangaman.lk";
    }, []);

    return (
        <div className="min-h-screen">
            <Header />
            <TermsofServiceSection />
            <Footer />
        </div>
    );
};

export default TermsOfService;
