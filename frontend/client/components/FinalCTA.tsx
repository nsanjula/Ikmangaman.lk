import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useAuth } from "../contexts/AuthContext";

export default function FinalCTA() {
  const navigate = useNavigate();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: buttonsRef, isVisible: buttonsVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-[#159CAF] py-12 sm:py-16 lg:py-20">
      <div className="container iframe-container text-center px-4">
        <div
          ref={headerRef}
          className={`scroll-animate-slide-up ${headerVisible ? 'animate' : ''}`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to explore
            <br />
            <span className="text-white">Sri Lanka?</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-[#e6f7f9] mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Join thousands of travelers who have discovered the magic of Sri Lanka
            with our personalized recommendations and expert planning tools.
          </p>
        </div>

        <div
          ref={buttonsRef}
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center scroll-animate-zoom-in ${buttonsVisible ? 'animate' : ''} px-2`}
        >
          <Button
            onClick={() => isAuthenticated ? navigate("/recommendation") : navigate("/register")}
            size="lg"
            className="w-full sm:w-auto bg-white text-[#159CAF] hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-white"
          >
            Start Planning Your Trip
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-[#159CAF] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-lg transform hover:scale-105 transition-all duration-300 bg-transparent hover:bg-opacity-90"
          >
            Learn More
          </Button>
        </div>

        <div
          ref={statsRef}
          className={`mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center stagger-container ${statsVisible ? 'animate' : ''}`}
        >
          <div className="scroll-animate-stagger">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">10K+</div>
            <div className="text-sm sm:text-base text-[#e6f7f9]">Happy Travelers</div>
          </div>
          <div className="scroll-animate-stagger">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">50+</div>
            <div className="text-sm sm:text-base text-[#e6f7f9]">Destinations</div>
          </div>
          <div className="scroll-animate-stagger">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">99%</div>
            <div className="text-sm sm:text-base text-[#e6f7f9]">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
