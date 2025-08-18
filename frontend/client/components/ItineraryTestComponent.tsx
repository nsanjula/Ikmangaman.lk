import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ItineraryTestComponentProps {
  className?: string;
}

const ItineraryTestComponent: React.FC<ItineraryTestComponentProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const testItineraryNavigation = () => {
    // Test navigation to create itinerary
    navigate('/create-itinerary');
  };

  const testItineraryDestination = () => {
    // Test navigation to a specific itinerary destination
    // This should only be used for testing with valid IDs
    navigate('/itinerary/1/day/1/destination/1');
  };

  const clearSessionStorage = () => {
    // Clear all itinerary-related session storage for testing
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('itinerary') || key.includes('temp')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('Cleared all itinerary-related session storage');
  };

  return (
    <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
      <h3 className="text-lg font-bold mb-4">Itinerary Routing Test</h3>
      <div className="space-y-2">
        <button
          onClick={testItineraryNavigation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block"
        >
          Test Create Itinerary Navigation
        </button>
        <button
          onClick={testItineraryDestination}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 block"
        >
          Test Itinerary Destination Navigation
        </button>
        <button
          onClick={clearSessionStorage}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 block"
        >
          Clear Session Storage
        </button>
      </div>
    </div>
  );
};

export default ItineraryTestComponent;
