import React from 'react';
import { useNavigate } from "react-router-dom";
const NoRecommendationForm = () => {
  const navigate = useNavigate();
  return (
     <div className="min-h-screen w-full bg-cyan-700 flex flex-col justify-center items-center text-center px-4">
      <p className="text-white text-lg md:text-xl font-semibold mb-2">
        No recommendations found ☹️
      </p>
      <button onClick={() => navigate("/questionare")} className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg">
        Let’s plan your first Trip.
      </button>
    </div>
  );
};

export default NoRecommendationForm;