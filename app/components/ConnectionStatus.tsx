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
          icon: '⚪', 
          text: 'Not Connected', 
          color: '#666',
          description: 'Click "Start Recording" to begin'
        };
      case 'connecting':
        return { 
          icon: '🔄', 
          text: 'Connecting...', 
          color: '#ff9500',
          description: 'Establishing connection to OpenAI'
        };
      case 'connected':
        return { 
          icon: '🟢', 
          text: 'Connected', 
          color: '#34c759',
          description: 'Ready for voice interaction'
        };
      case 'disconnected':
      case 'closed':
        return { 
          icon: '🔴', 
          text: 'Disconnected', 
          color: '#ff3b30',
          description: 'Connection lost'
        };
      case 'failed':
        return { 
          icon: '❌', 
          text: 'Connection Failed', 
          color: '#ff3b30',
          description: 'Unable to connect to OpenAI'
        };
      default:
        return { 
          icon: '❓', 
          text: connectionState, 
          color: '#666',
          description: ''
        };
    }
  };

  const status = getStatusInfo();

  const getActivityStatus = () => {
    if (isRecording) {
      return { icon: '🎤', text: 'Recording...', color: '#ff3b30' };
    }
    if (isProcessing) {
      return { icon: '⏳', text: 'Processing...', color: '#ff9500' };
    }
    if (hasResponse) {
      return { icon: '✅', text: 'Response Received', color: '#34c759' };
    }
    return null;
  };

  const activity = getActivityStatus();

  return (
    <div style={{ 
      padding: '16px', 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px', 
      backgroundColor: '#f9f9f9',
      marginBottom: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '8px' 
      }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>
          {status.icon}
        </span>
        <span style={{ 
          fontWeight: 'bold', 
          color: status.color,
          marginRight: '12px'
        }}>
          {status.text}
        </span>
        {activity && (
          <>
            <span style={{ fontSize: '16px', marginRight: '6px' }}>
              {activity.icon}
            </span>
            <span style={{ 
              fontSize: '14px', 
              color: activity.color,
              fontWeight: '500'
            }}>
              {activity.text}
            </span>
          </>
        )}
      </div>
      
      {status.description && (
        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          marginLeft: '28px'
        }}>
          {status.description}
        </div>
      )}

      {/* Connection progress indicator */}
      {connectionState === 'connecting' && (
        <div style={{ 
          marginTop: '8px',
          marginLeft: '28px'
        }}>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#e0e0e0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #ff9500 0%, #ff9500 50%, transparent 50%, transparent 100%)',
              backgroundSize: '20px 100%',
              animation: 'progress 1s linear infinite'
            }} />
          </div>
          <style jsx>{`
            @keyframes progress {
              0% { background-position: -20px 0; }
              100% { background-position: 20px 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
