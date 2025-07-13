import { NextRequest, NextResponse } from 'next/server';

// POST /api/webrtc/offer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offer } = body;

    // Input validation
    if (!offer || typeof offer !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing offer' }, { status: 400 });
    }

    // Basic SDP validation
    if (!offer.includes('v=0') || !offer.includes('m=audio')) {
      return NextResponse.json({ error: 'Invalid SDP offer format' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    const response = await fetch(
      'https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/sdp',
        },
        body: offer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json({ error: `OpenAI API error: ${response.status} ${errorText}` }, { status: response.status });
    }

    const answer = await response.text();
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    console.error('Request error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Request error: ${message}` }, { status: 500 });
  }
} 