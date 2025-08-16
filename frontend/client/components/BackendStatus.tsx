import { useState, useEffect } from "react";
import { testConnection, debugAPIConnection } from "../lib/api";

const BackendStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsChecking(true);
        const connected = await testConnection();
        setIsConnected(connected);
      } catch (error) {
        // Silently handle errors
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Add small delay to avoid immediate fetch on page load
    const initialTimeout = setTimeout(() => {
      checkConnection();
    }, 3000);

    // Check less frequently (every 60 seconds) to reduce spam
    const interval = setInterval(checkConnection, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (isChecking) {
    return null; // Don't show anything while checking
  }

  if (!isConnected) {
    return (
      <div className="backend-status error bg-red-500 text-white px-4 py-2 text-sm">
        ⚠️ Backend server not reachable at localhost:8000.
        <br />
        Please start the FastAPI backend server.
      </div>
    );
  }

  // Don't show anything when backend is connected successfully
  return null;
};

export default BackendStatus;
