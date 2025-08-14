import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  handleAuthError: (error: Error) => void;
  isTimeout: boolean;
  clearTimeout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    // Check for existing token on app initialization
    const existingToken = authAPI.getToken();
    console.log(
      "Auth initialization - existing token:",
      existingToken ? "exists" : "none",
    );

    if (existingToken) {
      // For now, trust the token exists and set it without validation
      // Token validation will happen when making actual API calls
      console.log("Token found, setting authenticated state");
      setToken(existingToken);
    } else {
      console.log("No token found, user not authenticated");
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    authAPI.storeToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    authAPI.removeToken();
    setToken(null);
    setIsTimeout(false);
  };

  const handleAuthError = (error: Error) => {
    console.log('🔐 Authentication error detected:', error.message);

    // Check if it's a timeout error
    const isTimeoutError = error.message.includes('timeout') ||
                          error.message.includes('Request timeout') ||
                          error.message.includes('network timeout');

    // Check if it's an authentication-related error
    if (error.message.includes('Authentication required') ||
        error.message.includes('Please log in again') ||
        error.message.includes('401') ||
        error.message.includes('Authentication failed') ||
        isTimeoutError) {

      console.log('🚨 Auto-logout due to authentication error');

      // Set timeout flag if this was a timeout error
      if (isTimeoutError) {
        setIsTimeout(true);
      }

      logout();

      // Use React navigation instead of window.location to avoid loading issues
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          console.log('🔄 Redirecting to login page due to auth error');
          // Check if we're in a React Router context
          try {
            // Try to use React Router navigation first
            const currentPath = window.location.pathname;
            window.history.pushState(null, '', '/login');

            // Dispatch a popstate event to trigger React Router navigation
            window.dispatchEvent(new PopStateEvent('popstate'));
          } catch (e) {
            // Fallback to window.location as last resort
            window.location.href = '/login';
          }
        }
      }, 500); // Reduced delay for better UX
    }
  };

  const clearTimeout = () => {
    setIsTimeout(false);
  };

  const isAuthenticated = !!token;

  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
    handleAuthError,
    isTimeout,
    clearTimeout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
