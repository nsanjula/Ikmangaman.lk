import { useState } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function PartnerLogos() {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const { ref, isVisible } = useScrollAnimation();

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="container iframe-container px-4">
        <div
          ref={ref}
          className={`text-center scroll-animate-slide-up ${isVisible ? 'animate' : ''}`}
        >
          <p className="text-[#159CAF] text-base sm:text-lg mb-6 sm:mb-8">Powered by</p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            {/* Google Maps Logo */}
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-3 flex-shrink-0">
                  {!imageErrors.googleMaps ? (
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc9ab74d0d22a403180b3c3116f1f10c6%2F23ad3cd329784b6ab968ea57889dc548?format=webp&width=800"
                      alt="Google Maps icon"
                      className="w-full h-full object-contain"
                      onError={() => handleImageError('googleMaps')}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#159CAF] rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                  )}
                </div>
                <span className="text-gray-700 font-semibold text-lg sm:text-xl md:text-2xl">
                  Google Maps
                </span>
              </div>
            </div>

            {/* OpenWeatherMap Logo */}
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-3 flex-shrink-0">
                  {!imageErrors.openWeather ? (
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fc9ab74d0d22a403180b3c3116f1f10c6%2F9326fb5ea02341d29c618ef9185f2b1f?format=webp&width=800"
                      alt="OpenWeatherMap icon"
                      className="w-full h-full object-contain"
                      onError={() => handleImageError('openWeather')}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#159CAF] rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                  )}
                </div>
                <span className="text-gray-700 font-semibold text-lg sm:text-xl md:text-2xl">
                  OpenWeatherMap
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
