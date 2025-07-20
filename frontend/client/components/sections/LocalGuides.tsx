import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiUser, FiPhone, FiMail } from "react-icons/fi";
import { useDestinationData } from "../../hooks/useDestinationData";

interface Guide {
  guide_id?: number;
  name?: string;
  gender?: string;
  contact_no?: string;
  photo_url?: string;
  email?: string;
  experience?: string;
  languages?: string[];
  specialties?: string[];
}

const LocalGuides: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: destinationData, loading, error } = useDestinationData(id);
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    if (!destinationData) return;

    // Extract guide data from destination data
    try {
      const guideData = destinationData["guide details"];
      if (guideData && Array.isArray(guideData)) {
        setGuides(guideData);
      }
    } catch (error) {
      console.error("Error extracting guide data:", error);
    }
  }, [destinationData]);

  if (loading) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Local Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Local Guides</h2>
        <div className="bg-red-100 border border-red-300 p-6 rounded-lg">
          <p className="text-red-700 font-medium">Failed to load guide data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!guides || guides.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Local Guides</h2>
        <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-lg">
          <p className="text-yellow-700 font-medium">
            Local guides not available
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            No local guides are currently available for this destination
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Local Guides</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide, index) => (
          <div
            key={guide.guide_id || index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Guide Photo */}
            <div className="flex items-center gap-4 mb-4">
              {guide.photo_url ? (
                <img
                  src={`http://localhost:8000${guide.photo_url}`}
                  alt={guide.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to default avatar
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {guide.name || "Guide Name Not Available"}
                </h3>
                {guide.gender && (
                  <p className="text-sm text-gray-600">
                    {guide.gender === "M"
                      ? "Male"
                      : guide.gender === "F"
                        ? "Female"
                        : guide.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Experience */}
            {guide.experience && (
              <p className="text-sm text-gray-600 mb-3">{guide.experience}</p>
            )}

            {/* Languages */}
            {guide.languages && guide.languages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Languages
                </p>
                <div className="flex flex-wrap gap-1">
                  {guide.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties */}
            {guide.specialties && guide.specialties.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-1">
                  {guide.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              {guide.contact_no && (
                <div className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{guide.contact_no}</span>
                </div>
              )}

              {guide.email && (
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{guide.email}</span>
                </div>
              )}
            </div>

            {/* Contact Button */}
            {guide.contact_no && (
              <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors">
                Contact Guide
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-sm text-gray-200 dark:text-gray-200">
        <p>
          <span className="text-blue-400">🗺️</span> Local guides can provide
          personalized tours and insider knowledge about the destination.
        </p>
      </div>
    </div>
  );
};

export default LocalGuides;
