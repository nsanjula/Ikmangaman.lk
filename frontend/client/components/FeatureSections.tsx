import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function FeatureSections() {
  const { ref: ref1, isVisible: isVisible1 } = useScrollAnimation();
  const { ref: ref2, isVisible: isVisible2 } = useScrollAnimation();
  const { ref: ref3, isVisible: isVisible3 } = useScrollAnimation();

  return (
    <div className="space-y-0">
      {/* Personalized Travel Recommendations */}
      <section className="bg-white py-12 sm:py-16 lg:py-20" id="features">
        <div className="container iframe-container px-4">
          <div
            ref={ref1}
            className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center scroll-animate-slide-up ${isVisible1 ? 'animate' : ''}`}
          >
            <div className="text-gray-900 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
                Personalized Travel
                <br />
                Recommendations
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Get customized itineraries based on your preferences, budget,
                and travel style. Our AI-powered system creates unique
                experiences tailored just for you.
              </p>
              <ul className="space-y-3 sm:space-y-4 text-gray-600 max-w-lg mx-auto lg:mx-0">
                <li className="flex items-center justify-center lg:justify-start">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-[#159CAF] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Smart destination matching</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-[#159CAF] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Personalized activity suggestions</span>
                </li>
                <li className="flex items-center justify-center lg:justify-start">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-[#159CAF] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Local insights and hidden gems</span>
                </li>
              </ul>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-[#e6f7f9] border-2 border-[#a8e1ea] rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 transform rotate-1 lg:rotate-3">
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-3 sm:h-4 bg-gradient-to-r from-[#159CAF] to-[#0d7a8a] rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-24 sm:h-32 bg-gradient-to-r from-[#d4f1f5] to-[#b3e8f0] rounded-lg"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 sm:h-8 bg-[#159CAF] rounded flex-1"></div>
                    <div className="h-6 sm:h-8 bg-[#0d7a8a] rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost-Effective Planning */}
      <section className="bg-[#e6f7f9] dark:bg-gray-800  py-20">
        <div className="container iframe-container">
          <div
            ref={ref2}
            className={`grid lg:grid-cols-2 gap-12 items-center scroll-animate-slide-up ${isVisible2 ? 'animate' : ''}`}
          >
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform -rotate-3 border-2 border-[#a8e1ea]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      Rs. 12,345
                    </div>
                    <div className="text-[#159CAF] text-sm font-semibold">
                      Save 30%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-[#159CAF] to-[#0d7a8a] rounded-full w-3/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hotels</span>
                      <span className="font-semibold text-gray-600">Rs. 4500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flights</span>
                      <span className="font-semibold text-gray-600">Rs. 6000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activities</span>
                      <span className="font-semibold text-gray-600">Rs. 1840</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-gray-900 order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Cost-Effective
                <br />
                Planning
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Save money without compromising on quality. Our smart algorithms
                find the best deals and optimize your budget for maximum value.
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-[#159CAF]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Real-time price comparison
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-[#159CAF]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Budget optimization tools
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-[#159CAF]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Exclusive deals and discounts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Easy to use Interface */}
      <section className="bg-white py-20">
        <div className="container iframe-container">
          <div
            ref={ref3}
            className={`grid lg:grid-cols-2 gap-12 items-center scroll-animate-slide-up ${isVisible3 ? 'animate' : ''}`}
          >
            <div className="text-gray-900">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Easy to use
                <br />
                Interface
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Navigate effortlessly through our intuitive platform. Designed
                with user experience in mind, planning your Sri Lankan adventure
                has never been easier.
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-[#159CAF]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Drag-and-drop itinerary builder
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-[#159CAF]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  One-click booking
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-[#159CAF]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Mobile-responsive design
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-[#e6f7f9] border-2 border-[#a8e1ea] rounded-2xl shadow-2xl overflow-hidden transform rotate-1">
                <div className="bg-[#d4f1f5] p-4 border-b border-[#a8e1ea]">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-600">
                      Ikmangaman.lk
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gradient-to-r from-[#159CAF] to-[#0d7a8a] rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-gradient-to-br from-[#d4f1f5] to-[#b3e8f0] rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-[#b3e8f0] to-[#8fd9e8] rounded-lg"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-[#159CAF] rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
