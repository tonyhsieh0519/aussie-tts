'use client'; // This is required for interactive components

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSpeak = async () => {
    if (!text) return;
    setLoading(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Speech generation failed');

      // Professional way to handle binary audio data
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // Play the audio and clean up the memory afterward
      audio.onended = () => window.URL.revokeObjectURL(url);
      audio.play();

    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Aussie TTS <span className="text-emerald-600">Pro</span>
          </h1>
          <p className="text-slate-500 mt-2">Speak with Baxter, your AI Aussie mate.</p>
        </header>

        <textarea
          className="w-full p-4 h-40 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all text-slate-800 resize-none shadow-sm"
          placeholder="G'day! Type something here to hear it in a professional Aussie accent..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleSpeak}
          disabled={loading || !text}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed animate-pulse' 
              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200'
          }`}
        >
          {loading ? 'Baxter is thinking...' : 'Speak in Aussie Accent'}
        </button>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Powered by Eleven Labs & Next.js
        </footer>
      </div>
    </main>
  );
}