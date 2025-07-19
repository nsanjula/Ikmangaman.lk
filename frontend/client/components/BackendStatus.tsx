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
    return (
      <div className="backend-status checking bg-yellow-500 text-white px-4 py-2 text-sm">
        Checking backend connection...
      </div>
    );
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

  return (
    <div className="backend-status connected bg-green-500 text-white px-4 py-2 text-sm flex items-center justify-between">
      <span>✅ Backend connected</span>
      <button
        onClick={() => debugAPIConnection()}
        className="ml-4 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
      >
        Debug
      </button>
    </div>
  );
};

export default BackendStatus;
