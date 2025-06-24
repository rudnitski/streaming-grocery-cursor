'use client';
import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import ResponseDisplay from './components/ResponseDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useWebRTC } from './hooks/useWebRTC';

export default function Home() {
  const { recording, audioBlob, error: audioError, start, stop } = useAudioRecorder();
  const [response, setResponse] = useState('');
  const {
    connectionState,
    error: webrtcError,
    aiResponse,
    startConnection,
    sendMessage,
  } = useWebRTC({
    onSessionUpdate: (event) => {
      // Optionally handle session.update confirmation
    },
    onError: (err) => {
      // Optionally handle errors
    },
  });

  // Loading indicator for connection
  const isConnecting = connectionState === 'connecting' || connectionState === 'new';
  const isConnected = connectionState === 'connected';
  const isDisconnected = connectionState === 'disconnected' || connectionState === 'closed' || connectionState === 'failed';
  const isLoadingResponse = isConnected && !aiResponse;

  // Placeholder: In the future, send audioBlob to backend and update response

  return (
    <main>
      <h1>Hello world</h1>
      <button onClick={startConnection} disabled={isConnecting || isConnected}>
        {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Start WebRTC Connection'}
      </button>
      <div>
        Connection state: <b>{connectionState}</b>
        {isConnecting && <span style={{ marginLeft: 8 }}>🔄 Connecting...</span>}
        {isConnected && <span style={{ marginLeft: 8, color: 'green' }}>🟢 Connected</span>}
        {isDisconnected && <span style={{ marginLeft: 8, color: 'red' }}>🔴 Disconnected</span>}
      </div>
      <ErrorDisplay error={audioError || webrtcError || ''} />
      <VoiceRecorder
        onStart={() => {
          start();
          startConnection(); // Start WebRTC connection when recording starts
        }}
        onStop={(blob) => {
          stop();
          // Placeholder: setResponse('AI response will appear here');
        }}
        onError={() => {}}
      />
      <div>
        <b>AI Response:</b>
        {isLoadingResponse && <span style={{ marginLeft: 8 }}>⏳ Waiting for response...</span>}
        <div>{aiResponse}</div>
      </div>
      <ResponseDisplay response={response} />
      {/* Placeholder: Add UI to send messages over the data channel if needed */}
    </main>
  );
}
