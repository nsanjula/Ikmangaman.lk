import React, { useState } from "react";

const OfflineNotice: React.FC = () => {
  const [showNotice, setShowNotice] = useState(false); // Don't show by default

  // Since the app works fine with fallback data, don't show the notice unless manually triggered
  if (!showNotice) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 border-b border-amber-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800">
          <span className="text-lg">🔄</span>
          <span className="text-sm font-medium">
            Demo Mode: Backend server offline. App running with sample data.
          </span>
        </div>
        <button
          onClick={() => setShowNotice(false)}
          className="text-amber-600 hover:text-amber-800 text-sm font-medium px-2 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default OfflineNotice;
