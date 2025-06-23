// WebRTC signaling and session state types for voice assistant

export type SignalType = 'offer' | 'answer' | 'candidate';

export interface WebRTCSignal {
  type: SignalType;
  sdp?: string;
  candidate?: RTCIceCandidateInit;
}

export interface WebRTCSessionState {
  connectionState: RTCPeerConnectionState;
  signalingState: RTCSignalingState;
  iceConnectionState: RTCIceConnectionState;
  error?: string;
} 