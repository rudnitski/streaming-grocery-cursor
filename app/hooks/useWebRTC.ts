import { useEffect, useRef, useState } from 'react';
import { addDebugLog } from '../components/SimpleDebugPanel';

interface UseWebRTCOptions {
  onSessionUpdate?: (event: unknown) => void;
  onError?: (error: string) => void;
  onMessage?: (msg: unknown) => void;
  onGroceryExtraction?: (groceryData: unknown) => void;
  onTranscriptComplete?: (transcript: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  onFunctionCallStart?: () => void;
  usualGroceries?: string;
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
  console.log('[WebRTC] useWebRTC hook mounted');
  const [connectionState, setConnectionState] = useState<string>('new');
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAIResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const currentTranscriptRef = useRef<string>('');
  
  // Audio context for voice effects
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
  };
  
  // Play voice effect sound
  const playVoiceEffect = () => {
    initAudioContext();
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    // Create a simple notification sound effect
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a pleasant notification sound (C major chord)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.type = 'sine';
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Call this to start the connection
  const startConnection = async () => {
    try {
      addDebugLog('audio', 'Starting WebRTC connection');
      // Reset transcript state on new connection
      currentTranscriptRef.current = '';
      
      console.log('[WebRTC] Creating RTCPeerConnection');
      const pc = new RTCPeerConnection();
      peerRef.current = pc;

      console.log('[WebRTC] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store the stream for cleanup
      console.log('[WebRTC] Microphone access granted, adding audio track', stream.getAudioTracks());
      addDebugLog('audio', 'Audio input stream started', { audioTracks: stream.getAudioTracks().length });
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
        setIsConnected(true);
        // Create instructions with usual groceries context
        const usualGroceriesContext = options.usualGroceries 
          ? `\n\nUSER'S USUAL GROCERIES:\n${options.usualGroceries}\n\nIMPORTANT MATCHING RULE: If an item in the user's speech resembles something in the USER'S USUAL GROCERIES list, prefer using that exact name from the list instead of what you heard. For example, if user says "молоко" and the usual groceries list contains "молоко", use "молоко". If user says "milk" and the list contains "молоко", use "молоко" from the list.`
          : '';
        
        // Send session.update event when data channel is open
        const sessionUpdate = {
          type: 'session.update',
          session: {
            voice: 'alloy',
            instructions: `You are a grocery shopping assistant. When users give grocery COMMANDS or STATEMENTS, automatically extract them using the extract_groceries function. CRITICAL: Only extract items from clear commands, NOT from questions or discussions. Do NOT extract when users ask questions like "do we need milk?" or "should I get bread?" - only extract from statements like "I need milk" or "add bread". Always preserve the exact language the user spoke the items in - if they say "молоко" keep it as "молоко", if they say "milk" keep it as "milk". Extract items with their quantities and measurements. Listen for commands like "I need 2 liters of milk", "мне нужно 500 грамм муки", "add 5 apples", "remove bread", etc. Ignore questions and discussions about groceries. Be conversational and helpful.${usualGroceriesContext}`,
            input_audio_format: 'pcm16',
            turn_detection: { type: 'server_vad' },
            tools: [
              {
                type: 'function',
                name: 'extract_groceries',
                description: 'Extract grocery items and quantities from user speech in real-time. Call this function ONLY when grocery items are mentioned in COMMANDS or STATEMENTS, NOT in questions or discussions. Do NOT call this function for questions like "do we need milk?", "should I get bread?", or choice questions like "milk or juice?". Only call for clear commands like "I need milk", "add bread", "get some apples". CRITICAL: If an item resembles something in the USER\'S USUAL GROCERIES list, prefer using that exact name from the list.',
                parameters: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          item: {
                            type: 'string',
                            description: 'The grocery item name in singular form. PRIORITY: If the spoken item resembles something in USER\'S USUAL GROCERIES list, use that exact name from the list. Otherwise, use the exact language the user spoke (e.g., if user says "молоко" keep it as "молоко", if user says "milk" keep it as "milk")'
                          },
                          quantity: {
                            type: 'number',
                            description: 'The quantity as a number'
                          },
                          action: {
                            type: 'string',
                            enum: ['add', 'remove', 'modify'],
                            description: 'The action to perform with this item'
                          },
                          measurement: {
                            type: 'object',
                            properties: {
                              value: {
                                type: 'number',
                                description: 'The measurement value'
                              },
                              unit: {
                                type: 'string',
                                description: 'The measurement unit (kg, g, L, mL, pieces, etc.)'
                              }
                            },
                            required: ['value', 'unit']
                          }
                        },
                        required: ['item', 'quantity', 'action']
                      }
                    }
                  },
                  required: ['items']
                }
              }
            ],
            tool_choice: 'auto'
          },
        };
        dataChannel.send(JSON.stringify(sessionUpdate));
        options.onSessionUpdate?.(sessionUpdate);
      };
      dataChannel.onerror = (e) => {
        console.error('[WebRTC] Data channel error', e);
        setError('Data channel error');
        options.onError?.('Data channel error');
      };
      dataChannel.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('[WebRTC] Data channel message:', msg.type, msg);
          
          // Add detailed logging for response events
          if (msg.type === 'response.done' || msg.type === 'response.created') {
            console.log('[WebRTC] Response event details:', JSON.stringify(msg, null, 2));
          }
          
          // Log all function call related messages
          if (msg.type.includes('function_call')) {
            console.log('[WebRTC] Function call message:', JSON.stringify(msg, null, 2));
          }
          
          // Handle different event types from OpenAI
          if (msg.type === 'response.text.delta' && msg.delta) {
            setAIResponse((prev) => prev + msg.delta);
          } else if (msg.type === 'response.text.done') {
            setAIResponse((prev) => prev + '\n');
          } else if (msg.type === 'response.audio_transcript.delta' && msg.delta) {
            setAIResponse((prev) => prev + msg.delta);
          } else if (msg.type === 'response.function_call_arguments.delta' && msg.delta) {
            // Handle function call arguments streaming (not used in current implementation)
            console.log('[WebRTC] Function call arguments delta:', msg.delta);
          } else if (msg.type === 'response.output_item.added' && msg.item?.type === 'function_call') {
            // Handle function call start - reset accumulator
            console.log('[WebRTC] Function call started:', msg.item.name);
            if (msg.item.name === 'extract_groceries') {
              addDebugLog('function', 'Grocery extraction function called', { functionName: msg.item.name });
              // Play voice effect when grocery extraction starts
              playVoiceEffect();
              // Call the callback if provided
              if (options.onFunctionCallStart) {
                options.onFunctionCallStart();
              }
            }
          } else if (msg.type === 'response.output_item.done' && msg.item?.type === 'function_call') {
            // Handle completed function call with final arguments
            console.log('[WebRTC] Function call item done:', msg.item.name, 'Arguments:', msg.item.arguments);
            if (msg.item.name === 'extract_groceries' && msg.item.arguments) {
              try {
                // Ensure the JSON string is complete before parsing
                const argsString = msg.item.arguments.trim();
                addDebugLog('json', 'Raw JSON response received', argsString);
                
                if (!argsString.startsWith('{') || !argsString.endsWith('}')) {
                  console.warn('[WebRTC] Incomplete JSON arguments, skipping parse:', argsString);
                  addDebugLog('error', 'Incomplete JSON received', argsString);
                  return;
                }
                
                // Additional validation: try to parse and check if it's valid
                let groceryData;
                try {
                  groceryData = JSON.parse(argsString);
                } catch (parseError) {
                  console.warn('[WebRTC] Invalid JSON in arguments, skipping parse:', argsString);
                  console.warn('[WebRTC] Parse error:', parseError);
                  addDebugLog('error', 'JSON parsing failed', { json: argsString, error: parseError });
                  return;
                }
                console.log('[WebRTC] Extracted groceries from item.done:', groceryData);
                // Call the onGroceryExtraction callback if provided
                if (options.onGroceryExtraction && groceryData.items && Array.isArray(groceryData.items)) {
                  console.log('[WebRTC] Calling onGroceryExtraction with items:', groceryData.items);
                  addDebugLog('items', 'Items sent for addition to list', groceryData.items);
                  options.onGroceryExtraction(groceryData.items);
                } else {
                  console.warn('[WebRTC] Grocery extraction callback not called - missing callback or invalid items:', {
                    hasCallback: !!options.onGroceryExtraction,
                    hasItems: !!groceryData.items,
                    isArray: Array.isArray(groceryData.items),
                    itemsData: groceryData.items
                  });
                  addDebugLog('error', 'Items not sent - callback or items invalid', {
                    hasCallback: !!options.onGroceryExtraction,
                    hasItems: !!groceryData.items,
                    isArray: Array.isArray(groceryData.items),
                    itemsData: groceryData.items
                  });
                }
              } catch (error) {
                console.error('[WebRTC] Unexpected error in grocery extraction from item.done:', error);
                console.error('[WebRTC] Raw arguments:', msg.item.arguments);
                addDebugLog('error', 'Unexpected error in grocery extraction', { error, rawArgs: msg.item.arguments });
              }
            }
          } else if (msg.type === 'conversation.item.input_audio_transcription.completed' && msg.transcript) {
            // Handle completed transcription for display purposes only
            console.log('[WebRTC] Input audio transcription completed:', msg.transcript);
            if (options.onTranscriptComplete) {
              options.onTranscriptComplete(msg.transcript);
            }
          } else if (msg.type === 'conversation.item.input_audio_transcription.delta' && msg.delta) {
            // Handle partial transcription updates
            console.log('[WebRTC] Input audio transcription delta:', msg.delta);
            currentTranscriptRef.current += msg.delta;
            options.onTranscriptUpdate?.(currentTranscriptRef.current);
          } else if (msg.type === 'session.error' && msg.error) {
            setError(msg.error.message || 'Session error');
          } else if (msg.type === 'response.created' && msg.response) {
            // Log the full response structure
            console.log('[WebRTC] Response created structure:', msg.response);
            setIsProcessing(true); // AI is now processing
            if (msg.response.output && msg.response.output.length > 0) {
              const textOutput = msg.response.output.find((item: unknown) => 
                item && typeof item === 'object' && 'type' in item && item.type === 'message' && 
                'message' in item && item.message && typeof item.message === 'object' && 'content' in item.message
              );
              if (textOutput && textOutput.message && typeof textOutput.message === 'object' && 'content' in textOutput.message) {
                const textContent = (textOutput.message as { content: unknown[] }).content.find((c: unknown) => 
                  c && typeof c === 'object' && 'type' in c && c.type === 'text'
                );
                if (textContent && typeof textContent === 'object' && 'text' in textContent) {
                  setAIResponse((prev) => prev + (textContent as { text: string }).text);
                }
              }
            }
          } else if (msg.type === 'response.done' && msg.response) {
            // Log the full response structure
            console.log('[WebRTC] Response done structure:', msg.response);
            setIsProcessing(false); // AI finished processing
            
            // Check if the response failed and show error
            if (msg.response.status === 'failed' && msg.response.status_details?.error) {
              const errorMessage = msg.response.status_details.error.message;
              const userFriendlyError = errorMessage;
              
              // Handle rate limit errors specifically with auto-retry
              if (errorMessage.includes('Rate limit reached')) {
                const match = errorMessage.match(/Please try again in ([\d.]+)s/);
                const waitTimeSeconds = match ? parseFloat(match[1]) : 2;
                const waitTimeMs = Math.ceil(waitTimeSeconds * 1000);
                
                console.log(`[WebRTC] Rate limit hit, auto-retrying in ${waitTimeMs}ms`);
                setIsRetrying(true);
                setError(`Rate limited, reconnecting in ${waitTimeSeconds}s...`);
                
                // Auto-retry after the specified wait time
                setTimeout(async () => {
                  console.log('[WebRTC] Auto-retry: Stopping current connection');
                  stopConnection();
                  
                  // Small additional delay to ensure cleanup
                  setTimeout(async () => {
                    console.log('[WebRTC] Auto-retry: Starting new connection');
                    setIsRetrying(false);
                    setError(null);
                    await startConnection();
                  }, 100);
                }, waitTimeMs);
                
                return;
              }
              
              console.error('[WebRTC] API Error:', errorMessage);
              setError(userFriendlyError);
              setIsProcessing(false); // Stop processing on error
              return;
            }
            
            // Check if the response was cancelled (common with turn detection)
            if (msg.response.status === 'cancelled') {
              const reason = msg.response.status_details?.reason || 'unknown';
              console.log(`[WebRTC] Response cancelled: ${reason}`);
              setIsProcessing(false); // Stop processing on cancellation
              // Don't show error for cancelled responses due to turn detection - this is normal
              if (reason === 'turn_detected') {
                console.log('[WebRTC] Response cancelled due to turn detection (user started speaking again)');
              }
              return;
            }
            
            if (msg.response.output && msg.response.output.length > 0) {
              const textOutput = msg.response.output.find((item: unknown) => 
                item && typeof item === 'object' && 'type' in item && item.type === 'message' && 
                'message' in item && item.message && typeof item.message === 'object' && 'content' in item.message
              );
              if (textOutput && textOutput.message && typeof textOutput.message === 'object' && 'content' in textOutput.message) {
                const textContent = (textOutput.message as { content: unknown[] }).content.find((c: unknown) => 
                  c && typeof c === 'object' && 'type' in c && c.type === 'text'
                );
                if (textContent && typeof textContent === 'object' && 'text' in textContent) {
                  setAIResponse((prev) => prev + (textContent as { text: string }).text + '\n');
                }
              }
            }
          } else if (msg.type === 'response.output_item.added' && msg.item) {
            // Handle individual output items being added
            console.log('[WebRTC] Output item added:', msg.item);
            if (msg.item.type === 'message' && msg.item.message?.content) {
              const textContent = (msg.item.message as { content: unknown[] }).content.find((c: unknown) => 
                c && typeof c === 'object' && 'type' in c && c.type === 'text'
              );
              if (textContent && typeof textContent === 'object' && 'text' in textContent) {
                setAIResponse((prev) => prev + (textContent as { text: string }).text);
              }
            }
          } else if (msg.type === 'response.content_part.added' && msg.part) {
            // Handle content parts being added
            console.log('[WebRTC] Content part added:', msg.part);
            if (msg.part.type === 'text') {
              setAIResponse((prev) => prev + msg.part.text);
            }
          } else if (msg.type === 'response.content_part.done' && msg.part) {
            // Handle content parts being completed
            console.log('[WebRTC] Content part done:', msg.part);
            if (msg.part.type === 'text') {
              setAIResponse((prev) => prev + msg.part.text);
            }
          }
          options.onMessage?.(msg);
        } catch {
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
    } catch (err: unknown) {
      console.error('[WebRTC] Connection error:', err);
      const message = err instanceof Error ? err.message : 'WebRTC connection failed';
      setError(message);
      options.onError?.(message);
      
      // Clean up media stream and audio context on error
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          console.log('[WebRTC] Error cleanup: Stopping media track:', track.kind);
          track.stop();
        });
        mediaStreamRef.current = null;
      }
      
      // Clean up peer connection and data channel
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
    }
  };

  // Call this to stop the connection
  const stopConnection = () => {
    console.log('[WebRTC] Stopping connection...');
    setConnectionState('disconnected');
    setError(null);
    setAIResponse('');
    setIsProcessing(false);
    setIsConnected(false);
    currentTranscriptRef.current = ''; // Reset transcript when stopping
    
    // Stop media stream tracks to release microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        console.log('[WebRTC] Stopping media track:', track.kind);
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    
    console.log('[WebRTC] Connection stopped and microphone released');
  };

  // Function to send a message over the data channel
  const sendMessage = (msg: unknown) => {
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
      console.log('[WebRTC] Cleaning up peer/data channel and media stream');
      // Stop media stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          console.log('[WebRTC] Cleanup: Stopping media track:', track.kind);
          track.stop();
        });
        mediaStreamRef.current = null;
      }
      // Close audio context to prevent memory leak
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      peerRef.current?.close();
      dataChannelRef.current?.close();
    };
  }, []);

  return {
    connectionState,
    error,
    aiResponse,
    isProcessing,
    isConnected,
    isRetrying,
    startConnection,
    stopConnection,
    sendMessage,
  };
} 