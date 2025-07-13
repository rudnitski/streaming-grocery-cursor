import { useState } from 'react';
import { GroceryItemWithMeasurement } from '../types/grocery';

export function useGroceryList() {
  const [groceryItems, setGroceryItems] = useState<GroceryItemWithMeasurement[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  const addOrUpdateItems = (items: unknown) => {
    console.log('[useGroceryList] Processing grocery items:', items);
    
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
  };

  const clearList = () => {
    setIsClearing(true);
    
    // Brief delay for visual feedback
    setTimeout(() => {
      setGroceryItems([]);
      setIsClearing(false);
    }, 200);
  };

  const removeItem = (itemName: string) => {
    setGroceryItems(prevItems => 
      prevItems.filter(item => item.item.toLowerCase() !== itemName.toLowerCase())
    );
  };

  const updateItemQuantity = (itemName: string, newQuantity: number) => {
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.item.toLowerCase() === itemName.toLowerCase()
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return {
    groceryItems,
    isClearing,
    addOrUpdateItems,
    clearList,
    removeItem,
    updateItemQuantity,
  };
}