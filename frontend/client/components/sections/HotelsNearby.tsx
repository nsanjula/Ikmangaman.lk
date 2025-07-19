import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiMapPin, FiStar, FiPhone, FiExternalLink } from "react-icons/fi";
import { useDestinationData } from "../../hooks/useDestinationData";

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
  const { id } = useParams<{ id: string }>();
  const { data: destinationData, loading, error } = useDestinationData(id);
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

  if (loading) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Hotels Nearby</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Hotels Nearby</h2>
        <div className="bg-red-100 border border-red-300 p-6 rounded-lg">
          <p className="text-red-700 font-medium">Failed to load hotel data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Hotels Nearby</h2>
        <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-lg">
          <p className="text-yellow-700 font-medium">
            Hotel information not available
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            Hotel booking service may be temporarily unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Hotels Nearby</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Hotel Image */}
            <img
              src={hotel.image_url}
              alt={hotel.hotel_name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://via.placeholder.com/400x300?text=Hotel+Image";
              }}
            />

            {/* Hotel Name */}
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {hotel.hotel_name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">{hotel.rating}/5</span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 mb-2">
              <FiMapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{hotel.city}</p>
            </div>

            {/* Price */}
            <p className="text-lg font-semibold text-cyan-600 mb-2">
              ${hotel.price} per night
            </p>

            {/* Availability */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  hotel.availability === "Available"
                    ? "bg-green-100 text-green-800"
                    : hotel.availability === "Few Rooms Left"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {hotel.availability}
              </span>
            </div>

            {/* Book Now Button */}
            <button className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-sm text-gray-600">
        <p>
          🏨 Hotel information is provided by our booking partners. Prices and
          availability may vary.
        </p>
      </div>
    </div>
  );
};

export default HotelsNearby;
