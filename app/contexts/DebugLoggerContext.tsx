'use client';

import React, { createContext, useContext } from 'react';
import { useDebugLogger } from '../hooks/useDebugLogger';

const DebugLoggerContext = createContext<ReturnType<typeof useDebugLogger> | null>(null);

export const DebugLoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const debugLogger = useDebugLogger();
  
  return (
    <DebugLoggerContext.Provider value={debugLogger}>
      {children}
    </DebugLoggerContext.Provider>
  );
};

export const useDebugLoggerContext = () => {
  const context = useContext(DebugLoggerContext);
  if (!context) {
    throw new Error('useDebugLoggerContext must be used within a DebugLoggerProvider');
  }
  return context;
};