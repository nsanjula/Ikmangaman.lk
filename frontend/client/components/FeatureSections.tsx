export default function FeatureSections() {
  return (
    <div className="space-y-0">
      {/* Personalized Travel Recommendations */}
      <section className="bg-cyan-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Personalized Travel
                <br />
                Recommendations
              </h2>
              <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
                Get customized itineraries based on your preferences, budget,
                and travel style. Our AI-powered system creates unique
                experiences tailored just for you.
              </p>
              <ul className="space-y-4 text-cyan-100">
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-cyan-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Smart destination matching
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-cyan-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Personalized activity suggestions
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-cyan-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Local insights and hidden gems
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-32 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-cyan-500 rounded flex-1"></div>
                    <div className="h-8 bg-blue-500 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost-Effective Planning */}
      <section className="bg-cyan-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform -rotate-3">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-800">
                      Rs. 12,345
                    </div>
                    <div className="text-green-600 text-sm font-semibold">
                      Save 30%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full w-3/4"></div>
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
            <div className="text-white order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Cost-Effective
                <br />
                Planning
              </h2>
              <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
                Save money without compromising on quality. Our smart algorithms
                find the best deals and optimize your budget for maximum value.
              </p>
              <ul className="space-y-4 text-cyan-100">
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-cyan-300"
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
                    className="w-6 h-6 mr-3 text-cyan-300"
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
                    className="w-6 h-6 mr-3 text-cyan-300"
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
      <section className="bg-blue-light-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Easy to use
                <br />
                Interface
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Navigate effortlessly through our intuitive platform. Designed
                with user experience in mind, planning your Sri Lankan adventure
                has never been easier.
              </p>
              <ul className="space-y-4 text-blue-100">
                <li className="flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-blue-300"
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
                    className="w-6 h-6 mr-3 text-blue-300"
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
                    className="w-6 h-6 mr-3 text-blue-300"
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
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-1">
                <div className="bg-gray-100 p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-600">
                      Ikmangamn.lk
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-cyan-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
