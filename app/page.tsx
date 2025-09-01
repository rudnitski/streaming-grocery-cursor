'use client';
import React, { useState, useRef } from 'react';
import VoiceConnection, { VoiceConnectionRef } from './components/VoiceConnection';
import ErrorDisplay from './components/ErrorDisplay';
import UsualGroceries from './components/UsualGroceries';
import ExportDialog from './components/ExportDialog';
import ShoppingCartModal from './components/ShoppingCartModal';
import { SimpleDebugPanel } from './components/SimpleDebugPanel';
import { useWebRTC } from './hooks/useWebRTC';
import { useGroceryList } from './hooks/useGroceryList';
import ItemConfirmationCard from './components/ItemConfirmationCard';
import { useItemConfirmationQueue } from './hooks/useItemConfirmationQueue';
import { formatGroceryListForExport } from './lib/utils/grocery-utils';

// Inner component that uses the WebRTC hook inside the provider
function HomeContent() {
  const [usualGroceries, setUsualGroceries] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportText, setExportText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const voiceConnectionRef = useRef<VoiceConnectionRef>(null);
  
  const { 
    groceryItems, 
    isClearing, 
    addOrUpdateItems, 
    clearList 
  } = useGroceryList();

  // Confirmation queue: commit to list after animation
  const { currentItem, isFadingOut, enqueueItems } = useItemConfirmationQueue({
    onCommitted: (item) => addOrUpdateItems([item])
  });
  
  const {
    connectionState,
    error: webrtcError,
    isProcessing,
    isRetrying,
    startConnection,
    stopConnection,
  } = useWebRTC({
    usualGroceries,
    onMessage: (msg) => {
      console.log('[Home] WebRTC message:', msg);
    },
    onError: (error) => {
      console.error('[Home] WebRTC error:', error);
    },
    onGroceryExtraction: (items: unknown) => {
      console.log('[Home] Groceries extracted via function call (queued):', items);
      enqueueItems(items);
    },
    onTranscriptUpdate: (transcript) => {
      console.log('[Home] Transcript update:', transcript);
      // Transcript no longer displayed in UI for cleaner mobile experience
    },
    onFunctionCallStart: () => {
      console.log('[Home] Function call started - playing voice effect');
      // You can add visual feedback here if needed
      // For example, flash the grocery list or show a processing indicator
    }
  });

  const clearGroceryList = () => {
    clearList();
  };

  const handleUsualGroceriesChange = (groceries: string) => {
    setUsualGroceries(groceries);
  };

  const handleExportList = async () => {
    if (groceryItems.length === 0) return;
    
    setIsExporting(true);
    const formatted = formatGroceryListForExport(groceryItems);
    
    try {
      await navigator.clipboard.writeText(formatted);
      console.log('Successfully copied grocery list to clipboard');
      
      // Brief delay for visual feedback
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    } catch {
      // Fallback: show export dialog
      setExportText(formatted);
      setIsExportDialogOpen(true);
      setIsExporting(false);
    }
  };

  const openCart = () => {
    if (groceryItems.length > 0) setIsCartOpen(true);
  };

  const onCartKeyDown = (e: React.KeyboardEvent) => {
    if (groceryItems.length === 0) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Item Confirmation Overlay */}
      {currentItem && (
        <ItemConfirmationCard name={currentItem.item} fadingOut={isFadingOut} />
      )}
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Voice Status Bar - Always visible at top */}
        <div className="glass-strong p-3 mb-4 animate-slide-up">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium text-sm sm:text-lg truncate">Voice Grocery Assistant</span>
              </div>
              {/* Simple connection status indicator */}
              {connectionState === 'connected' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs hidden sm:inline">Ready</span>
                </div>
              )}
            </div>
            
            <VoiceConnection
              ref={voiceConnectionRef}
              onStartConnection={startConnection}
              onStopConnection={stopConnection}
              connectionState={connectionState}
              isProcessing={isProcessing}
              isRetrying={isRetrying}
            />
          </div>
          
          {/* Error Display */}
          {webrtcError && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <ErrorDisplay error={webrtcError} />
            </div>
          )}
        </div>

        {/* Usual Groceries Section */}
        <div className="glass-strong p-4 sm:p-6 mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            Your Usual Groceries
          </h2>
          <UsualGroceries onUsualGroceriesChange={handleUsualGroceriesChange} />
        </div>

        {/* Shopping Cart Section: clickable to open modal */}
        <div
          className={`glass-strong p-4 sm:p-6 mb-4 sm:mb-6 animate-slide-up ${groceryItems.length > 0 ? 'cursor-pointer hover:glass' : ''}`}
          style={{ animationDelay: '0.2s' }}
          onClick={openCart}
          role={groceryItems.length > 0 ? 'button' : undefined}
          tabIndex={groceryItems.length > 0 ? 0 : -1}
          onKeyDown={onCartKeyDown}
          aria-disabled={groceryItems.length === 0}
          aria-label="Shopping Cart"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Shopping Cart
              {groceryItems.length > 0 && (
                <span className="ml-2 sm:ml-3 glass-subtle px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium text-white">
                  {groceryItems.length} {groceryItems.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
            {groceryItems.length > 0 && (
              <div className="flex items-center text-white/60 text-xs sm:text-sm">
                <span className="mr-1">View cart</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {groceryItems.length === 0 && (
            <div className="text-center py-8">
              <div className="glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <p className="text-white/60 text-lg mb-2">Your cart is empty</p>
              <p className="text-white/40 text-sm">
                Start recording to add items with your voice
              </p>
            </div>
          )}
        </div>

        {/* Shopping Cart Modal */}
        <ShoppingCartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={groceryItems}
          onExport={handleExportList}
          onClear={clearGroceryList}
          isExporting={isExporting}
          isClearing={isClearing}
        />

        {/* Quick Instructions */}
        <div className="glass p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center text-white/70 text-sm">
            <p className="mb-1">💬 <strong>Say:</strong> &quot;Add 2 liters of milk&quot; or &quot;Remove bread&quot;</p>
            <p>🎯 Browse your usual groceries above, then speak to add them to your cart</p>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      <SimpleDebugPanel />
      
      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        textToCopy={exportText}
      />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
