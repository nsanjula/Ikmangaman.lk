import React, { useState, useEffect } from "react";
import { FiServer, FiTerminal, FiCopy, FiCheck } from "react-icons/fi";

const BackendStartupBanner: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "offline" | "online"
  >("checking");
  const [showBanner, setShowBanner] = useState(false);
  const [commandCopied, setCommandCopied] = useState(false);

  const command =
    "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000";

  const checkBackend = async () => {
    try {
      const response = await fetch("http://localhost:8000/docs", {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      setBackendStatus("online");
      setShowBanner(false);
    } catch (error) {
      setBackendStatus("offline");
      setShowBanner(true);
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCommandCopied(true);
      setTimeout(() => setCommandCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCommandCopied(true);
      setTimeout(() => setCommandCopied(false), 2000);
    }
  };

  useEffect(() => {
    checkBackend();
    // Check every 5 seconds
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

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
              <div className="font-semibold">Backend Server Required</div>
              <div className="text-sm text-red-100">
                The FastAPI backend is not running. Start it to use all
                features.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-black bg-opacity-30 px-3 py-1 rounded">
              <FiTerminal className="w-4 h-4" />
              <code className="text-sm font-mono">{command}</code>
              <button
                onClick={copyCommand}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Copy command"
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

        {/* Mobile command display */}
        <div className="md:hidden mt-2 bg-black bg-opacity-30 p-2 rounded">
          <div className="flex items-center justify-between">
            <code className="text-xs font-mono break-all">{command}</code>
            <button
              onClick={copyCommand}
              className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
              title="Copy command"
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
