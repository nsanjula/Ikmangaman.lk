import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiNavigation, FiTruck, FiUsers } from "react-icons/fi";
import { BiCycling, BiCar, BiBus } from "react-icons/bi";
import { MdDirectionsTransit } from "react-icons/md";
import { DestinationDetails, authAPI } from "../../lib/api";
import { useDestinationData } from "../../hooks/useDestinationData";
import WeatherServiceNotice from "../WeatherServiceNotice";

interface TransportOption {
  name: string;
  cost: number;
  icon: React.ReactNode;
  field: keyof DestinationDetails;
}

const BudgetSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [budgetData, setBudgetData] = useState<DestinationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const data = await authAPI.getDestinationDetails(parseInt(id));
        setBudgetData(data);
      } catch (error) {
        console.error("Failed to fetch budget data:", error);

        if (error instanceof Error && error.message.includes("Weather")) {
          setError(
            "Budget calculation may be incomplete due to service issues",
          );
          // Set fallback budget data
          setBudgetData({
            "cost for bicycle": 0,
            "cost for car": 0,
            "cost for private bus": 0,
            "cost for transit": 0,
            destination_name: "Destination",
            distance: "N/A",
          });
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load budget data",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-cyan-600 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4 text-white">Budget</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !budgetData) {
    return (
      <div className="bg-red-100 border border-red-300 p-6 rounded-lg mb-10">
        <h2 className="text-xl font-semibold mb-4 text-red-800">Budget</h2>
        <p className="text-red-600">
          {error || "Budget information not available"}
        </p>
      </div>
    );
  }

  // Check if this is fallback data
  const showServiceNotice = budgetData.description?.includes(
    "temporarily limited due to service maintenance",
  );

  const transportOptions: TransportOption[] = [
    {
      name: "Bicycle",
      cost: budgetData["cost for bicycle"],
      icon: <BiCycling className="w-8 h-8 mb-2 mx-auto text-cyan-700" />,
      field: "cost for bicycle",
    },
    {
      name: "Car",
      cost: budgetData["cost for car"],
      icon: <BiCar className="w-8 h-8 mb-2 mx-auto text-cyan-700" />,
      field: "cost for car",
    },
    {
      name: "Bus",
      cost: budgetData["cost for private bus"],
      icon: <BiBus className="w-8 h-8 mb-2 mx-auto text-cyan-700" />,
      field: "cost for private bus",
    },
    {
      name: "Transit",
      cost: budgetData["cost for transit"],
      icon: (
        <MdDirectionsTransit className="w-8 h-8 mb-2 mx-auto text-cyan-700" />
      ),
      field: "cost for transit",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 rounded-lg mb-10 text-white">
      <h2 className="text-xl font-semibold mb-4">Budget Breakdown</h2>
      <p className="text-cyan-100 mb-6 text-sm">
        Estimated transportation costs to {budgetData.destination_name} (
        {budgetData.distance} km)
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {transportOptions.map((option) => (
          <div
            key={option.name}
            className="bg-white text-cyan-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            {option.icon}
            <p className="font-bold text-lg mb-1">{option.name}</p>
            <p className="text-sm text-cyan-600">
              {formatCurrency(option.cost)}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
        <p className="text-cyan-100 text-sm">
          💡 <strong>Note:</strong> These estimates include fuel, tolls, and
          other transportation costs. Actual costs may vary based on current
          prices and specific route conditions.
        </p>
      </div>
    </div>
  );
};

export default BudgetSection;
