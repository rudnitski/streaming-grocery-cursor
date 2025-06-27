'use client';
import React, { useState, useRef } from 'react';
import VoiceConnection, { VoiceConnectionRef } from './components/VoiceConnection';
import ErrorDisplay from './components/ErrorDisplay';
import ConnectionStatus from './components/ConnectionStatus';
import GroceryList from './components/GroceryList';
import { useWebRTC } from './hooks/useWebRTC';
import { GroceryItemWithMeasurement } from './types/grocery';

export default function Home() {
  const [transcriptBuffer, setTranscriptBuffer] = useState('');
  const [groceryItems, setGroceryItems] = useState<GroceryItemWithMeasurement[]>([]);
  const voiceConnectionRef = useRef<VoiceConnectionRef>(null);
  
  const {
    connectionState,
    error: webrtcError,
    isProcessing,
    startConnection,
    stopConnection,
  } = useWebRTC({
    onMessage: (msg) => {
      console.log('[Home] WebRTC message:', msg);
    },
    onError: (error) => {
      console.error('[Home] WebRTC error:', error);
    },
    onGroceryExtraction: (items: unknown) => {
      console.log('[Home] Groceries extracted via function call:', items);
      
      setGroceryItems(prevItems => {
        const updatedItems = [...prevItems];
        
        if (Array.isArray(items)) {
          items.forEach((item: unknown) => {
            if (item && typeof item === 'object' && 'item' in item) {
              const typedItem = item as GroceryItemWithMeasurement;
              const existingIndex = updatedItems.findIndex(
                existing => existing.item.toLowerCase() === typedItem.item.toLowerCase()
              );
              
              if (typedItem.action === 'remove') {
                // Remove item if it exists
                if (existingIndex !== -1) {
                  updatedItems.splice(existingIndex, 1);
                }
              } else if (typedItem.action === 'modify' && existingIndex !== -1) {
                // Update existing item
                updatedItems[existingIndex] = typedItem;
              } else if (typedItem.action === 'add' || !typedItem.action) {
                // Add new item or update quantity if it exists
                if (existingIndex !== -1) {
                  // Update existing item with new quantity
                  updatedItems[existingIndex] = typedItem;
                } else {
                  // Add new item
                  updatedItems.push(typedItem);
                }
              }
            }
          });
        }
        
        return updatedItems;
      });
    },
    onTranscriptUpdate: (transcript) => {
      console.log('[Home] Transcript update:', transcript);
      setTranscriptBuffer(transcript);
    }
  });

  const clearGroceryList = () => {
    setGroceryItems([]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12 animate-slide-up">
          <div className="glass-strong inline-block px-8 py-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2">
              Voice Grocery Assistant
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-medium">
              Speak naturally to build your shopping list
            </p>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Voice Controls */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Voice Connection Card */}
            <div className="glass-strong p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 glass rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Voice Recording</h2>
                <p className="text-white/70">
                  Click to start recording and speak your grocery items
                </p>
              </div>
              
              <VoiceConnection
                ref={voiceConnectionRef}
                onStartConnection={startConnection}
                onStopConnection={stopConnection}
                connectionState={connectionState}
                isProcessing={isProcessing}
              />
            </div>

            {/* Connection Status */}
            <div className="glass p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <ConnectionStatus 
                connectionState={connectionState}
                isProcessing={isProcessing}
              />
            </div>

            {/* Transcript Display */}
            {transcriptBuffer && (
              <div className="glass p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Recent Speech
                </h3>
                <p className="text-white/80 italic leading-relaxed">
                  &quot;{transcriptBuffer}&quot;
                </p>
              </div>
            )}

            {/* Error Display */}
            {webrtcError && (
              <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <ErrorDisplay error={webrtcError} />
              </div>
            )}
          </div>

          {/* Right Column - Grocery List */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-strong p-8 min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                  Shopping List
                  {groceryItems.length > 0 && (
                    <span className="ml-3 glass-subtle px-3 py-1 rounded-full text-sm font-medium text-white">
                      {groceryItems.length} {groceryItems.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </h2>
                
                {groceryItems.length > 0 && (
                  <button
                    onClick={clearGroceryList}
                    className="glass px-4 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-200 hover:scale-105 flex items-center text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Clear List
                  </button>
                )}
              </div>
              
              <GroceryList items={groceryItems} />
              
              {groceryItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="glass w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-lg mb-2">Your shopping list is empty</p>
                  <p className="text-white/40 text-sm">
                    Start recording to add items with your voice
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="mt-12 glass p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/70">
            <div className="glass-subtle p-4 rounded-lg">
              <div className="font-medium text-white mb-2">1. Start Recording</div>
              <div className="text-sm">Click the record button to begin voice input</div>
            </div>
            <div className="glass-subtle p-4 rounded-lg">
              <div className="font-medium text-white mb-2">2. Speak Naturally</div>
              <div className="text-sm">Say items like &quot;Add 2 pounds of apples&quot; or &quot;Remove milk&quot;</div>
            </div>
            <div className="glass-subtle p-4 rounded-lg">
              <div className="font-medium text-white mb-2">3. Watch the Magic</div>
              <div className="text-sm">Items appear automatically in your shopping list</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
