export default function PartnerLogos() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-8">
            Trusted by leading travel platforms
          </p>

          <div className="flex justify-center items-center space-x-12 md:space-x-16">
            {/* Booking.com Logo */}
            <div className="flex items-center justify-center">
              <div className="text-blue-600 font-bold text-2xl md:text-3xl">
                Booking.com
              </div>
            </div>

            {/* TripAdvisor Logo */}
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 mr-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full text-green-600"
                  >
                    <circle cx="12" cy="12" r="10" fill="currentColor" />
                    <circle cx="9" cy="10" r="2" fill="white" />
                    <circle cx="15" cy="10" r="2" fill="white" />
                    <path
                      d="M12 16c-2 0-3.5-1-4-2h8c-0.5 1-2 2-4 2z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="text-green-600 font-bold text-xl md:text-2xl">
                  TripAdvisor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
