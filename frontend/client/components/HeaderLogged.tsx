import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiUser } from "react-icons/fi";

export default function HeaderLogged() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const placeholderName = "User"; // Placeholder name for showcase

  const handleLogout = () => {
    logout();
    navigate("/");
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
              className="text-gray-700 hover:text-cyan-600 font-medium"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-cyan-600 font-medium"
            >
              Future Improvements
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <div
              onClick={() => navigate("/profile")}
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
          <a
            href="#"
            className="block text-gray-700 hover:text-cyan-600 font-medium"
          >
            About Us
          </a>
          <a
            href="#"
            className="block text-gray-700 hover:text-cyan-600 font-medium"
          >
            Future Improvements
          </a>
          <div className="flex items-center space-x-4 mt-4">
            <div
              onClick={() => navigate("/profile")}
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
      </div>
    </header>
  );
}
