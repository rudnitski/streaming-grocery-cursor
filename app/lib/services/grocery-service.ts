import { GroceryItemWithMeasurement } from '../../types/grocery';
import { GROCERY_EXTRACTION_PROMPT } from '../prompts/grocery-prompts';

export async function extractGroceries(transcript: string, usualGroceries?: string): Promise<GroceryItemWithMeasurement[]> {
  try {
    console.log('[GroceryService] Extracting groceries from transcript:', transcript);
    console.log('[GroceryService] Using usual groceries:', usualGroceries ? 'Yes' : 'No');

    // Replace the placeholder in the prompt with actual usual groceries
    const enhancedPrompt = GROCERY_EXTRACTION_PROMPT.replace(
      '{USUAL_GROCERIES}',
      usualGroceries || 'No usual groceries provided'
    );

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: enhancedPrompt
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GroceryService] OpenAI response:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    // Parse the JSON response
    let groceryData;
    try {
      groceryData = JSON.parse(data.content);
    } catch (parseError) {
      console.error('[GroceryService] Error parsing JSON response:', parseError);
      console.error('[GroceryService] Raw content:', data.content);
      return [];
    }

    // Validate and return the grocery items
    if (groceryData && Array.isArray(groceryData.items)) {
      console.log('[GroceryService] Successfully extracted groceries:', groceryData.items);
      return groceryData.items;
    } else {
      console.warn('[GroceryService] No valid grocery items found in response');
      return [];
    }

  } catch (error) {
    console.error('[GroceryService] Error extracting groceries:', error);
    throw error;
  }
}
