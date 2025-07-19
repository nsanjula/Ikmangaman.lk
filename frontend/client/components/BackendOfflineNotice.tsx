import React from "react";
import StartBackendGuide from "./StartBackendGuide";

interface BackendOfflineNoticeProps {
  error: string;
}

const BackendOfflineNotice: React.FC<BackendOfflineNoticeProps> = ({
  error,
}) => {
  const isBackendOffline = error.includes("Backend server is not running");

  if (!isBackendOffline) {
    return (
      <div className="bg-red-100 border border-red-300 p-6 rounded-lg">
        <p className="text-red-700 font-medium">Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return <StartBackendGuide />;
};

export default BackendOfflineNotice;
