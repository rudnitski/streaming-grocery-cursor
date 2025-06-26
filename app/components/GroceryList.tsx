'use client';

import React from 'react';
import { GroceryItemWithMeasurement } from '../types/grocery';

interface GroceryListProps {
  items: GroceryItemWithMeasurement[];
  isLoading?: boolean;
  error?: string | null;
}

const GroceryList: React.FC<GroceryListProps> = ({ items, isLoading, error }) => {
  const formatMeasurement = (measurement: GroceryItemWithMeasurement['measurement']): string => {
    if (!measurement) return '';
    return ` (${measurement.value} ${measurement.unit})`;
  };


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
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={`${item.item}-${index}`}
          className="glass-subtle p-4 rounded-lg hover:glass transition-all duration-200 animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex flex-col space-y-2">
            <h4 className="text-white font-medium text-lg capitalize">
              {item.item}
            </h4>
            
            {(item.quantity || item.measurement) && (
              <div className="flex items-center space-x-2">
                {item.measurement ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-blue-500/30 text-blue-100 border border-blue-400/40">
                    {item.measurement.value} {item.measurement.unit}
                  </span>
                ) : item.quantity && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold bg-purple-500/30 text-purple-100 border border-purple-400/40">
                    {item.quantity} шт
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Scroll indicator */}
      {items.length > 5 && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-white/40 text-xs">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Scroll for more items
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryList;
