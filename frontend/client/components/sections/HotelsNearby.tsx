import React, { useState, useEffect } from "react";
import { FiMapPin, FiStar, FiPhone, FiExternalLink } from "react-icons/fi";
import { useDestination } from "../../contexts/DestinationContext";

interface Hotel {
  city: string;
  hotel_name: string;
  price: number;
  availability: string;
  rating: number;
  id: string;
  image_url: string;
}

const HotelsNearby: React.FC = () => {
  const { destinationData, loading, error } = useDestination();
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    if (!destinationData) return;

    // Extract hotel data from destination data
    try {
      const hotelData = destinationData["hotel data"];
      if (hotelData && Array.isArray(hotelData)) {
        setHotels(hotelData);
      } else if (
        hotelData &&
        hotelData.hotels &&
        Array.isArray(hotelData.hotels)
      ) {
        setHotels(hotelData.hotels);
      }
    } catch (error) {
      console.error("Error extracting hotel data:", error);
    }
  }, [destinationData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return { bg: "#DCFCE7", text: "#166534" };
      case "Few Rooms Left":
        return { bg: "#FEF3C7", text: "#92400E" };
      default:
        return { bg: "#FEE2E2", text: "#DC2626" };
    }
  };

  if (loading) {
    return (
      <div className="card p-6 mb-6 animate-pulse" style={{ background: 'var(--surface)' }}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-0 overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 mb-6 border-l-4" style={{ 
        background: 'var(--surface)', 
        borderLeftColor: '#EF4444' 
      }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>
          Hotels Nearby
        </h2>
        <p style={{ color: '#DC2626' }}>
          Failed to load hotel data: {error}
        </p>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
          Hotels Nearby
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏨</div>
          <p className="font-medium mb-2" style={{ color: 'var(--text-900)' }}>
            Hotel information not available
          </p>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            Hotel booking service may be temporarily unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>
          Hotels Nearby
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-600)' }}>
          Comfortable accommodations near {destinationData?.destination_name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {hotels.map((hotel) => {
          const availabilityColor = getAvailabilityColor(hotel.availability);
          
          return (
            <div
              key={hotel.id}
              className="group card p-0 flex flex-col overflow-hidden transition-all duration-300 cursor-pointer hover:scale-102 hover:shadow-lg"
              style={{ background: 'var(--surface)' }}
            >
              {/* Hotel Image with Price Badge */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.image_url}
                  alt={hotel.hotel_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement
                      ?.querySelector(".fallback-content")
                      ?.classList.remove("hidden");
                  }}
                />
                <div
                  className={`fallback-content absolute inset-0 flex flex-col items-center justify-center text-center p-4 hidden`}
                  style={{ 
                    background: 'var(--surface-alt)', 
                    color: 'var(--text-600)' 
                  }}
                >
                  <div className="text-4xl mb-2">🏨</div>
                  <div className="text-sm font-medium">{hotel.hotel_name}</div>
                </div>
                
                {/* Price Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded text-white text-sm font-semibold" style={{ 
                  background: 'var(--primary-700)' 
                }}>
                  {formatCurrency(hotel.price)}/night
                </div>

                {/* Availability Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium" style={{
                  backgroundColor: availabilityColor.bg,
                  color: availabilityColor.text
                }}>
                  {hotel.availability}
                </div>
              </div>

              {/* Hotel Content */}
              <div className="flex-grow p-4">
                {/* Hotel Name */}
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-900)' }}>
                  {hotel.hotel_name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(hotel.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm ml-1" style={{ color: 'var(--text-600)' }}>
                    {hotel.rating}/5
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-4">
                  <FiMapPin className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-600)' }}>
                    {hotel.city}
                  </span>
                </div>

                {/* Hotel Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="chip text-xs">
                    Free WiFi
                  </span>
                  <span className="chip text-xs">
                    Parking
                  </span>
                  <span className="chip text-xs">
                    Restaurant
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-0">
                <button className="btn btn-primary btn-md w-full flex items-center justify-center gap-2">
                  <FiExternalLink className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="p-4 rounded-lg border-l-4" style={{ 
        background: 'var(--surface-alt)', 
        borderLeftColor: 'var(--primary-600)' 
      }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🏨</span>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
              Hotel Information
            </p>
            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
              Hotel information is provided by our booking partners. 
              Prices and availability may vary based on season and demand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsNearby;
