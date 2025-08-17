import React, { useState, useEffect } from "react";
import { FiServer, FiTerminal, FiCopy, FiCheck } from "react-icons/fi";

const BackendStartupBanner: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "offline" | "online"
  >("checking");
  const [showBanner, setShowBanner] = useState(false);
  const [commandCopied, setCommandCopied] = useState(false);

  const hostedBackendUrl = "https://ikmangamanlk-production.up.railway.app";

  const checkBackend = async () => {
    // Create an AbortController for timeout
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout;

    try {
      timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch("https://ikmangamanlk-production.up.railway.app/docs", {
        method: "HEAD",
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendStatus("online");
        setShowBanner(false);
      } else {
        setBackendStatus("offline");
        setShowBanner(true);
      }
    } catch (error: any) {
      // Clear the timeout if it's still active
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Silently handle all connection errors including AbortError
      // This is expected when the backend is not running
      setBackendStatus("offline");
      setShowBanner(true);
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(hostedBackendUrl);
      setCommandCopied(true);
      setTimeout(() => setCommandCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = hostedBackendUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCommandCopied(true);
      setTimeout(() => setCommandCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Add small delay to avoid immediate fetch on page load
    const initialTimeout = setTimeout(() => {
      checkBackend();
    }, 1000);

    // Check backend status periodically
    const interval = setInterval(() => {
      // Only check if currently offline to reduce unnecessary requests
      if (backendStatus === "offline" || backendStatus === "checking") {
        checkBackend();
      }
    }, 30000); // Check every 30 seconds when offline

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [backendStatus]);

  if (!showBanner || backendStatus === "online") {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiServer className="w-5 h-5" />
            <div>
              <div className="font-semibold">Backend Connection Issue</div>
              <div className="text-sm text-red-100">
                Unable to connect to hosted backend. Please check if the server is running.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-black bg-opacity-30 px-3 py-1 rounded">
              <FiTerminal className="w-4 h-4" />
              <code className="text-sm font-mono">{hostedBackendUrl}</code>
              <button
                onClick={copyCommand}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Copy URL"
              >
                {commandCopied ? (
                  <FiCheck className="w-3 h-3 text-green-300" />
                ) : (
                  <FiCopy className="w-3 h-3" />
                )}
              </button>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Mobile URL display */}
        <div className="md:hidden mt-2 bg-black bg-opacity-30 p-2 rounded">
          <div className="flex items-center justify-between">
            <code className="text-xs font-mono break-all">{hostedBackendUrl}</code>
            <button
              onClick={copyCommand}
              className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
              title="Copy URL"
            >
              {commandCopied ? (
                <FiCheck className="w-3 h-3 text-green-300" />
              ) : (
                <FiCopy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStartupBanner;
