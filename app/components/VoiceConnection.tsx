'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

interface VoiceConnectionProps {
  onStartConnection?: () => Promise<void>;
  onStopConnection?: () => void;
  connectionState?: string;
  isProcessing?: boolean;
  isRetrying?: boolean;
  onError?: (error: string) => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: (error: string) => void;
}

export interface VoiceConnectionRef {
  setConnected: () => void;
  setConnectionError: (error: string) => void;
  stopConnection: () => void;
}

type ConnectionState = 'idle' | 'requesting-permission' | 'connecting' | 'connected' | 'stopping' | 'error';

const VoiceConnection = forwardRef<VoiceConnectionRef, VoiceConnectionProps>(({ 
  onStartConnection, 
  onStopConnection, 
  connectionState = 'disconnected',
  isProcessing = false,
  isRetrying = false,
  onError,
  onPermissionGranted,
  onPermissionDenied
}, ref) => {
  const [state, setState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // Check if we already have microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'granted') {
          setHasPermission(true);
        }
      } catch {
        console.log('[VoiceConnection] Permissions API not supported');
      }
    };
    checkPermission();
  }, []);

  // Update internal state based on external connection state
  useEffect(() => {
    if (connectionState === 'connected') {
      setState('connected');
    } else if (connectionState === 'connecting') {
      setState('connecting');
    } else if (connectionState === 'disconnected' || connectionState === 'closed') {
      setState('idle');
    }
  }, [connectionState]);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      setState('requesting-permission');
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported by this browser');
        setState('error');
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      onPermissionGranted?.();
      return true;
    } catch (err: unknown) {
      console.error('[VoiceConnection] Microphone permission denied:', err);
      setErrorMessage('Microphone permission denied');
      setState('error');
      const message = err instanceof Error ? err.message : 'Permission denied';
      onPermissionDenied?.(message);
      onError?.(message);
      return false;
    }
  };

  const handleStart = async () => {
    try {
      setErrorMessage('');
      
      // Request permission if we don't have it
      if (!hasPermission) {
        const granted = await requestMicrophonePermission();
        if (!granted) return;
      }
      
      setState('connecting');
      
      // Call the external connection handler
      if (onStartConnection) {
        await onStartConnection();
      }
    } catch (err: unknown) {
      console.error('[VoiceConnection] Failed to start:', err);
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setErrorMessage(message);
      setState('error');
      onError?.(message);
    }
  };

  const handleStop = useCallback(() => {
    setState('stopping');
    onStopConnection?.();
  }, [onStopConnection]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setConnected: () => {
      setState('connected');
    },
    setConnectionError: (error: string) => {
      setErrorMessage(error);
      setState('error');
      onError?.(error);
    },
    stopConnection: () => {
      handleStop();
    }
  }), [handleStop, onError]);

  const getButtonText = () => {
    if (isRetrying) return 'Reconnecting...';
    if (state === 'requesting-permission') return 'Requesting Permission...';
    if (state === 'connecting') return 'Connecting...';
    if (state === 'connected') return 'Stop Recording';
    if (state === 'stopping') return 'Stopping...';
    if (state === 'error') return 'Try Again';
    return 'Start Recording';
  };

  const isButtonDisabled = () => {
    return isRetrying || state === 'requesting-permission' || state === 'connecting' || state === 'stopping';
  };

  const showPulseAnimation = () => {
    return state === 'connected' || isProcessing || isRetrying;
  };

  const getButtonClasses = () => {
    const baseClasses = "relative px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 transform min-h-[44px]";
    
    if (isButtonDisabled()) {
      return `${baseClasses} glass-subtle text-white/60 cursor-not-allowed`;
    }
    
    if (state === 'connected') {
      return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg hover:shadow-red-500/25`;
    }
    
    if (state === 'error') {
      return `${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:scale-105 shadow-lg hover:shadow-yellow-500/25`;
    }
    
    return `${baseClasses} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-blue-500/25`;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={state === 'connected' ? handleStop : handleStart}
        disabled={isButtonDisabled()}
        className={`${getButtonClasses()} ${showPulseAnimation() ? 'animate-pulse-glow' : ''}`}
      >
        <div className="flex items-center space-x-2">
          {state === 'connected' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
          <span className="hidden sm:inline">{getButtonText()}</span>
          <span className="sm:hidden">{state === 'connected' ? 'Stop' : 'Record'}</span>
        </div>
        
        {showPulseAnimation() && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
        )}
      </button>
      
      {errorMessage && (
        <div className="glass-subtle px-3 py-1 rounded-lg animate-scale-in ml-2">
          <p className="text-red-300 text-xs font-medium flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">{errorMessage}</span>
            <span className="sm:hidden">Error</span>
          </p>
        </div>
      )}
    </div>
  );
});

VoiceConnection.displayName = 'VoiceConnection';

export default VoiceConnection;
