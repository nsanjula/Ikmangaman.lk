import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative h-screen bg-cover bg-center bg-no-repeat">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Discover Sri Lanka
            <br />
            <span className="text-cyan-300">Your Way</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Experience the pearl of the Indian Ocean with personalized travel
            recommendations and cost-effective planning
          </p>

          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
          >
            Start for free
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
