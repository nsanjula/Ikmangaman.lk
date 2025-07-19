import React, { useState } from "react";
import { FiTerminal, FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";

interface QuickBackendFixProps {
  className?: string;
}

const QuickBackendFix: React.FC<QuickBackendFixProps> = ({
  className = "",
}) => {
  const [commandCopied, setCommandCopied] = useState(false);

  const command =
    "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000";

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

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div
      className={`bg-blue-50 border-2 border-blue-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <FiTerminal className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">Quick Fix</h3>
      </div>

      <p className="text-sm text-blue-700 mb-3">
        Copy and run this command in your terminal to start the backend:
      </p>

      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mb-3 relative">
        <div className="pr-10 break-all">{command}</div>
        <button
          onClick={copyCommand}
          className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded transition-colors"
          title="Copy command"
        >
          {commandCopied ? (
            <FiCheck className="w-4 h-4 text-green-300" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          onClick={refreshPage}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <FiRefreshCw className="w-3 h-3" />
          Refresh Page
        </button>
        <span className="text-blue-600 py-1">
          {commandCopied ? "✅ Command copied!" : "👆 Click to copy command"}
        </span>
      </div>
    </div>
  );
};

export default QuickBackendFix;
