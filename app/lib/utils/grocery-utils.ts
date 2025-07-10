/**
 * Grocery Utilities
 * 
 * This file contains utility functions for grocery items, 
 * including formatting for export purposes.
 */

import { GroceryItemWithMeasurement } from '../../types/grocery';

/**
 * Formats a grocery list for export as text
 * 
 * @param items Array of grocery items to format
 * @param options Optional formatting options
 * @returns A formatted string representation of the grocery list
 */
export function formatGroceryListForExport(
  items: GroceryItemWithMeasurement[], 
  options: { includeTitle?: boolean; title?: string } = {}
): string {
  if (!items || items.length === 0) {
    return '';
  }

  // Default options
  const { 
    includeTitle = true, 
    title = 'Grocery List' 
  } = options;

  // Format each item as a bullet point
  const formattedItems = items.map(item => {
    const { item: name, quantity, measurement } = item;
    
    // Handle items with measurements
    if (measurement) {
      return `- ${name} (${measurement.value} ${measurement.unit})`;
    } 
    // Handle items without measurements
    else {
      // Format the quantity appropriately
      const formattedQuantity = formatQuantity(quantity);
      
      return `- ${name} (${formattedQuantity})`;
    }
  });

  // Build the final output with title if requested
  let output = '';
  
  if (includeTitle) {
    output = `${title}\n\n`;
  }
  
  output += formattedItems.join('\n');
  
  return output;
}

/**
 * Formats a quantity value for display
 * Handles special cases like fractional quantities and zero values
 * 
 * @param quantity The numeric quantity to format
 * @returns A formatted string representation of the quantity
 */
function formatQuantity(quantity: number): string {
  // Handle zero case
  if (quantity === 0) return '0';
  
  // Handle integer values
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }
  
  // Handle decimal values - remove unnecessary trailing zeros
  return quantity.toFixed(2).replace(/\.?0+$/, '');
}