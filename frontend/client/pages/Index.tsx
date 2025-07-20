import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PartnerLogos from "@/components/PartnerLogos";
import FeatureSections from "@/components/FeatureSections";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Index() {
  useEffect(() => {
    document.title = "Ikmangaman.lk";
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <PartnerLogos />
      <FeatureSections />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
