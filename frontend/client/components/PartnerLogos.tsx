export default function PartnerLogos() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-8">Powered by</p>

          <div className="flex justify-center items-center space-x-12 md:space-x-16">
            {/* Google Maps Logo */}
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 mr-3">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc9ab74d0d22a403180b3c3116f1f10c6%2F23ad3cd329784b6ab968ea57889dc548?format=webp&width=800"
                    alt="Google Maps icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-gray-700 font-semibold text-xl md:text-2xl">
                  Google Maps
                </span>
              </div>
            </div>

            {/* OpenWeatherMap Logo */}
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 mr-3">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Fc9ab74d0d22a403180b3c3116f1f10c6%2F9326fb5ea02341d29c618ef9185f2b1f?format=webp&width=800"
                    alt="OpenWeatherMap icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-gray-700 font-semibold text-xl md:text-2xl">
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
