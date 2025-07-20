import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiSave,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  authAPI,
  UserProfile,
  UserUpdateRequest,
  DestinationDetails,
} from "../lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
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
    Array<{ id: number; name: string; description: string; image: string }>
  >([]);
  const [savedPlacesLoading, setSavedPlacesLoading] = useState(false);
  const [savedPlacesError, setSavedPlacesError] = useState<string | null>(null);

  const placesPerPage = 3;
  const totalPages = Math.ceil(savedPlaces.length / placesPerPage);
  const currentPlaces = savedPlaces.slice(
    (currentPage - 1) * placesPerPage,
    currentPage * placesPerPage,
  );

  // Load saved places data using random destination IDs
  const loadSavedPlaces = async () => {
    try {
      setSavedPlacesLoading(true);
      setSavedPlacesError(null);

      // Use 6 random destination IDs for saved places
      const randomDestinationIds = [1, 2, 3, 4, 5, 6];
      const savedPlacesData = [];

      for (const destinationId of randomDestinationIds) {
        try {
          const destinationData =
            await authAPI.getDestinationDetails(destinationId);
          savedPlacesData.push({
            id: destinationData.destination_id,
            name: destinationData.destination_name,
            description: destinationData.description,
            image: destinationData["destiantion image"]
              ? `http://localhost:8000${destinationData["destiantion image"]}`
              : "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          });
        } catch (error) {
          console.warn(`Failed to load destination ${destinationId}:`, error);
          // Continue with other destinations even if one fails
        }
      }

      setSavedPlaces(savedPlacesData);
    } catch (error) {
      console.error("Failed to load saved places:", error);
      setSavedPlacesError(
        error instanceof Error ? error.message : "Failed to load saved places",
      );
    } finally {
      setSavedPlacesLoading(false);
    }
  };

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await authAPI.getUserProfile();
        setOriginalData(profile);
        setUserData({
          firstName: profile.firstname,
          lastName: profile.lastname || "",
          birthday: profile.date_0f_birth, // Note: backend has typo in field name
          username: profile.username,
          password: "********",
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile",
        );
        if (
          error instanceof Error &&
          error.message.includes("Authentication required")
        ) {
          logout();
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadSavedPlaces();
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
    logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="bg-cyan-700 text-white min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyan-700 text-white min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-red-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center text-cyan-700 text-4xl shadow-lg">
            <FiUser size={48} />
            <button
              onClick={() => setEditMode(!editMode)}
              className="absolute bottom-1 right-1 bg-cyan-500 p-2 rounded-full cursor-pointer hover:bg-cyan-600 transition-colors"
            >
              <FiEdit size={16} />
            </button>
          </div>
          <h2 className="text-3xl mt-4 font-bold">
            Hi, {userData.firstName || "User"}!{" "}
            <span className="text-cyan-300">✌️</span>
          </h2>
        </div>

        {/* Editable Info Form */}
        <div className="bg-cyan-600 rounded-xl p-6 w-full max-w-md mx-auto mb-12 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>

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
                <label className="block text-sm font-medium mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={type}
                    value={userData[field as keyof typeof userData]}
                    placeholder={placeholder}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full p-3 rounded bg-white text-cyan-800 pr-10 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    disabled={!editMode || disabled}
                  />
                  {editMode && !disabled && (
                    <FiEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600" />
                  )}
                </div>
              </div>
            ),
          )}

          {editMode && (
            <button
              onClick={handleSave}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded mt-4 font-semibold shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
        </div>

        {/* Your Saved Places */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Your Saved Places</h3>
            {savedPlaces.length > placesPerPage && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 bg-cyan-600 rounded hover:bg-cyan-500 disabled:opacity-50 transition-colors"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 bg-cyan-600 rounded hover:bg-cyan-500 disabled:opacity-50 transition-colors"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {savedPlacesLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading your saved places...</p>
            </div>
          )}

          {savedPlacesError && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              <p className="font-medium">Error loading saved places</p>
              <p className="text-sm mt-1">{savedPlacesError}</p>
              <button
                onClick={loadSavedPlaces}
                className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!savedPlacesLoading &&
            !savedPlacesError &&
            savedPlaces.length === 0 && (
              <div className="text-center py-8">
                <p className="text-lg mb-4">No saved places yet</p>
                <p className="text-gray-300 mb-4">
                  Start exploring destinations and save your favorites!
                </p>
                <a
                  href="/recommendations"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Explore Destinations
                </a>
              </div>
            )}

          {!savedPlacesLoading &&
            !savedPlacesError &&
            savedPlaces.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="bg-sky-300 text-cyan-900 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <div className="h-48 rounded-lg mb-4 overflow-hidden">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default image if image fails
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                      <h4 className="font-bold text-xl mb-2">{place.name}</h4>
                      <p className="text-gray-700 mb-4 text-sm leading-relaxed flex-grow">
                        {place.description}
                      </p>
                      <button
                        onClick={() => {
                          /* Dummy button - no action */
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition-colors mt-auto"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 mb-10">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-3 h-3 rounded-full ${currentPage === index + 1 ? "bg-white" : "bg-gray-400"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="mt-6 bg-cyan-800 hover:bg-cyan-900 px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
          >
            <FiLogOut /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
