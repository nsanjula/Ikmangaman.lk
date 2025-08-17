import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI, setGlobalTimeoutHandler, UserProfile } from "../lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userProfile: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  handleAuthError: (error: Error) => void;
  isTimeout: boolean;
  clearTimeout: () => void;
  refreshUserProfile: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      // Validate token by making a test API call
      console.log("Token found, validating...");

      // Make a simple authenticated API call to validate token
      fetch('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${existingToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then(async response => {
        if (response.ok) {
          console.log("Token is valid, setting authenticated state");
          setToken(existingToken);
          // Fetch user profile data
          try {
            const profile = await authAPI.getUserProfile();
            setUserProfile(profile);
          } catch (profileError) {
            console.log("Failed to fetch user profile:", profileError);
          }
        } else {
          console.log("Token is invalid, removing and staying logged out");
          authAPI.removeToken();
          setToken(null);
        }
      })
      .catch(error => {
        console.log("Token validation failed, removing token:", error.message);
        authAPI.removeToken();
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      console.log("No token found, user not authenticated");
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    authAPI.storeToken(newToken);
    setToken(newToken);
    // Fetch user profile after login (async)
    authAPI.getUserProfile()
      .then(profile => {
        setUserProfile(profile);
      })
      .catch(profileError => {
        console.log("Failed to fetch user profile after login:", profileError);
      });
  };

  const logout = () => {
    authAPI.removeToken();
    setToken(null);
    setUserProfile(null);
    setIsTimeout(false);
  };

  const handleAuthError = (error: Error) => {
    console.log('🔐 Authentication error detected:', error.message);

    // Check if it's a timeout error (including database timeouts)
    const isTimeoutError = error.message.includes('timeout') ||
                          error.message.includes('Request timeout') ||
                          error.message.includes('network timeout') ||
                          error.message.includes('database timeout') ||
                          error.message.includes('connection timeout') ||
                          error.message.includes('server timeout') ||
                          error.message.includes('query timeout') ||
                          error.message.includes('Database connection') ||
                          error.message.includes('503') ||
                          error.message.includes('502') ||
                          error.message.includes('504');

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

  const refreshUserProfile = async () => {
    if (token) {
      try {
        const profile = await authAPI.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.log("Failed to refresh user profile:", error);
      }
    }
  };

  // Set up global timeout handler
  useEffect(() => {
    setGlobalTimeoutHandler(handleAuthError);
  }, []);

  const isAuthenticated = !!token;

  const value: AuthContextType = {
    isAuthenticated,
    token,
    userProfile,
    login,
    logout,
    loading,
    handleAuthError,
    isTimeout,
    clearTimeout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
