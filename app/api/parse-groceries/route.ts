import { NextRequest, NextResponse } from 'next/server';
import { extractGroceries } from '../../lib/services/grocery-service';

export async function POST(request: NextRequest) {
  try {
    const { transcript, usualGroceries } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Invalid transcript provided' },
        { status: 400 }
      );
    }

    console.log('[API] Extracting groceries from transcript:', transcript);
    console.log('[API] Using usual groceries:', usualGroceries ? 'Yes' : 'No');

    const groceries = await extractGroceries(transcript, usualGroceries);
    
    console.log('[API] Extracted groceries:', groceries);

    return NextResponse.json({ 
      success: true, 
      groceries: groceries || []
    });

  } catch (error) {
    console.error('[API] Error extracting groceries:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract groceries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
