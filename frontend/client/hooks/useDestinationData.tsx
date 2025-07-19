import { useState, useEffect } from "react";
import { authAPI, DestinationDetails } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface UseDestinationDataResult {
  data: DestinationDetails | null;
  loading: boolean;
  error: string | null;
  isFallbackData: boolean;
  retry: () => void;
}

export const useDestinationData = (
  destinationId: string | undefined,
): UseDestinationDataResult => {
  const [data, setData] = useState<DestinationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isAuthenticated, logout } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFallbackData(false);

      // Check authentication status first
      if (!isAuthenticated) {
        throw new Error("Please log in to view destination details.");
      }

      // Double-check token validity
      const token = authAPI.getToken();
      if (!token) {
        console.log("🔐 No token found, triggering logout");
        logout();
        throw new Error("Please log in to view destination details.");
      }

      const result = await authAPI.getDestinationDetails(
        parseInt(destinationId!),
      );
      setData(result);

      // Check if this is fallback data
      if (
        result.description?.includes(
          "temporarily limited due to service maintenance",
        )
      ) {
        setIsFallbackData(true);
      }
    } catch (err) {
      console.error("useDestinationData error:", err);

      // If it's an auth error, ensure we logout to sync state
      if (
        err instanceof Error &&
        err.message.includes("Authentication failed")
      ) {
        console.log("🔐 Authentication failed - ensuring logout");
        logout();
      }

      if (err instanceof Error) {
        // Handle authentication errors specifically
        if (
          err.message.includes("Authentication failed") ||
          err.message.includes("Authentication required")
        ) {
          // Check if token exists but is invalid
          const token = authAPI.getToken();
          if (token) {
            console.log(
              "Token exists but authentication failed - token may be expired",
            );
            setError(
              "Your session has expired. Please log in again to view destination details.",
            );
          } else {
            setError("Please log in to view destination details.");
          }
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to fetch destination data");
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setRetryCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (!destinationId) return;
    fetchData();
  }, [destinationId, isAuthenticated, retryCount]);

  return {
    data,
    loading,
    error,
    isFallbackData,
    retry,
  };
};
