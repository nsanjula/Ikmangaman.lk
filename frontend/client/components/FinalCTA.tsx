import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
export default function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
          Ready to explore
          <br />
          <span className="text-cyan-300">Sri Lanka?</span>
        </h2>

        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join thousands of travelers who have discovered the magic of Sri Lanka
          with our personalized recommendations and expert planning tools.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
          >
            Start Planning Your Trip
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg"
          >
            Learn More
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-cyan-300 mb-2">10K+</div>
            <div className="text-gray-400">Happy Travelers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-300 mb-2">50+</div>
            <div className="text-gray-400">Destinations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-300 mb-2">99%</div>
            <div className="text-gray-400">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
