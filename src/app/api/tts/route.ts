import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    const CHARLIE_VOICE_ID = 'IKne3meq5aSn9XLyUdCD'; 

    // 1. Logic to call ElevenLabs (Keep your existing fetch code here...)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${CHARLIE_VOICE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey! },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    });

    if (response.ok) {
      // 2. NEW: Log the request to Supabase
      // We do this "in the background" so the user doesn't wait for the DB
      await supabase.from('speech_logs').insert([
        { 
          input_text: text, 
          voice_id: CHARLIE_VOICE_ID,
          character_count: text.length 
        }
      ]);

      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });
    }

    return NextResponse.json({ error: 'API Error' }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}