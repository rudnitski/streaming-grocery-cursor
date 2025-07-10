'use client';

import React, { useRef } from 'react';

export interface ExportDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Callback fired when the dialog requests to close */
  onClose: () => void;
  /** Pre-formatted grocery list text */
  textToCopy: string;
}

/**
 * ExportDialog component provides a dialog interface for exporting grocery lists.
 * 
 * This component displays the formatted grocery list in a textarea and provides
 * buttons for copying the content to clipboard and closing the dialog.
 * It uses the Clipboard API with a fallback mechanism if the API is not available.
 * 
 * @param props - Component props
 * @returns A React component that renders a dialog with export functionality
 */
export default function ExportDialog({ isOpen, onClose, textToCopy }: ExportDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Handles the copy action when the user clicks the Copy button.
   * 
   * Attempts to use the Clipboard API to copy text, and falls back to
   * selecting the text for manual copy if the API fails. Shows appropriate
   * notifications for both success and failure cases.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      // You can add a toast notification here if needed
      console.log('Successfully copied to clipboard');
    } catch {
      // Fallback: select the text for manual copy
      textareaRef.current?.select();
      console.error('Copy failed, text selected for manual copy');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative glass-strong p-6 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Export Grocery List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={textToCopy}
          readOnly
          rows={12}
          className="glass border border-white/20 rounded-xl text-white placeholder-white/40 p-4 text-sm font-mono resize-none flex-1 min-h-0 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
        />

        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 glass rounded-lg text-white/80 hover:text-white transition-all duration-200 hover:scale-105"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}