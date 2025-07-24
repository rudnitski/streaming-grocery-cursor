import { useState, useCallback, useEffect } from 'react';

export type DebugLogLevel = 'audio' | 'function' | 'json' | 'items' | 'error';

export interface DebugLogEntry {
  id: string;
  timestamp: Date;
  level: DebugLogLevel;
  message: string;
  data?: unknown;
}

export const useDebugLogger = () => {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state after hydration
  useEffect(() => {
    setIsClient(true);
    const enabled = localStorage.getItem('debug-logger-enabled') === 'true';
    setIsEnabled(enabled);
  }, []);

  const log = useCallback((level: DebugLogLevel, message: string, data?: unknown) => {
    console.log('[DebugLogger] Attempting to log:', { level, message, isEnabled, isClient });
    if (!isEnabled || !isClient) return;

    const entry: DebugLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      data
    };

    console.log('[DebugLogger] Adding log entry:', entry);
    setLogs(prev => [...prev, entry]);
  }, [isEnabled, isClient]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    return JSON.stringify(logs, null, 2);
  }, [logs]);

  const toggleEnabled = useCallback(() => {
    if (!isClient) return;
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem('debug-logger-enabled', newEnabled.toString());
    if (!newEnabled) {
      clearLogs();
    } else {
      // Add initial log when debug is enabled
      const entry: DebugLogEntry = {
        id: `${Date.now()}-init`,
        timestamp: new Date(),
        level: 'audio',
        message: 'Debug logging enabled - ready to capture voice interactions',
      };
      setLogs([entry]);
    }
  }, [isEnabled, clearLogs, isClient]);

  return {
    logs,
    isEnabled: isClient && isEnabled,
    log,
    clearLogs,
    exportLogs,
    toggleEnabled
  };
};