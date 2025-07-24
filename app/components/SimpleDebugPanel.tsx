'use client';

import React, { useState, useEffect } from 'react';

interface DebugLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  data?: unknown;
}

// Global debug logs array
let globalLogs: DebugLog[] = [];
let logListeners: Array<(logs: DebugLog[]) => void> = [];

// Global debug function
export const addDebugLog = (level: string, message: string, data?: unknown) => {
  if (typeof window === 'undefined') return; // Server-side guard
  
  const isEnabled = localStorage.getItem('simple-debug-enabled') === 'true';
  if (!isEnabled) return;
  
  const log: DebugLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    data
  };
  
  globalLogs.push(log);
  if (globalLogs.length > 50) {
    globalLogs = globalLogs.slice(-50); // Keep only last 50 logs
  }
  
  // Notify all listeners
  logListeners.forEach(listener => listener([...globalLogs]));
  
  console.log(`[SimpleDebug] ${level.toUpperCase()}: ${message}`, data || '');
};

export const SimpleDebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if enabled
    const enabled = localStorage.getItem('simple-debug-enabled') === 'true';
    setIsEnabled(enabled);
    
    if (enabled) {
      setLogs([...globalLogs]);
    }
    
    // Listen for new logs
    const listener = (newLogs: DebugLog[]) => {
      setLogs([...newLogs]);
    };
    
    logListeners.push(listener);
    
    // Cleanup
    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  }, []);

  const toggleEnabled = () => {
    if (!mounted) return;
    
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem('simple-debug-enabled', newEnabled.toString());
    
    if (newEnabled) {
      // Add initial log
      addDebugLog('info', 'Simple debug logging enabled');
    } else {
      // Clear logs
      globalLogs = [];
      setLogs([]);
    }
  };

  const clearLogs = () => {
    globalLogs = [];
    setLogs([]);
  };

  const copyLogs = async () => {
    const text = logs.map(log => 
      `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}${log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      alert('Logs copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  };

  if (!mounted) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'audio': return 'text-blue-600 bg-blue-50';
      case 'function': return 'text-purple-600 bg-purple-50';
      case 'json': return 'text-green-600 bg-green-50';
      case 'items': return 'text-orange-600 bg-orange-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleEnabled}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-full text-sm shadow-lg"
        >
          🐛 Enable Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <div className="bg-white border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Simple Debug</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
              {logs.length} logs
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              {isExpanded ? '▼' : '▲'}
            </button>
            <button
              onClick={toggleEnabled}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ✕
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-2">
            <div className="flex gap-2 mb-2">
              <button
                onClick={clearLogs}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                Clear
              </button>
              <button
                onClick={copyLogs}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Copy All
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No debug logs yet.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className={`p-2 rounded text-xs border-l-2 ${getLevelColor(log.level)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium">[{log.level.toUpperCase()}]</span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                      <span className="text-gray-500 text-xs ml-2">{log.timestamp}</span>
                    </div>
                    {log.data != null && (
                      <details className="mt-1">
                        <summary className="text-blue-500 cursor-pointer text-xs">Show data</summary>
                        <pre className="mt-1 p-1 bg-gray-100 rounded text-xs overflow-auto max-h-20">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};