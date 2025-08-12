import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
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
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="font-medium transition-colors duration-150"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-600)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-600)'}
            >
              About Us
            </a>
            <a
              href="#"
              className="font-medium transition-colors duration-150"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-600)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-600)'}
            >
              Future Improvements
            </a>
          </nav>

          {/* Desktop Auth Buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
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
          </div>

          {/* Mobile Menu Button - Always visible on mobile */}
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
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0"
          }`}
        >
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <a
              href="#"
              className="block font-medium transition-colors duration-150 px-4 py-2"
              style={{ color: 'var(--text-600)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="#"
              className="block font-medium transition-colors duration-150 px-4 py-2"
              style={{ color: 'var(--text-600)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Future Improvements
            </a>
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
          </div>
        </div>
      </div>
    </header>
  );
}
