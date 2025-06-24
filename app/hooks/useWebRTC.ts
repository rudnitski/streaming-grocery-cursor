import { useEffect, useRef, useState } from 'react';

interface UseWebRTCOptions {
  onSessionUpdate?: (event: any) => void;
  onError?: (error: string) => void;
  onMessage?: (msg: any) => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
  console.log('[WebRTC] useWebRTC hook mounted');
  const [connectionState, setConnectionState] = useState<string>('new');
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAIResponse] = useState<string>('');
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Call this to start the connection
  const startConnection = async () => {
    try {
      console.log('[WebRTC] Creating RTCPeerConnection');
      const pc = new RTCPeerConnection();
      peerRef.current = pc;

      console.log('[WebRTC] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[WebRTC] Microphone access granted, adding audio track', stream.getAudioTracks());
      stream.getAudioTracks().forEach(track => pc.addTrack(track, stream));

      console.log('[WebRTC] Creating data channel');
      const dataChannel = pc.createDataChannel('realtime-channel');
      dataChannelRef.current = dataChannel;

      // Set up event listeners
      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state changed:', pc.connectionState);
        setConnectionState(pc.connectionState);
      };
      dataChannel.onopen = () => {
        console.log('[WebRTC] Data channel open');
        // Send session.update event when data channel is open
        const sessionUpdate = {
          type: 'session.update',
          session: {
            voice: 'alloy',
            instructions: 'You are a helpful AI assistant.',
            input_audio_format: 'pcm16',
            turn_detection: { type: 'server_vad' },
          },
        };
        dataChannel.send(JSON.stringify(sessionUpdate));
        options.onSessionUpdate && options.onSessionUpdate(sessionUpdate);
      };
      dataChannel.onerror = (e) => {
        console.error('[WebRTC] Data channel error', e);
        setError('Data channel error');
        options.onError && options.onError('Data channel error');
      };
      dataChannel.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('[WebRTC] Data channel message:', msg);
          // Handle different event types from OpenAI
          if (msg.type === 'response.text.delta' && msg.delta) {
            setAIResponse((prev) => prev + msg.delta);
          } else if (msg.type === 'response.text.done') {
            setAIResponse((prev) => prev + '\n');
          } else if (msg.type === 'response.audio_transcript.delta' && msg.delta) {
            setAIResponse((prev) => prev + msg.delta);
          } else if (msg.type === 'session.error' && msg.error) {
            setError(msg.error.message || 'Session error');
          } else if (msg.type === 'response.created' && msg.response && msg.response.text) {
            setAIResponse((prev) => prev + msg.response.text);
          } else if (msg.type === 'response.done' && msg.response && msg.response.text) {
            setAIResponse((prev) => prev + msg.response.text + '\n');
          }
          options.onMessage && options.onMessage(msg);
        } catch (e) {
          console.warn('[WebRTC] Non-JSON or unexpected data channel message', event.data);
        }
      };

      console.log('[WebRTC] Creating offer');
      const offer = await pc.createOffer();
      console.log('[WebRTC] Offer created:', offer);
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] Local SDP offer created and set');

      // Send offer to backend and get answer
      console.log('[WebRTC] Sending offer to backend', offer.sdp);
      const res = await fetch('/api/webrtc/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer: offer.sdp }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('[WebRTC] Failed to get answer from backend:', errText);
        throw new Error('Failed to get answer from backend');
      }
      const { answer } = await res.json();
      console.log('[WebRTC] Received SDP answer from backend', answer);
      await pc.setRemoteDescription({ type: 'answer', sdp: answer });
      console.log('[WebRTC] Remote SDP answer set');
    } catch (err: any) {
      console.error('[WebRTC] Connection error:', err);
      setError(err.message || 'WebRTC connection failed');
      options.onError && options.onError(err.message || 'WebRTC connection failed');
    }
  };

  // Function to send a message over the data channel
  const sendMessage = (msg: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      console.log('[WebRTC] Sending message over data channel', msg);
      dataChannelRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('[WebRTC] Tried to send message but data channel not open', msg);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[WebRTC] Cleaning up peer/data channel');
      peerRef.current?.close();
      dataChannelRef.current?.close();
    };
  }, []);

  return {
    connectionState,
    error,
    aiResponse,
    startConnection,
    sendMessage,
  };
} 