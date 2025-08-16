import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiUser } from "react-icons/fi";
import SearchBar from "./SearchBar";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show search bar only on recommendation and search pages
  const showSearchBar = location.pathname === '/recommendation' || location.pathname.startsWith('/search');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear temporary questionnaire data when logging out
    sessionStorage.removeItem('tempQuestionnaireData');
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
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-700)' }}>Ikmangaman.lk</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {showSearchBar && (
              <SearchBar className="w-80" />
            )}
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
                    console.log('Cleared temporary questionnaire data - navigating to profile');
                    handleNavigation("/profile");
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-cyan-700 shadow-lg cursor-pointer hover:bg-gray-50 transition border-2 border-cyan-600 ring-2 ring-cyan-200"
                  title="Profile"
                >
                  <FiUser size={20} />
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-white bg-cyan-600 hover:bg-cyan-700 border-cyan-600 hover:border-cyan-700"
                >
                  Logout
                </Button>
              </>
            ) : (
              // Logged out state
              <>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="btn btn-tertiary"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="btn btn-primary btn-md"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              style={{ color: 'var(--text-600)' }}
            >
              {isMobileMenuOpen ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
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
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0"
            }`}
        >
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {showSearchBar && (
              <div className="px-2">
                <SearchBar className="w-full" />
              </div>
            )}
            <Link
              to="/aboutus"
              className="block font-medium transition-colors duration-150 px-2"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-600)')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            
            {isAuthenticated ? (
              // Mobile logged in state
              <div className="flex flex-col space-y-2 pt-2 px-4">
                <div className="flex items-center space-x-4">
                  <div
                    onClick={() => {
                      // Clear temporary questionnaire data when navigating to profile
                      sessionStorage.removeItem('tempQuestionnaireData');
                      console.log('Cleared temporary questionnaire data - navigating to profile');
                      handleNavigation("/profile");
                    }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-cyan-700 shadow-lg cursor-pointer hover:bg-gray-50 transition border-2 border-cyan-600 ring-2 ring-cyan-200"
                    title="Profile"
                  >
                    <FiUser size={20} />
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
            ) : (
              // Mobile logged out state
              <div className="flex flex-col space-y-2 pt-2 px-4">
                <button
                  onClick={() => handleNavigation("/login")}
                  className="btn btn-tertiary justify-start"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="btn btn-primary btn-md justify-start"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
