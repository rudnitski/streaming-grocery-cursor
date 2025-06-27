import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model, response_format, temperature, max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages,
      response_format,
      temperature: temperature || 0,
      max_tokens: max_tokens || 2048,
    });

    return NextResponse.json(completion);
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    
    // Handle rate limiting
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Handle other OpenAI errors
    if (error && typeof error === 'object' && 'status' in error && error.status) {
      return NextResponse.json(
        { error: (error as { message?: string }).message || 'OpenAI API error' },
        { status: error.status as number }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
