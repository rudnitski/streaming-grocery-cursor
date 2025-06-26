'use client';
import React from 'react';

interface ConnectionStatusProps {
  connectionState: string;
  isRecording?: boolean;
  isProcessing?: boolean;
  hasResponse?: boolean;
}

export default function ConnectionStatus({ 
  connectionState, 
  isRecording = false, 
  isProcessing = false,
  hasResponse = false 
}: ConnectionStatusProps) {
  const getStatusInfo = () => {
    switch (connectionState) {
      case 'new':
        return { 
          icon: (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Ready to Connect', 
          bgClass: 'bg-gray-500/20 border-gray-500/30',
          textClass: 'text-gray-300',
          description: 'Click "Start Recording" to begin'
        };
      case 'connecting':
        return { 
          icon: (
            <svg className="w-5 h-5 text-orange-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          text: 'Connecting...', 
          bgClass: 'bg-orange-500/20 border-orange-500/30',
          textClass: 'text-orange-300',
          description: 'Establishing connection to OpenAI'
        };
      case 'connected':
        return { 
          icon: (
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Connected', 
          bgClass: 'bg-green-500/20 border-green-500/30',
          textClass: 'text-green-300',
          description: 'Ready for voice interaction'
        };
      case 'disconnected':
      case 'closed':
        return { 
          icon: (
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Disconnected', 
          bgClass: 'bg-red-500/20 border-red-500/30',
          textClass: 'text-red-300',
          description: 'Connection lost'
        };
      case 'failed':
        return { 
          icon: (
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Connection Failed', 
          bgClass: 'bg-red-500/20 border-red-500/30',
          textClass: 'text-red-300',
          description: 'Unable to establish connection'
        };
      default:
        return { 
          icon: (
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Unknown Status', 
          bgClass: 'bg-gray-500/20 border-gray-500/30',
          textClass: 'text-gray-300',
          description: 'Status unknown'
        };
    }
  };

  const getActivityInfo = () => {
    if (isProcessing) {
      return {
        icon: (
          <svg className="w-4 h-4 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: 'Processing...',
        bgClass: 'bg-blue-500/20 border-blue-500/30',
        textClass: 'text-blue-300'
      };
    }
    
    if (isRecording) {
      return {
        icon: (
          <svg className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        ),
        text: 'Recording',
        bgClass: 'bg-red-500/20 border-red-500/30',
        textClass: 'text-red-300'
      };
    }
    
    if (hasResponse) {
      return {
        icon: (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        ),
        text: 'Response Received',
        bgClass: 'bg-green-500/20 border-green-500/30',
        textClass: 'text-green-300'
      };
    }
    
    return null;
  };

  const statusInfo = getStatusInfo();
  const activityInfo = getActivityInfo();

  return (
    <div className="glass-subtle p-4 rounded-lg space-y-3 animate-scale-in">
      {/* Connection Status */}
      <div className="flex items-center space-x-3">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.bgClass} ${statusInfo.textClass}`}>
          <div className="mr-2">
            {statusInfo.icon}
          </div>
          {statusInfo.text}
        </div>
      </div>
      
      {/* Activity Status */}
      {activityInfo && (
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${activityInfo.bgClass} ${activityInfo.textClass}`}>
            <div className="mr-2">
              {activityInfo.icon}
            </div>
            {activityInfo.text}
          </div>
        </div>
      )}
      
      {/* Description */}
      <p className="text-white/60 text-sm">
        {statusInfo.description}
      </p>
      
      {/* Connection Quality Indicator */}
      {connectionState === 'connected' && (
        <div className="flex items-center space-x-2">
          <span className="text-white/40 text-xs">Signal:</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-full transition-all duration-300 ${
                  bar <= 3 
                    ? 'bg-green-400 h-3' 
                    : 'bg-white/20 h-2'
                }`}
                style={{ animationDelay: `${bar * 0.1}s` }}
              />
            ))}
          </div>
          <span className="text-green-300 text-xs font-medium">Strong</span>
        </div>
      )}
    </div>
  );
}
