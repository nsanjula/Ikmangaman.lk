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
      // Set token immediately to avoid logout on refresh
      setToken(existingToken);
      console.log("Token found, setting authenticated state immediately");

      // Validate token in background (but don't logout if validation fails due to network issues)
      fetch('https://ikmangamanlk-production.up.railway.app/users/me', {
        headers: {
          'Authorization': `Bearer ${existingToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then(async response => {
        if (response.ok) {
          console.log("Token validation successful");
          // Fetch user profile data
          try {
            const profile = await authAPI.getUserProfile();
            setUserProfile(profile);
          } catch (profileError) {
            console.log("Failed to fetch user profile:", profileError);
          }
        } else if (response.status === 401) {
          // Only logout on explicit 401 Unauthorized
          console.log("Token is invalid (401), removing and staying logged out");
          authAPI.removeToken();
          setToken(null);
          setUserProfile(null);
        } else {
          // For other errors (network issues, server errors), keep user logged in
          console.log("Token validation failed with non-401 error, keeping user logged in");
        }
      })
      .catch(error => {
        // For network errors, keep user logged in - only actual auth errors should log out
        console.log("Token validation failed due to network/connection error, keeping user logged in:", error.message);
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

    // Check if it's a backend timeout (session expired)
    const isBackendTimeout = error.message.includes('Database timeout') ||
                            error.message.includes('session expired') ||
                            error.message.includes('token expired') ||
                            error.message.includes('session timeout');

    // Check if it's an explicit authentication failure (401 Unauthorized)
    const isAuthFailure = error.message.includes('Authentication required') ||
                         error.message.includes('Please log in again') ||
                         error.message.includes('401') ||
                         error.message.includes('Authentication failed') ||
                         error.message.includes('Unauthorized');

    // Only logout on explicit auth failures or backend session timeouts
    if (isAuthFailure || isBackendTimeout) {
      console.log('🚨 Auto-logout due to authentication error');

      // Set timeout flag if this was a timeout error
      if (isBackendTimeout) {
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
    } else {
      // For other errors (network issues, server errors), just log but don't logout
      console.log('🔵 Non-auth error detected, not logging out user:', error.message);
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
