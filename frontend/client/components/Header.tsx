import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import SearchBar from "./SearchBar";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, userProfile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show search bar only on recommendation and search results pages (not destination details)
  const showSearchBar = location.pathname === '/recommendation' ||
    (location.pathname.startsWith('/search') && !location.pathname.includes('/destination/'));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    // Clear create itinerary visit flag when navigating away
    if (location.pathname === '/create-itinerary' && path !== '/create-itinerary') {
      sessionStorage.removeItem('has_visited_create_itinerary');
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear temporary questionnaire data when logging out
    sessionStorage.removeItem('tempQuestionnaireData');
    sessionStorage.removeItem('has_visited_create_itinerary');
    localStorage.removeItem('create_itinerary_state');
    localStorage.removeItem('create_itinerary_questionnaire_saved');
    console.log('Cleared temporary questionnaire data - logging out');
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm relative z-50 iframe-header border-b border-border">
      <div className="container iframe-container">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/recommendation" className="text-2xl font-bold" style={{ color: 'var(--primary-700)' }}>
              Ikmangaman.lk
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {showSearchBar && (
              <SearchBar className="w-80" />
            )}
            <Link
              to="/how-it-works"
              className="font-medium transition-colors duration-150 whitespace-nowrap"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-600)')}
            >
              How it Works
            </Link>
            <Link
              to="/aboutus"
              className="font-medium transition-colors duration-150 whitespace-nowrap"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-600)')}
            >
              About Us
            </Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // Logged in state
              <>
                <div
                  onClick={() => {
                    // Clear temporary questionnaire data when navigating to profile
                    sessionStorage.removeItem('tempQuestionnaireData');
                    sessionStorage.removeItem('has_visited_create_itinerary');
                    console.log('Cleared temporary questionnaire data - navigating to profile');
                    handleNavigation("/profile");
                  }}
                  className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:bg-cyan-700 transition border-2 border-white ring-2 ring-cyan-200"
                  title="Profile"
                >
                  {userProfile?.firstname ? userProfile.firstname.charAt(0).toUpperCase() : 'U'}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-white bg-cyan-600 hover:bg-cyan-700 border-cyan-600 hover:border-cyan-700"
                >
                  Log out
                </Button>
              </>
            ) : (
              // Logged out state
              <>
                <Button
                  onClick={() => handleNavigation("/login")}
                  variant="outline"
                  className="btn btn-secondry btn-md"
                >
                  Log in
                </Button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="btn btn-primary btn-md"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Auth Section - Right side of logo */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated ? (
              // Mobile logged in state
              <>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-white bg-cyan-600 hover:bg-cyan-700 border-cyan-600 hover:border-cyan-700 text-xs p-1 h-8 mr-2"
                >
                  Log out
                </Button>
                <div
                  onClick={() => {
                    // Clear temporary questionnaire data when navigating to profile
                    sessionStorage.removeItem('tempQuestionnaireData');
                    sessionStorage.removeItem('has_visited_create_itinerary');
                    console.log('Cleared temporary questionnaire data - navigating to profile');
                    handleNavigation("/profile");
                  }}
                  className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:bg-cyan-700 transition border-2 border-white ring-2 ring-cyan-200"
                  title="Profile"
                >
                  {userProfile?.firstname ? userProfile.firstname.charAt(0).toUpperCase() : 'U'}
                </div>
              </>
            ) : (
              // Mobile logged out state - Fixed buttons
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleNavigation("/login")}
                  variant="outline"
                  size="sm"
                  className="btn btn-secondry btn-md"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => handleNavigation("/register")}
                  size="sm"
                  className="btn btn-primary btn-md"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Below the header row */}
        {showSearchBar && (
          <div className="md:hidden pb-4">
            <SearchBar className="w-full" />
          </div>
        )}
      </div>
    </header>
  );
}
