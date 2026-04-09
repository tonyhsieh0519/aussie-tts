'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase (Public Client)
// Since this is a client component, we use the Anon Key, not the Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SpeechLog {
  id: string;
  created_at: string;
  input_text: string;
  character_count: number;
  audio_url: string | null;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<SpeechLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase when the page loads
  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('speech_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching logs:', error);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }

    fetchLogs();
  }, []);

  // The "Play Again" Script
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Speech History</h1>
            <p className="text-slate-500 text-sm">Review and replay your Aussie clips.</p>
          </div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            ← Back to Home
          </Link>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">Loading your history...</div>
        ) : (
          <div className="grid gap-4">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      {log.character_count} Characters
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    "{log.input_text}"
                  </p>
                </div>

                {log.audio_url && (
                  <button
                    onClick={() => playAudio(log.audio_url!)}
                    className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span className="text-lg">▶</span>
                    Replay
                  </button>
                )}
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                No clips saved yet. Start talking!
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}