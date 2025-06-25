'use client';
import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import ResponseDisplay from './components/ResponseDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import ConnectionStatus from './components/ConnectionStatus';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useWebRTC } from './hooks/useWebRTC';

export default function Home() {
  const { recording, audioBlob, error: audioError, start, stop } = useAudioRecorder();
  const [response, setResponse] = useState('');
  const {
    connectionState,
    error: webrtcError,
    aiResponse,
    isProcessing,
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
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>GPT-4o Voice Assistant</h1>
      
      <ConnectionStatus 
        connectionState={connectionState}
        isRecording={recording}
        isProcessing={isProcessing}
        hasResponse={!!aiResponse}
      />
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startConnection} 
          disabled={isConnecting || isConnected}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isConnected ? '#34c759' : isConnecting ? '#ff9500' : '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isConnecting || isConnected ? 'not-allowed' : 'pointer',
            opacity: isConnecting || isConnected ? 0.7 : 1
          }}
        >
          {isConnecting ? 'Connecting...' : isConnected ? '✓ Connected' : 'Start WebRTC Connection'}
        </button>
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
      
      <div style={{ 
        marginTop: '20px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>AI Response:</h3>
        {aiResponse ? (
          <div style={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            color: '#333'
          }}>
            {aiResponse}
          </div>
        ) : (
          <div style={{ 
            color: '#666',
            fontStyle: 'italic'
          }}>
            {isProcessing ? 'AI is thinking...' : 'No response yet. Start recording to interact with the AI.'}
          </div>
        )}
      </div>
      
      <ResponseDisplay response={response} />
      {/* Placeholder: Add UI to send messages over the data channel if needed */}
    </main>
  );
}
