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
    <header className="bg-white shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-cyan-900">Ikmangaman.lk</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-cyan-600 font-medium transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-cyan-600 font-medium transition-colors duration-200"
            >
              Future Improvements
            </a>
          </nav>

          {/* Desktop Auth Buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={() => handleNavigation("/login")}
              variant="ghost"
              className="text-gray-700 hover:text-cyan-600"
            >
              Log In
            </Button>
            <Button
              onClick={() => handleNavigation("/register")}
              className="bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-200"
            >
              Sign Up for Free
            </Button>
          </div>

          {/* Mobile Menu Button - Always visible on mobile */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className="text-gray-700 hover:text-cyan-600"
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
              className="block text-gray-700 hover:text-cyan-600 font-medium transition-colors duration-200 px-4 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:text-cyan-600 font-medium transition-colors duration-200 px-4 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Future Improvements
            </a>
            <div className="flex flex-col space-y-2 pt-2 px-4">
              <Button
                onClick={() => handleNavigation("/login")}
                variant="ghost"
                className="text-gray-700 hover:text-cyan-600 justify-start"
              >
                Log In
              </Button>
              <Button
                onClick={() => handleNavigation("/register")}
                className="bg-cyan-500 hover:bg-cyan-600 text-white justify-start transition-colors duration-200"
              >
                Sign Up for Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}