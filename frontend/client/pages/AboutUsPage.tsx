import { useEffect } from "react";
import Header from "../components/Header";
import AboutUsSection from "../components/AboutUs";
import Footer from "../components/Footer";

const AboutUsPage: React.FC = () => {
    useEffect(() => {
        document.title = "About Us | Ikmangaman.lk";
    }, []);

    return (
        <div className="min-h-screen">
            <Header />
            <AboutUsSection />
            <Footer />
        </div>
    );
};

export default AboutUsPage;
