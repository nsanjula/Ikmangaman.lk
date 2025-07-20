import { useState, useEffect } from "react";
import { testConnection, debugAPIConnection } from "../lib/api";

const BackendStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      const connected = await testConnection();
      setIsConnected(connected);
      setIsChecking(false);
    };

    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
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
