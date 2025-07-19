import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
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
  };

  const isAuthenticated = !!token;

  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
