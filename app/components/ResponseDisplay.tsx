'use client';
import React from 'react';

interface ResponseDisplayProps {
  response: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  return (
    <div>
      <h3>AI Response:</h3>
      <div>{response}</div>
    </div>
  );
};

export default ResponseDisplay; 