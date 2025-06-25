import { NextRequest, NextResponse } from 'next/server';

// POST /api/webrtc/offer
export async function POST(req: NextRequest) {
  const { offer } = await req.json();

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  const response = await fetch(
    'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
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
    return NextResponse.json({ error: errorText }, { status: response.status });
  }

  const answer = await response.text();
  return NextResponse.json({ answer });
} 