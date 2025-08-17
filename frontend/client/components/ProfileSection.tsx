import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiSave,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiBookmark,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";

// API Base URL for image URL construction
const API_BASE_URL = "https://ikmangamanlk-production.up.railway.app";
import {
  authAPI,
  UserProfile,
  UserUpdateRequest,
  DestinationDetails,
} from "../lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { startLoading, setProgress, finishLoading } = useLoading();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthday: "",
    username: "",
    password: "",
  });
  const [originalData, setOriginalData] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<
    Array<{ id: number; name: string; image: string }>
  >([]);
  const [savedPlacesLoading, setSavedPlacesLoading] = useState(false);
  const [savedPlacesError, setSavedPlacesError] = useState<string | null>(null);
  const [imagesLoading, setImagesLoading] = useState(0); // Track loading images

  const placesPerPage = 3;
  const totalPages = Math.ceil(savedPlaces.length / placesPerPage);
  const currentPlaces = savedPlaces.slice(
    (currentPage - 1) * placesPerPage,
    currentPage * placesPerPage,
  );

  // Optimized function to load saved places with better performance
  const loadSavedPlaces = async (showLoading = true) => {
    try {
      if (showLoading) {
        setSavedPlacesLoading(true);
      }
      setSavedPlacesError(null);

      // Use the optimized API endpoint with caching
      const response = await authAPI.getSavedPlacesOptimized(true);

      if (response.saved_places.length === 0) {
        setSavedPlaces([]);
        return [];
      }

      // Transform the response to match the expected format with optimized images
      const savedPlacesData = response.saved_places.map(place => ({
        id: place.destination_id || place.saved_place_id,
        name: place.destination_name,
        image: place.destination_image || "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      }));

      setSavedPlaces(savedPlacesData);
      return savedPlacesData;
    } catch (error) {
      console.error("Failed to load saved places:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load saved places";
      setSavedPlacesError(errorMessage);

      // Don't return empty array on error to distinguish from empty results
      return null;
    } finally {
      if (showLoading) {
        setSavedPlacesLoading(false);
      }
    }
  };

  // Load user profile data on component mount with progressive loading
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        startLoading('profile-data', 'Loading your profile...');
        setProgress(20);
        setError(null);

        // Load profile first (critical data)
        try {
          const profile = await authAPI.getUserProfile();
          setOriginalData(profile);
          setUserData({
            firstName: profile.firstname,
            lastName: profile.lastname || "",
            email: profile.email || "",
            birthday: profile.date_0f_birth, // Note: backend has typo in field name
            username: profile.username,
            password: "********",
          });
          setProgress(60);
        } catch (profileError) {
          console.error("Failed to load user profile:", profileError);
          setError(
            profileError instanceof Error ? profileError.message : "Failed to load profile",
          );
          if (
            profileError instanceof Error &&
            profileError.message.includes("Authentication required")
          ) {
            logout();
            navigate("/login");
            return;
          }
        }

        // Finish profile loading quickly
        setProgress(100);
        setTimeout(() => {
          finishLoading('profile-data');
          setIsLoading(false);
        }, 150);

        // Load saved places in background (non-blocking)
        setTimeout(() => {
          loadSavedPlaces(true);
        }, 200);

      } catch (error) {
        console.error("Failed to load profile data:", error);
        finishLoading('profile-data');
        setIsLoading(false);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout, navigate]);

  const handleChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleSave = async () => {
    if (!originalData) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData: UserUpdateRequest = {};

      // Only include fields that have changed
      if (userData.firstName !== originalData.firstname) {
        updateData.firstname = userData.firstName;
      }
      if (userData.lastName !== (originalData.lastname || "")) {
        updateData.lastname = userData.lastName;
      }
      if (userData.email !== (originalData.email || "")) {
        updateData.email = userData.email;
      }
      if (userData.birthday !== originalData.date_0f_birth) {
        updateData.date_of_birth = userData.birthday;
      }
      // Only update password if it's not the placeholder
      if (userData.password && userData.password !== "********") {
        updateData.password = userData.password;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        await authAPI.updateUserProfile(updateData);
        // Reload profile data to get the latest state
        const updatedProfile = await authAPI.getUserProfile();
        setOriginalData(updatedProfile);
        setUserData({
          firstName: updatedProfile.firstname,
          lastName: updatedProfile.lastname || "",
          email: updatedProfile.email || "",
          birthday: updatedProfile.date_0f_birth,
          username: updatedProfile.username,
          password: "********",
        });
      }

      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear temporary questionnaire data when logging out
    sessionStorage.removeItem('tempQuestionnaireData');
    console.log('Cleared temporary questionnaire data - logging out from profile');
    logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 md:px-8" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" style={{ borderBottomColor: 'var(--primary-600)' }}></div>
            <p className="text-lg" style={{ color: 'var(--text-600)' }}>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8" style={{ background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface-alt) 100%)', color: 'var(--text-900)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-red-200 text-xl font-bold"
            >
              ��
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-xl p-8 mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--surface) 100%)', boxShadow: 'var(--shadow)' }}>
          {/* Teal Geometric Low Poly Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            background: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314B8A6' fill-opacity='0.6'%3E%3Cpolygon points='60 0 120 30 120 90 60 120 0 90 0 30'/%3E%3Cpolygon points='30 15 60 0 90 15 75 45 45 45'/%3E%3Cpolygon points='90 15 120 30 105 60 75 45'/%3E%3Cpolygon points='105 60 120 90 90 105 75 75'/%3E%3Cpolygon points='90 105 60 120 30 105 45 75 75 75'/%3E%3Cpolygon points='30 105 0 90 15 60 45 75'/%3E%3Cpolygon points='15 60 0 30 30 15 45 45'/%3E%3Cpolygon points='45 45 75 45 75 75 45 75' fill-opacity='0.3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="flex flex-col items-center relative z-10">
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg" style={{ background: 'var(--primary-600)', color: 'white', border: '4px solid var(--surface)' }}>
              {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-3xl mt-4 font-bold" style={{ color: 'var(--text-900)' }}>
              Hi, {userData.firstName || "User"}!{" "}
              <span style={{ color: 'var(--accent)' }}>✌️</span>
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-600)' }}>
              Welcome to your profile dashboard
            </p>
          </div>
        </div>

        {/* Editable Info Form */}
        <div className="rounded-xl p-6 w-full max-w-2xl mx-auto mb-8" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--surface-alt)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-900)' }}>Personal Information</h3>
          </div>

          {[
            {
              label: "First Name",
              field: "firstName",
              placeholder: "Ex: Nisal",
            },
            {
              label: "Last Name",
              field: "lastName",
              placeholder: "Ex: Sanjula",
            },
            {
              label: "Email Address",
              field: "email",
              placeholder: "Ex: nisal@example.com",
              type: "email",
            },
            {
              label: "Birthday",
              field: "birthday",
              placeholder: "YYYY-MM-DD",
              type: "date",
            },
            {
              label: "Username",
              field: "username",
              placeholder: "Ex: lkuser01",
              disabled: true,
            },
            {
              label: "Password",
              field: "password",
              placeholder: "********",
              type: "password",
            },
          ].map(
            ({
              label,
              field,
              placeholder,
              type = "text",
              disabled = false,
            }) => (
              <div className="mb-4" key={field}>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-600)' }}>
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={type}
                    value={userData[field as keyof typeof userData]}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full p-3 rounded pr-10 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--text-900)',
                      border: '1px solid var(--border)',
                      opacity: (!editMode || disabled) ? '0.7' : '1'
                    }}
                    disabled={!editMode || disabled}
                  />
                  {editMode && !disabled && (
                    <FiEdit className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--primary-600)' }} />
                  )}
                </div>
              </div>
            ),
          )}

          {editMode && (
            <button
              onClick={handleSave}
              className="btn btn-primary btn-lg w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <FiSave /> Save Changes
                </>
              )}
            </button>
          )}

          {!editMode && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setEditMode(true)}
                className="btn btn-secondary btn-md w-full flex items-center justify-center gap-2"
              >
                <FiEdit /> Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Your Saved Places */}
        <div className="w-full">
          <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-900)' }}>Your Saved Places</h3>
              {savedPlaces.length > placesPerPage && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="btn btn-secondary btn-sm disabled:opacity-50"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary btn-sm disabled:opacity-50"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>

          {savedPlacesLoading && (
            <div className="rounded-xl p-6" style={{ background: 'var(--surface-alt)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="h-48 rounded-lg mb-4 skeleton"></div>
                    <div className="h-6 skeleton mb-2 rounded w-3/4"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 skeleton rounded flex-1"></div>
                      <div className="h-8 w-8 skeleton rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <p style={{ color: 'var(--text-600)' }} className="text-sm">Loading your saved places...</p>
              </div>
            </div>
          )}

          {savedPlacesError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-sm">Unable to load saved places</p>
                  <p className="text-sm mt-1 text-red-600">{savedPlacesError}</p>
                  <div className="mt-3">
                    <button
                      onClick={() => loadSavedPlaces(true)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!savedPlacesLoading &&
            !savedPlacesError &&
            savedPlaces.length === 0 && (
              <div className="rounded-xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-alt)' }}>
                  <FiUser size={32} style={{ color: 'var(--primary-600)' }} />
                </div>
                <p className="text-lg mb-4" style={{ color: 'var(--text-900)' }}>No saved places yet</p>
                <p className="mb-6" style={{ color: 'var(--text-600)' }}>
                  Start exploring destinations and save your favorites!
                </p>
                <button
                  onClick={() => navigate("/recommendation")}
                  className="btn btn-primary btn-lg"
                >
                  Explore Destinations
                </button>
              </div>
            )}

          {!savedPlacesLoading &&
            !savedPlacesError &&
            savedPlaces.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: 'var(--surface-alt)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="card p-4 rounded-xl hover:shadow-lg transition-all duration-300 flex flex-col transform hover:-translate-y-1"
                      style={{ background: 'var(--surface)', color: 'var(--text-900)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}
                    >
                      <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="lazy"
                          onLoad={(e) => {
                            // Remove any loading overlay when image loads
                            const img = e.target as HTMLImageElement;
                            img.style.opacity = '1';
                          }}
                          onError={(e) => {
                            // Fallback to contextual image if backend image fails
                            const img = e.target as HTMLImageElement;
                            const placeName = place.name.toLowerCase();

                            if (placeName.includes('kandy')) {
                              img.src = "https://images.unsplash.com/photo-1513326738677-b964603b136d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                            } else if (placeName.includes('galle') || placeName.includes('coast')) {
                              img.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                            } else if (placeName.includes('ella') || placeName.includes('nuwara') || placeName.includes('mountain')) {
                              img.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                            } else if (placeName.includes('colombo')) {
                              img.src = "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                            } else {
                              img.src = "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                            }
                          }}
                          style={{ opacity: '0.8' }}
                        />
                        {/* Optional: Add a subtle loading indicator */}
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" style={{
                          zIndex: -1,
                          background: 'var(--surface-alt)'
                        }}></div>
                      </div>
                      <h4 className="font-bold text-xl mb-4" style={{ color: 'var(--text-900)' }}>{place.name}</h4>
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => {
                            navigate(`/saved-destination/${place.id}`);
                          }}
                          className="btn btn-primary btn-md flex-1"
                        >
                          View Details
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              // Optimistic update - remove from UI immediately
                              const updatedPlaces = savedPlaces.filter(p => p.id !== place.id);
                              setSavedPlaces(updatedPlaces);

                              // Also adjust current page if needed
                              const newTotalPages = Math.ceil(updatedPlaces.length / placesPerPage);
                              if (currentPage > newTotalPages && newTotalPages > 0) {
                                setCurrentPage(newTotalPages);
                              }

                              // Make API call in background
                              await authAPI.unsavePlace(place.name);
                            } catch (error) {
                              console.error('Failed to remove saved place:', error);
                              // On error, reload the saved places to restore correct state
                              loadSavedPlaces(false);
                            }
                          }}
                          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
                          style={{
                            background: '#06B6D4',
                            color: 'white',
                            border: 'none'
                          }}
                          title="Remove from saved places"
                        >
                          <FiBookmark className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 mb-10">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className="w-3 h-3 rounded-full transition-colors"
                        style={{
                          background: currentPage === index + 1
                            ? 'var(--primary-600)'
                            : 'var(--border)'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-lg mt-6 flex items-center gap-2"
          >
            <FiLogOut /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
