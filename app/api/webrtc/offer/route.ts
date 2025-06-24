import { NextRequest, NextResponse } from 'next/server';

// POST /api/webrtc/offer
export async function POST(req: NextRequest) {
  const { offer } = await req.json();

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  try {
    const response = await fetch(
      'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-05-13',
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
  } catch (err: any) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: `Fetch error: ${err.message}` }, { status: 500 });
  }
} 