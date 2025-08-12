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
      console.log(`🔍 Checking backend connectivity at ${new Date().toISOString()}`);

      // Use Promise.race for reliable timeout without AbortController issues
      const fetchPromise = fetch("http://localhost:8000/docs", {
        method: "HEAD",
      });

      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Backend check timeout after 15 seconds'));
        }, 15000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        console.log("✅ Backend is online");
        setBackendStatus("online");
        setShowBanner(false);
      } else {
        console.warn(`⚠️ Backend responded with status: ${response.status}`);
        setBackendStatus("offline");
        setShowBanner(true);
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.message?.includes('timeout')) {
        console.warn("⏱️ Backend check timed out (>15s)");
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn("🌐 Network error - backend may not be running");
      } else {
        console.warn("❌ Backend connectivity check failed:", error);
      }

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

    // More conservative checking to avoid timeout spam
    const interval = setInterval(() => {
      // Only check if we're not currently showing the banner or if it's been dismissed
      if (backendStatus === "online") {
        checkBackend(); // Check every 30 seconds when online
      } else {
        // When offline, check less frequently to avoid timeout spam
        checkBackend(); // Check every 30 seconds even when offline
      }
    }, 30000); // Fixed 30-second interval for stability

    return () => clearInterval(interval);
  }, []); // Remove backendStatus dependency to avoid re-creating intervals

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
