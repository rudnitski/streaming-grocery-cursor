'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface VoiceConnectionProps {
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: string) => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: (error: string) => void;
  onConnectionSuccess?: () => void;
  onConnectionFailed?: (error: string) => void;
}

export interface VoiceConnectionRef {
  setConnected: () => void;
  setConnectionError: (error: string) => void;
}

type ConnectionState = 'idle' | 'requesting-permission' | 'connecting' | 'connected' | 'stopping' | 'error';

const VoiceConnection = forwardRef<VoiceConnectionRef, VoiceConnectionProps>(({ 
  onStart, 
  onStop, 
  onError,
  onPermissionGranted,
  onPermissionDenied,
  onConnectionSuccess,
  onConnectionFailed
}, ref) => {
  const [state, setState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if we already have microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'granted') {
          setHasPermission(true);
        }
      } catch (err) {
        // Permissions API not supported, we'll check when user clicks
        console.log('[VoiceConnection] Permissions API not supported');
      }
    };
    checkPermission();
  }, []);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      setState('requesting-permission');
      setErrorMessage('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      onPermissionGranted?.();
      return true;
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Microphone permission denied. Please allow microphone access and try again.'
        : `Microphone access failed: ${err.message}`;
      
      setErrorMessage(errorMsg);
      setState('error');
      onPermissionDenied?.(errorMsg);
      onError?.(errorMsg);
      
      // Return to idle state after showing error
      setTimeout(() => {
        setState('idle');
        setErrorMessage('');
      }, 3000);
      
      return false;
    }
  };

  const handleStart = async () => {
    try {
      // Step 1: Request microphone permission if not already granted
      if (!hasPermission) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          return; // Error handling already done in requestMicrophonePermission
        }
      }

      // Step 2: Start connecting
      setState('connecting');
      onStart?.();
      
      // Simulate connection success (this will be handled by parent component)
      // The parent will call our success/failure callbacks
      
    } catch (err: any) {
      const errorMsg = `Connection failed: ${err.message}`;
      setErrorMessage(errorMsg);
      setState('error');
      onConnectionFailed?.(errorMsg);
      onError?.(errorMsg);
      
      // Return to idle state after showing error
      setTimeout(() => {
        setState('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleStop = () => {
    setState('stopping');
    
    // Clean up media recorder and stream
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    onStop?.();
    setState('idle');
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setConnected: () => {
      if (state !== 'connected') {
        setState('connected');
        onConnectionSuccess?.();
      }
    },
    setConnectionError: (error: string) => {
      if (state !== 'error') {
        setErrorMessage(error);
        setState('error');
        onConnectionFailed?.(error);
        onError?.(error);
        
        // Return to idle state after showing error
        setTimeout(() => {
          setState('idle');
          setErrorMessage('');
        }, 3000);
      }
    }
  }), [state, onConnectionSuccess, onConnectionFailed, onError]);

  const getButtonText = () => {
    switch (state) {
      case 'requesting-permission':
        return 'Requesting Permission...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Stop Recording';
      case 'stopping':
        return 'Stopping...';
      case 'error':
        return 'Error - Try Again';
      default:
        return 'Start Recording';
    }
  };

  const getButtonColor = () => {
    switch (state) {
      case 'requesting-permission':
        return '#ff9500'; // Orange
      case 'connecting':
        return '#007aff'; // Blue
      case 'connected':
        return '#ff3b30'; // Red for stop
      case 'stopping':
        return '#ff9500'; // Orange
      case 'error':
        return '#ff3b30'; // Red
      default:
        return '#34c759'; // Green for start
    }
  };

  const isButtonDisabled = () => {
    return ['requesting-permission', 'connecting', 'stopping'].includes(state);
  };

  const showPulseAnimation = () => {
    return state === 'connected';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={state === 'connected' ? handleStop : handleStart}
        disabled={isButtonDisabled()}
        style={{
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '600',
          backgroundColor: getButtonColor(),
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: isButtonDisabled() ? 'not-allowed' : 'pointer',
          opacity: isButtonDisabled() ? 0.7 : 1,
          transition: 'all 0.3s ease',
          minWidth: '200px',
          position: 'relative',
          animation: showPulseAnimation() ? 'pulse 2s infinite' : 'none',
        }}
      >
        {getButtonText()}
      </button>
      
      {errorMessage && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '8px',
          color: '#cc0000',
          fontSize: '14px'
        }}>
          {errorMessage}
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 59, 48, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
          }
        }
      `}</style>
    </div>
  );
});

VoiceConnection.displayName = 'VoiceConnection';

export default VoiceConnection;
