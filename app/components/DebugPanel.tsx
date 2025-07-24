'use client';

import React, { useState, useEffect } from 'react';
import { useDebugLoggerContext } from '../contexts/DebugLoggerContext';
import type { DebugLogEntry } from '../hooks/useDebugLogger';

const getLevelColor = (level: string) => {
  switch (level) {
    case 'audio': return 'text-blue-600';
    case 'function': return 'text-purple-600';
    case 'json': return 'text-green-600';
    case 'items': return 'text-orange-600';
    case 'error': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

const getLevelBg = (level: string) => {
  switch (level) {
    case 'audio': return 'bg-blue-50';
    case 'function': return 'bg-purple-50';
    case 'json': return 'bg-green-50';
    case 'items': return 'bg-orange-50';
    case 'error': return 'bg-red-50';
    default: return 'bg-gray-50';
  }
};

const LogEntry: React.FC<{ entry: DebugLogEntry }> = ({ entry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`p-2 rounded text-xs border-l-2 ${getLevelBg(entry.level)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <span className={`font-medium ${getLevelColor(entry.level)}`}>
            [{entry.level.toUpperCase()}]
          </span>
          <span className="ml-2 text-gray-700">{entry.message}</span>
        </div>
        <span className="text-gray-500 text-xs ml-2">
          {entry.timestamp.toLocaleTimeString()}
        </span>
      </div>
      
      {entry.data && (
        <div className="mt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-700 text-xs underline"
          >
            {isExpanded ? 'Hide' : 'Show'} data
          </button>
          {isExpanded && (
            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export const DebugPanel: React.FC = () => {
  const { logs, isEnabled, clearLogs, exportLogs, toggleEnabled } = useDebugLoggerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debug: log what we're getting from the hook
  useEffect(() => {
    console.log('[DebugPanel] Render - logs:', logs, 'isEnabled:', isEnabled);
  }, [logs, isEnabled]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportLogs());
      alert('Debug logs copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy logs:', err);
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
            <span className="text-sm font-medium">Debug Logger</span>
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
                onClick={copyToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Copy All
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No debug logs yet. Start using the app to see logs here.
                </div>
              ) : (
                logs.map(entry => <LogEntry key={entry.id} entry={entry} />)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};