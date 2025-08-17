import React from 'react';
import { useNavigate } from "react-router-dom";

const NoRecommendationForm = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center text-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="card p-8 max-w-md" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-100)' }}>
          <span className="text-4xl">🧭</span>
        </div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
          No recommendations found
        </h2>
        <p className="text-lg mb-6" style={{ color: 'var(--text-600)' }}>
          Complete a quick questionnaire to get personalized destination recommendations.
        </p>
        <button 
          onClick={() => navigate("/questionare")} 
          className="btn btn-primary btn-lg w-full"
        >
          Let's plan your first trip
        </button>
      </div>
    </div>
  );
};

export default NoRecommendationForm;
