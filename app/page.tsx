'use client';
import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import ResponseDisplay from './components/ResponseDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import { useAudioRecorder } from './hooks/useAudioRecorder';

export default function Home() {
  const { recording, audioBlob, error, start, stop } = useAudioRecorder();
  const [response, setResponse] = useState('');

  // Placeholder: In the future, send audioBlob to backend and update response

  return (
    <main>
      <h1>Hello world</h1>
      <VoiceRecorder
        onStart={start}
        onStop={(blob) => {
          stop();
          // Placeholder: setResponse('AI response will appear here');
        }}
        onError={() => {}}
      />
      <ResponseDisplay response={response} />
      <ErrorDisplay error={error} />
    </main>
  );
}
