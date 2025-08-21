import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative iframe-hero overflow-hidden min-h-screen h-screen">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')`,
        }}
      />

      {/* Light teal overlay for better visibility - updated to use similar color */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#159CAF]/20 via-white/10 to-[#159CAF]/25" />

      {/* Floating elements for dynamic effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"
          style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-32 right-20 w-3 h-3 bg-[#159CAF]/30 rounded-full animate-pulse"
          style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute top-64 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse"
          style={{ animationDelay: '2s', animationDuration: '2s' }} />
        <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-[#159CAF]/25 rounded-full animate-pulse"
          style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />

        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 right-10 w-6 h-6 border border-white/20 rotate-45 animate-spin"
          style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/4 left-16 w-4 h-4 border border-[#159CAF]/30 rotate-12 animate-spin"
          style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="container iframe-container text-center text-white py-8 sm:py-20 px-4">
          {/* Animated hero text */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="mb-4 sm:mb-6 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-md">
              Discover Sri Lanka
              <br />
              <span className="text-gradient bg-gradient-to-r from-[#2CD8E8] via-[#22C1D1] to-[#159CAF] bg-clip-text text-transparent bg-300% animate-gradient-flow drop-shadow-sm">
                Your Way
              </span>
            </h1>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto px-2 drop-shadow-sm">
              Experience the pearl of the Indian Ocean with personalized travel
              recommendations and cost-effective planning
            </p>
          </div>

          {/* Feature highlights with white background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12 px-2">
            <div className="animate-fade-in-up bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              style={{ animationDelay: '0.6s' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-[#e6f7f9] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#159CAF]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">Personalized</h3>
              <p className="text-sm text-gray-600 leading-relaxed">AI-powered recommendations based on your preferences and travel style</p>
            </div>

            <div className="animate-fade-in-up bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              style={{ animationDelay: '0.8s' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-[#e6f7f9] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#159CAF]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">Budget-Friendly</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Cost-effective planning with detailed budget breakdowns for every trip</p>
            </div>

            <div className="animate-fade-in-up bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer sm:col-span-2 lg:col-span-1"
              style={{ animationDelay: '1.0s' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-[#e6f7f9] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#159CAF]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">Local Insights</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Connect with local guides and discover hidden gems across Sri Lanka</p>
            </div>
          </div>

          {/* Animated CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up px-4 pb-8 sm:pb-0" style={{ animationDelay: '1.2s' }}>
            <button
              onClick={() => isAuthenticated ? navigate("/recommendation") : navigate("/register")}
              className="w-full sm:w-auto bg-[#159CAF] hover:bg-[#0d7a8a] text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Start planning
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white text-[#159CAF] border-2 border-[#159CAF] hover:bg-[#e6f7f9] px-6 sm:px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              See how it works
            </button>
          </div>
        </div>
      </div>

      {/* Add custom CSS for the gradient animation */}
      <style>
        {`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .animate-gradient-flow {
            animation: gradientFlow 3s ease infinite;
            background-size: 300% 300%;
          }
          
          .bg-300% {
            background-size: 300% 300%;
          }
        `}
      </style>
    </section>
  );
}