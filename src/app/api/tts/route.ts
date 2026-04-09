import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key for server-side permissions
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.ELEVEN_LABS_API_KEY;

    // Use Charlie (Aussie Male) for the Free Tier compatibility
    const VOICE_ID = 'IKne3meq5aSn9XLyUdCD'; 
    
    // Generate a unique filename using a timestamp
    const fileName = `audio-${Date.now()}.mp3`;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    // 1. Fetch Audio from ElevenLabs
    const elResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!elResponse.ok) {
      const errorData = await elResponse.json();
      return NextResponse.json(errorData, { status: elResponse.status });
    }

    const audioBuffer = await elResponse.arrayBuffer();

    // 2. Upload to Supabase Storage Bucket ('aussie-audio')
    const { data: storageData, error: storageError } = await supabase.storage
      .from('aussie-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (storageError) {
      console.error('Storage Error:', storageError);
      // We continue even if storage fails so the user still gets their audio
    }

    // 3. Get the Public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('aussie-audio')
      .getPublicUrl(fileName);

    // 4. Log the transaction and the URL in the Database
    const { error: dbError } = await supabase.from('speech_logs').insert([
      { 
        input_text: text, 
        voice_id: VOICE_ID, 
        character_count: text.length,
        audio_url: publicUrl // This matches the new column we added
      },
    ]);

    if (dbError) console.error('Database Logging Error:', dbError);

    // 5. Return the audio to the frontend for immediate playback
    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}