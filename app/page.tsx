'use client';
import React, { useState, useRef } from 'react';
import VoiceConnection, { VoiceConnectionRef } from './components/VoiceConnection';
import ErrorDisplay from './components/ErrorDisplay';
import ConnectionStatus from './components/ConnectionStatus';
import { useWebRTC } from './hooks/useWebRTC';

export default function Home() {
  const [response, setResponse] = useState('');
  const voiceConnectionRef = useRef<VoiceConnectionRef>(null);
  
  const {
    connectionState,
    error: webrtcError,
    aiResponse,
    isProcessing,
    startConnection,
    stopConnection,
    sendMessage,
  } = useWebRTC({
    onSessionUpdate: (event) => {
      // Optionally handle session.update confirmation
    },
    onError: (err) => {
      // Handle WebRTC errors by notifying the VoiceConnection component
      console.log('[Home] WebRTC error:', err);
      if (voiceConnectionRef.current) {
        voiceConnectionRef.current.setConnectionError(err);
      }
    },
  });

  // Connection state helpers
  const isConnecting = connectionState === 'connecting' || connectionState === 'new';
  const isConnected = connectionState === 'connected';
  const isDisconnected = connectionState === 'disconnected' || connectionState === 'closed' || connectionState === 'failed';

  const handleVoiceStart = async () => {
    try {
      await startConnection();
      // Notify VoiceConnection when connection is successful
      if (voiceConnectionRef.current) {
        voiceConnectionRef.current.setConnected();
      }
    } catch (err: any) {
      console.error('[Home] Failed to start connection:', err);
      if (voiceConnectionRef.current) {
        voiceConnectionRef.current.setConnectionError(err.message || 'Connection failed');
      }
    }
  };

  const handleVoiceStop = () => {
    stopConnection();
  };

  const handleConnectionSuccess = () => {
    console.log('[Home] Connection success callback called');
  };

  const handleConnectionError = (error: string) => {
    console.log('[Home] Connection error callback called:', error);
  };

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>GPT-4o Voice Assistant</h1>
      
      <ConnectionStatus 
        connectionState={connectionState}
        isRecording={isConnected}
        isProcessing={isProcessing}
        hasResponse={!!aiResponse}
      />
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <VoiceConnection
          ref={voiceConnectionRef}
          onStart={handleVoiceStart}
          onStop={handleVoiceStop}
          onConnectionSuccess={handleConnectionSuccess}
          onConnectionFailed={handleConnectionError}
          onError={(error) => console.error('[Home] VoiceConnection error:', error)}
        />
      </div>
      
      <ErrorDisplay error={webrtcError || ''} />
      
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
            {isProcessing ? 'AI is thinking...' : 
             isConnected ? 'Connected and listening. Start speaking!' :
             'Click "Start Recording" to begin your conversation with the AI.'}
          </div>
        )}
      </div>
    </main>
  );
}
