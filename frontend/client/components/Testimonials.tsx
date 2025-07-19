export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "London, UK",
      rating: 5,
      text: "Ikmangamn.lk helped me discover hidden gems in Sri Lanka that I never would have found on my own. The personalized recommendations were spot-on!",
      avatar: "SJ",
    },
    {
      name: "Marcus Chen",
      location: "Singapore",
      rating: 5,
      text: "The cost-effective planning feature saved me over $500 on my trip. The interface is so intuitive, I had my entire itinerary planned in under an hour.",
      avatar: "MC",
    },
    {
      name: "Elena Rodriguez",
      location: "Madrid, Spain",
      rating: 5,
      text: "As a solo female traveler, the detailed local insights and safety recommendations gave me confidence to explore Sri Lanka independently. Highly recommend!",
      avatar: "ER",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Clients Says
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied travelers who have discovered Sri Lanka
            with our personalized recommendations and expert planning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
