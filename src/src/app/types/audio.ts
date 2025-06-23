// Audio data and event types for voice assistant

export type AudioFormat = 'pcm16' | 'wav' | 'opus';

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface AudioStreamEvent {
  type: 'start' | 'data' | 'stop' | 'error';
  chunk?: AudioChunk;
  error?: string;
} 