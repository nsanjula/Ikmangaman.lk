import React, { useState, useEffect } from "react";
import { FiNavigation, FiTruck, FiUsers } from "react-icons/fi";
import { BiCycling, BiCar, BiBus } from "react-icons/bi";
import { MdDirectionsTransit } from "react-icons/md";
import { DestinationDetails } from "../../lib/api";
import { useDestination } from "../../contexts/DestinationContext";
import WeatherServiceNotice from "../WeatherServiceNotice";
import { ensureRatesLoaded } from "../../utils/currency";
import useCurrency from "../../hooks/useCurrency";

interface TransportOption {
  name: string;
  cost: number;
  icon: React.ReactNode;
  field: keyof DestinationDetails;
  color: string;
}

const BudgetSection: React.FC = () => {
  const { destinationData: budgetData, loading, error } = useDestination();

  if (loading) {
    return (
      <div className="card p-6 mb-6 animate-pulse" style={{ background: 'var(--surface)' }}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-full"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-lg border" style={{ 
              background: 'var(--surface-alt)',
              borderColor: 'var(--border)'
            }}>
              <div className="h-8 bg-gray-200 rounded mb-3 mx-auto w-8"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !budgetData) {
    return (
      <div className="card p-6 mb-6 border-l-4" style={{ 
        background: 'var(--surface)', 
        borderLeftColor: '#EF4444' 
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#DC2626' }}>
          Budget Information
        </h2>
        <p style={{ color: '#DC2626' }}>
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
      icon: <BiCycling className="w-8 h-8 mb-3 mx-auto" />,
      field: "cost for bicycle",
      color: "#0f97a1"
    },
    {
      name: "Car",
      cost: budgetData["cost for car"],
      icon: <BiCar className="w-8 h-8 mb-3 mx-auto" />,
      field: "cost for car",
      color: "#0f97a1"
    },
    {
      name: "Bus",
      cost: budgetData["cost for private bus"],
      icon: <BiBus className="w-8 h-8 mb-3 mx-auto" />,
      field: "cost for private bus",
      color: "#0f97a1"
    },
    {
      name: "Transit",
      cost: budgetData["cost for transit"],
      icon: <MdDirectionsTransit className="w-8 h-8 mb-3 mx-auto" />,
      field: "cost for transit",
      color: "#0f97a1"
    },
  ];

  // Load rates on mount and subscribe to currency changes
  useEffect(() => {
    try { ensureRatesLoaded(); } catch {}
  }, []);
  const { format: formatCurrency } = useCurrency();

  return (
    <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>
          Budget Breakdown
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-600)' }}>
          Estimated transportation costs to {budgetData.destination_name} ({budgetData.distance} km)
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {transportOptions.map((option) => (
          <div
            key={option.name}
            className="card p-4 text-center"
            style={{ background: 'var(--surface)' }}
          >
            <div style={{ color: option.color }}>
              {option.icon}
            </div>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-900)' }}>
              {option.name}
            </h3>
            <div className="text-sm font-semibold px-2 py-1 rounded" style={{
              background: 'var(--primary-100)',
              color: 'var(--primary-700)'
            }}>
              {formatCurrency(option.cost)}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="p-4 rounded-lg border-l-4" style={{ 
        background: 'var(--surface-alt)', 
        borderLeftColor: 'var(--primary-600)' 
      }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
              Cost Estimation Note
            </p>
            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
              These estimates include fuel, tolls, and other transportation costs. 
              Actual costs may vary based on current prices and specific route conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSection;
