import React, { useState } from "react";
import {
  FiServer,
  FiTerminal,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";

interface StartBackendGuideProps {
  className?: string;
}

const StartBackendGuide: React.FC<StartBackendGuideProps> = ({
  className = "",
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "unknown" | "running" | "offline"
  >("unknown");

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("http://localhost:8000/docs", {
        method: "HEAD",
        mode: "no-cors", // This allows the request even if CORS isn't set up
      });
      setBackendStatus("running");
    } catch (error) {
      setBackendStatus("offline");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className={`bg-orange-50 border-2 border-orange-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <FiServer className="w-8 h-8 text-orange-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-bold text-orange-800">
              Backend Server Required
            </h2>
            <button
              onClick={checkBackendStatus}
              disabled={isChecking}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-200 hover:bg-orange-300 text-orange-800 rounded transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`}
              />
              Check Status
            </button>
            {backendStatus !== "unknown" && (
              <div className="flex items-center gap-1">
                {backendStatus === "running" ? (
                  <>
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Running
                    </span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      Offline
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-orange-700 mb-4">
            The FastAPI backend server is not running. Please start it to use
            the travel planning features.
          </p>

          <div className="space-y-4">
            {/* Quick Start */}
            <div className="bg-orange-100 border border-orange-200 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <FiTerminal className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Quick Start Command:
                </span>
              </div>
              <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                cd backend && python -m uvicorn main:app --reload --host 0.0.0.0
                --port 8000
              </div>
            </div>

            {/* Step by Step */}
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">
                Step-by-Step Instructions:
              </h3>
              <ol className="space-y-2 text-sm text-orange-700">
                <li className="flex items-start gap-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </span>
                  <div>
                    <strong>Open Terminal:</strong> Open a new terminal/command
                    prompt window
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </span>
                  <div>
                    <strong>Navigate to Backend:</strong> Run{" "}
                    <code className="bg-orange-200 px-1 rounded">
                      cd backend
                    </code>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </span>
                  <div>
                    <strong>Install Dependencies (if needed):</strong> Run{" "}
                    <code className="bg-orange-200 px-1 rounded">
                      pip install -r requirements.txt
                    </code>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </span>
                  <div>
                    <strong>Start Server:</strong> Run{" "}
                    <code className="bg-orange-200 px-1 rounded">
                      python -m uvicorn main:app --reload --host 0.0.0.0 --port
                      8000
                    </code>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    5
                  </span>
                  <div>
                    <strong>Verify:</strong> Check that you see "Uvicorn running
                    on http://0.0.0.0:8000" in the terminal
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-orange-200 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    6
                  </span>
                  <div>
                    <strong>Refresh Page:</strong> Come back to this page and
                    refresh or click "Check Status"
                  </div>
                </li>
              </ol>
            </div>

            {/* Alternative Methods */}
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">
                Alternative Commands:
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-orange-700">
                    Using Python directly:
                  </span>
                  <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-xs mt-1">
                    cd backend && python main.py
                  </div>
                </div>
                <div>
                  <span className="font-medium text-orange-700">
                    Using specific Python version:
                  </span>
                  <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-xs mt-1">
                    cd backend && python3 -m uvicorn main:app --reload --port
                    8000
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Troubleshooting:
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>
                  • <strong>Port already in use:</strong> Change port to 8001 or
                  kill existing process
                </li>
                <li>
                  • <strong>Python not found:</strong> Make sure Python 3.8+ is
                  installed
                </li>
                <li>
                  • <strong>Module not found:</strong> Run{" "}
                  <code>pip install fastapi uvicorn</code>
                </li>
                <li>
                  • <strong>Permission denied:</strong> Try running as
                  administrator/sudo
                </li>
              </ul>
            </div>

            {/* Once Running */}
            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <h4 className="font-semibold text-green-800 mb-2">
                Once Backend is Running:
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>
                  • The API will be available at{" "}
                  <strong>http://localhost:8000</strong>
                </li>
                <li>
                  • API documentation at{" "}
                  <strong>http://localhost:8000/docs</strong>
                </li>
                <li>
                  • This travel app will automatically connect and work properly
                </li>
                <li>• Keep the terminal window open while using the app</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-200">
            <p className="text-xs text-orange-600">
              💡 <strong>Need help?</strong> Check the{" "}
              <code>backend/README.md</code> file for more detailed setup
              instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartBackendGuide;
