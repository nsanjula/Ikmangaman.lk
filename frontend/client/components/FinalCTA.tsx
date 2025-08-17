import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function FinalCTA() {
  const navigate = useNavigate();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: buttonsRef, isVisible: buttonsVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  return (
    <section className="bg-[#159CAF] py-20">
      <div className="container iframe-container text-center">
        <div
          ref={headerRef}
          className={`scroll-animate-slide-up ${headerVisible ? 'animate' : ''}`}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Ready to explore
            <br />
            <span className="text-white">Sri Lanka?</span>
          </h2>

          <p className="text-xl text-[#e6f7f9] mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the magic of Sri Lanka
            with our personalized recommendations and expert planning tools.
          </p>
        </div>

        <div
          ref={buttonsRef}
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center scroll-animate-zoom-in ${buttonsVisible ? 'animate' : ''}`}
        >
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="bg-white text-[#159CAF] hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-white"
          >
            Start Planning Your Trip
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-[#159CAF] px-8 py-4 text-lg font-bold rounded-lg transform hover:scale-105 transition-all duration-300 bg-transparent hover:bg-opacity-90"
          >
            Learn More
          </Button>
        </div>

        <div
          ref={statsRef}
          className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center stagger-container ${statsVisible ? 'animate' : ''}`}
        >
          <div className="scroll-animate-stagger">
            <div className="text-3xl font-bold text-white mb-2">10K+</div>
            <div className="text-[#e6f7f9]">Happy Travelers</div>
          </div>
          <div className="scroll-animate-stagger">
            <div className="text-3xl font-bold text-white mb-2">50+</div>
            <div className="text-[#e6f7f9]">Destinations</div>
          </div>
          <div className="scroll-animate-stagger">
            <div className="text-3xl font-bold text-white mb-2">99%</div>
            <div className="text-[#e6f7f9]">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}