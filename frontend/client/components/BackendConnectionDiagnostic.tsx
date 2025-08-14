import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiCheck, FiX, FiClock } from 'react-icons/fi';

interface ConnectionTest {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'failed' | 'timeout';
  responseTime?: number;
  error?: string;
}

const BackendConnectionDiagnostic: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [tests, setTests] = useState<ConnectionTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    { endpoint: '/docs', method: 'HEAD', description: 'API Documentation' },
    { endpoint: '/starting-locations', method: 'GET', description: 'Starting Locations' },
    { endpoint: '/questionnaire', method: 'HEAD', description: 'Questionnaire Endpoint' },
  ];

  const runConnectivityTests = async () => {
    setIsRunning(true);
    const testResults: ConnectionTest[] = [];

    for (const { endpoint, method } of endpoints) {
      const test: ConnectionTest = {
        endpoint,
        method,
        status: 'pending'
      };

      try {
        const startTime = Date.now();

        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`http://localhost:8000${endpoint}`, {
          method,
          headers: method === 'GET' ? { 'Content-Type': 'application/json' } : {},
          signal: controller.signal,
          mode: 'cors'
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        test.responseTime = responseTime;
        test.status = response.ok ? 'success' : 'failed';
        test.error = response.ok ? undefined : `HTTP ${response.status}`;

      } catch (error: any) {
        if (error.name === 'AbortError') {
          test.status = 'timeout';
          test.error = 'Request timeout (>10s)';
        } else {
          test.status = 'failed';
          test.error = 'Network connection failed';
        }
      }

      testResults.push(test);
      setTests([...testResults]); // Update UI after each test
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'pending':
        return <FiRefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <FiX className="w-4 h-4 text-red-500" />;
      case 'timeout':
        return <FiClock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'timeout':
        return 'text-orange-600 bg-orange-50';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Backend Connection Diagnostic"
        >
          <FiWifi className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FiWifi className="w-5 h-5" />
          Backend Diagnostic
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={runConnectivityTests}
            disabled={isRunning}
            className="btn btn-primary btn-sm flex-1 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">Test Results:</h4>
            {tests.map((test, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium text-sm">
                      {test.method} {test.endpoint}
                    </span>
                  </div>
                  {test.responseTime && (
                    <span className="text-xs text-gray-500">
                      {test.responseTime}ms
                    </span>
                  )}
                </div>
                {test.error && (
                  <p className="text-xs mt-1 text-gray-600">{test.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p><strong>Backend URL:</strong> http://localhost:8000</p>
          <p><strong>Timeout:</strong> 20 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default BackendConnectionDiagnostic;
