'use client';

import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onStart?: () => void;
  onStop?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onStart, onStop, onError }) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        onStop?.(audioBlob);
      };
      mediaRecorder.start();
      setRecording(true);
      onStart?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      onError?.(message);
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <button onClick={recording ? handleStop : handleStart}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default VoiceRecorder; 