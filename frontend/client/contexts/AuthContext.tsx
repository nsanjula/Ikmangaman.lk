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

      // Validate token and fetch user profile in background
      authAPI.getUserProfile()
        .then(profile => {
          console.log("Token validation successful, user profile loaded");
          setUserProfile(profile);
        })
        .catch(error => {
          console.log("Token validation/profile fetch failed:", error.message);

          // Check if it's an authentication error (401 or explicit auth failure)
          const isAuthError = error.message.includes('Authentication required') ||
                             error.message.includes('Authentication failed') ||
                             error.message.includes('Please log in again') ||
                             error.message.includes('401') ||
                             error.message.includes('Unauthorized');

          if (isAuthError) {
            // Only logout on explicit auth failures
            console.log("Authentication failed, removing invalid token");
            authAPI.removeToken();
            setToken(null);
            setUserProfile(null);
          } else {
            // For network errors or other issues, keep user logged in
            console.log("Non-auth error occurred, keeping user logged in");
          }
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
        console.log("��� User profile loaded after login");
        setUserProfile(profile);
      })
      .catch(profileError => {
        console.log("❌ Failed to fetch user profile after login:", profileError);
        // Don't logout here - just log the error. User is still authenticated.
        // The profile will be retried on next app refresh
      });
  };

  const logout = () => {
    authAPI.removeToken();
    setToken(null);
    setUserProfile(null);
    setIsTimeout(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('chatbot_intro_shown');
        sessionStorage.removeItem('chatbot_intro_seen_session');
        sessionStorage.removeItem('chatbot_intro_dismissed_session');
      } catch (_) {}
    }
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
        console.log("🔄 Refreshing user profile...");
        const profile = await authAPI.getUserProfile();
        setUserProfile(profile);
        console.log("✅ User profile refreshed successfully");
      } catch (error: any) {
        console.log("❌ Failed to refresh user profile:", error.message);

        // Only logout on authentication errors
        const isAuthError = error.message.includes('Authentication required') ||
                           error.message.includes('Authentication failed') ||
                           error.message.includes('Please log in again') ||
                           error.message.includes('401') ||
                           error.message.includes('Unauthorized');

        if (isAuthError) {
          console.log("🚨 Authentication error during profile refresh - logging out");
          handleAuthError(error);
        }
        // For other errors, just log but don't logout
      }
    }
  };

  const isAuthenticated = !!token;

  // Set up global timeout handler
  useEffect(() => {
    setGlobalTimeoutHandler(handleAuthError);

    // Add debug helper to window for troubleshooting
    if (typeof window !== 'undefined') {
      (window as any).debugAuth = () => {
        const currentToken = authAPI.getToken();
        console.log('🔍 Auth Debug Info:');
        console.log('- isAuthenticated:', isAuthenticated);
        console.log('- token in state:', token ? `${token.substring(0, 20)}...` : 'null');
        console.log('- token in localStorage:', currentToken ? `${currentToken.substring(0, 20)}...` : 'null');
        console.log('- userProfile:', userProfile);
        console.log('- loading:', loading);
        console.log('- isTimeout:', isTimeout);
        return {
          isAuthenticated,
          hasToken: !!token,
          hasLocalStorageToken: !!currentToken,
          userProfile,
          loading,
          isTimeout
        };
      };
    }
  }, [isAuthenticated, token, userProfile, loading, isTimeout]);

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
