'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  return (
    <div style={{ color: 'red' }}>
      <strong>Error:</strong> {error}
    </div>
  );
};

export default ErrorDisplay; 