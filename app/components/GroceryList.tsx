'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GroceryItemWithMeasurement } from '../types/grocery';

interface GroceryListProps {
  items: GroceryItemWithMeasurement[];
  isLoading?: boolean;
  error?: string | null;
  onExport?: () => void;
  /** Optional className override for the internal scroll container */
  scrollContainerClassName?: string;
}

const GroceryList: React.FC<GroceryListProps> = ({ items, isLoading, error, scrollContainerClassName }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousItemCount = useRef(items.length);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [newlyAddedIndices, setNewlyAddedIndices] = useState<Set<number>>(new Set());

  // Auto-scroll to the bottom when new items are added
  useEffect(() => {
    const currentItemCount = items.length;
    const itemsAdded = currentItemCount > previousItemCount.current;
    
    if (itemsAdded && scrollContainerRef.current) {
      // Mark newly added items for highlighting
      const newIndices = new Set<number>();
      for (let i = previousItemCount.current; i < currentItemCount; i++) {
        newIndices.add(i);
      }
      setNewlyAddedIndices(newIndices);
      
      // Clear any existing scroll timeout to handle multiple rapid additions
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Scroll after a short delay to ensure DOM is updated and animations start
      scrollTimeoutRef.current = setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          
          // Always scroll to show new items - users expect to see what was just added
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
        
        // Hide highlighting after scroll
        setTimeout(() => {
          setNewlyAddedIndices(new Set());
        }, 1500);
      }, 200); // Longer delay to ensure DOM is fully updated
    }
    
    previousItemCount.current = currentItemCount;
  }, [items.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="glass-subtle p-4 rounded-lg animate-scale-in">
        <div className="flex items-center text-red-300">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Error loading grocery list</span>
        </div>
        <p className="text-white/60 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-subtle p-4 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-white/20 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Empty state is handled in parent component
  }

  return (
    <div className="relative">
      <div 
        ref={scrollContainerRef}
        className={scrollContainerClassName || "space-y-3 max-h-48 sm:max-h-64 overflow-y-auto"}
      >
        {items.map((item, index) => {
          const isNewlyAdded = newlyAddedIndices.has(index);
          return (
            <div
              key={`${item.item}-${index}`}
              className={`glass-subtle p-3 sm:p-4 rounded-lg hover:glass transition-all duration-200 animate-slide-up ${
                isNewlyAdded ? 'ring-2 ring-green-400/50 bg-green-500/10' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-base sm:text-lg capitalize truncate">
                {item.item}
              </h4>
            </div>
            
            {(item.quantity || item.measurement) && (
              <div className="flex-shrink-0">
                {item.measurement ? (
                  <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-green-500/30 text-green-100 border border-green-400/40">
                    {item.measurement.value} {item.measurement.unit}
                  </span>
                ) : item.quantity && (
                  <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-blue-500/30 text-blue-100 border border-blue-400/40">
                    {item.quantity} шт
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
          );
        })}
      
        {/* Scroll indicator */}
        {items.length > 4 && (
          <div className="text-center py-2">
            <div className="inline-flex items-center text-white/40 text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Scroll for more
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryList;
