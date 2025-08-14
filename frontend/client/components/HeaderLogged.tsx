import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";
import { authAPI, UserProfile } from "../lib/api";

export default function HeaderLogged() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await authAPI.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to load user profile for header:", error);
        // If profile fails to load, we'll use fallback
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get the first letter for profile display
  const getProfileLetter = () => {
    if (userProfile?.firstname) {
      return userProfile.firstname.charAt(0).toUpperCase();
    }
    return "U"; // Fallback
  };

  return (
    <header className="bg-white shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-cyan-900">Ikmangaman.lk</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/aboutus"
              className="font-medium transition-colors duration-150"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-600)')}
            >
              About Us
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <div
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition font-bold text-sm"
              style={{
                background: 'var(--primary-600)',
                color: 'white',
                border: '2px solid var(--surface)',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Profile"
            >
              {profileLoading ? <FiUser size={16} /> : getProfileLetter()}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-white bg-cyan-600 hover:bg-cyan-700 border-cyan-600 hover:border-cyan-700"
            >
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
          <Link
            to="/aboutus"
            className="font-medium transition-colors duration-150"
            style={{ color: 'var(--text-600)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-600)')}
          >
            About Us
          </Link>

          <div className="flex items-center space-x-4 mt-4">
            <div
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition font-bold text-sm"
              style={{
                background: 'var(--primary-600)',
                color: 'white',
                border: '2px solid var(--surface)',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Profile"
            >
              {profileLoading ? <FiUser size={16} /> : getProfileLetter()}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-white bg-cyan-600 hover:bg-cyan-700 border-cyan-600 hover:border-cyan-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
