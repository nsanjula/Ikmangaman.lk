import React, { useState, useEffect } from "react";
import { FiUser, FiPhone, FiMail } from "react-icons/fi";
import { useDestination } from "../../contexts/DestinationContext";

// API Base URL for image URL construction
const API_BASE_URL = "http://localhost:8000";

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
  const { destinationData, loading, error } = useDestination();
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

  const getGenderText = (gender: string) => {
    return gender === "M" ? "Male" : gender === "F" ? "Female" : "Not specified";
  };

  const getExperienceLevel = (experience: string) => {
    if (!experience) return { level: "Guide", color: "#6B7280" };
    
    const expLower = experience.toLowerCase();
    if (expLower.includes("expert") || expLower.includes("senior")) {
      return { level: "Expert Guide", color: "#DC2626" };
    } else if (expLower.includes("experienced") || expLower.includes("professional")) {
      return { level: "Professional", color: "#2563EB" };
    } else {
      return { level: "Local Guide", color: "#059669" };
    }
  };

  if (loading) {
    return (
      <div className="card p-6 mb-6 animate-pulse" style={{ background: 'var(--surface)' }}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
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
          Local Guides
        </h2>
        <p style={{ color: '#DC2626' }}>
          Failed to load guide data: {error}
        </p>
      </div>
    );
  }

  if (!guides || guides.length === 0) {
    return (
      <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
          Local Guides
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="font-medium mb-2" style={{ color: 'var(--text-900)' }}>
            Local guides not available
          </p>
          <p className="text-sm" style={{ color: 'var(--text-600)' }}>
            No local guides are currently available for this destination
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 mb-6" style={{ background: 'var(--surface)' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>
          Local Guides
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-600)' }}>
          Expert local guides to enhance your {destinationData?.destination_name} experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {guides.map((guide, index) => {
          const experienceInfo = getExperienceLevel(guide.experience || "");
          
          return (
            <div
              key={guide.guide_id || index}
              className="card p-0 hover:shadow-lg hover:scale-105 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
              style={{ background: 'var(--surface)' }}
            >
              {/* Guide Header */}
              <div className="p-4 pb-0">
                <div className="flex items-center gap-4 mb-4">
                  {/* Guide Photo */}
                  <div className="relative">
                    {guide.photo_url ? (
                      <img
                        src={`${API_BASE_URL}${guide.photo_url}`}
                        alt={guide.name}
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: 'var(--primary-600)' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement
                            ?.querySelector(".fallback-avatar")
                            ?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`fallback-avatar w-16 h-16 rounded-full flex items-center justify-center text-white ${guide.photo_url ? "hidden" : ""}`}
                      style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--accent))' }}
                    >
                      <FiUser className="w-8 h-8" />
                    </div>

                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs" style={{ 
                      background: '#22C55E' 
                    }}>
                      ✓
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-900)' }}>
                      {guide.name || "Guide Name Not Available"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full" style={{
                        background: 'var(--surface-alt)',
                        color: 'var(--text-600)'
                      }}>
                        {getGenderText(guide.gender || "")}
                      </span>
                      <span className="text-sm px-2 py-1 rounded-full text-white" style={{
                        backgroundColor: experienceInfo.color,
                        fontSize: '11px'
                      }}>
                        {experienceInfo.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Experience Description */}
                {guide.experience && (
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-600)' }}>
                    {guide.experience}
                  </p>
                )}

                {/* Languages */}
                {guide.languages && guide.languages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-900)' }}>
                      Languages Spoken
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="chip text-xs"
                          style={{
                            background: 'var(--primary-100)',
                            color: 'var(--primary-700)'
                          }}
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
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-900)' }}>
                      Specialties
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {guide.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="chip text-xs"
                          style={{
                            background: '#DCFCE7',
                            color: '#166534'
                          }}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex-grow p-4 pt-0">
                <div className="space-y-2 text-sm mb-4">
                  {guide.contact_no && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                      <span style={{ color: 'var(--text-600)' }}>{guide.contact_no}</span>
                    </div>
                  )}

                  {guide.email && (
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                      <span style={{ color: 'var(--text-600)' }}>{guide.email}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-4 pt-0">
                {guide.contact_no ? (
                  <button
                    onClick={() => {
                      window.open(`tel:${guide.contact_no}`, '_self');
                    }}
                    className="btn btn-primary btn-md w-full flex items-center justify-center gap-2"
                  >
                    <FiPhone className="w-4 h-4" />
                    Contact Guide
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-md w-full" disabled>
                    Contact Information Not Available
                  </button>
                )}
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
          <span className="text-xl">🗺️</span>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-900)' }}>
              Local Guide Services
            </p>
            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
              Local guides can provide personalized tours, insider knowledge, and cultural insights 
              to make your visit truly memorable. All guides are verified and experienced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalGuides;
