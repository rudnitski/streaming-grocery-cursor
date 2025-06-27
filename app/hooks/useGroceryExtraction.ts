import { useState, useCallback } from 'react';
import { GroceryItemWithMeasurement } from '../types/grocery';

export interface UseGroceryExtractionReturn {
  groceryItems: GroceryItemWithMeasurement[];
  isExtracting: boolean;
  extractionError: string | null;
  extractGroceries: (transcript: string) => Promise<void>;
  addGroceryItems: (items: GroceryItemWithMeasurement[]) => void;
  clearGroceryList: () => void;
}

export function useGroceryExtraction(): UseGroceryExtractionReturn {
  const [groceryItems, setGroceryItems] = useState<GroceryItemWithMeasurement[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const addGroceryItems = useCallback((newItems: GroceryItemWithMeasurement[]) => {
    setGroceryItems(prevItems => {
      const updatedItems = [...prevItems];
      
      newItems.forEach((newItem) => {
        const existingIndex = updatedItems.findIndex(
          existing => existing.item.toLowerCase() === newItem.item.toLowerCase()
        );
        
        if (newItem.action === 'remove') {
          // Remove item if it exists
          if (existingIndex !== -1) {
            updatedItems.splice(existingIndex, 1);
          }
        } else if (newItem.action === 'modify' && existingIndex !== -1) {
          // Update existing item
          updatedItems[existingIndex] = { ...newItem };
        } else if (newItem.action === 'add' || !newItem.action) {
          // Add new item or update quantity if it exists
          if (existingIndex !== -1) {
            // Update existing item with new quantity/measurement
            updatedItems[existingIndex] = { ...newItem };
          } else {
            // Add new item
            updatedItems.push(newItem);
          }
        }
      });
      
      return updatedItems;
    });
  }, []);

  const extractGroceries = useCallback(async (transcript: string) => {
    if (!transcript.trim()) {
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      console.log('[useGroceryExtraction] Extracting groceries from:', transcript);

      const response = await fetch('/api/parse-groceries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.groceries && Array.isArray(data.groceries)) {
        addGroceryItems(data.groceries);
      }

    } catch (error) {
      console.error('[useGroceryExtraction] Error:', error);
      setExtractionError(error instanceof Error ? error.message : 'Failed to extract groceries');
    } finally {
      setIsExtracting(false);
    }
  }, [addGroceryItems]);

  const clearGroceryList = useCallback(() => {
    setGroceryItems([]);
  }, []);

  return {
    groceryItems,
    isExtracting,
    extractionError,
    extractGroceries,
    addGroceryItems,
    clearGroceryList,
  };
}
