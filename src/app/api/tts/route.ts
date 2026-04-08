// src/app/api/tts/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.ELEVEN_LABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    // PASTE BAXTER'S VOICE ID HERE
    const BAXTER_VOICE_ID = 'IKne3meq5aSn9XLyUdCD'; 

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${BAXTER_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', 
          voice_settings: {
            stability: 0.5,       // Lower = more emotive, Higher = more stable
            similarity_boost: 0.8, // Enhances the "Baxter" signature sound
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs Error:', errorData);
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}