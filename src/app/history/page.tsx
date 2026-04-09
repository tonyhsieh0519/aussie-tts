import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function HistoryPage() {
  // Fetch the last 20 logs from the database
  const { data: logs, error } = await supabase
    .from('speech_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return <div className="p-10">Error loading history.</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Speech History</h1>
          <Link 
            href="/" 
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to TTS
          </Link>
        </header>

        <div className="space-y-4">
          {logs?.map((log) => (
            <div 
              key={log.id} 
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                  {log.character_count} Chars
                </span>
              </div>
              <p className="text-slate-700 italic">"{log.input_text}"</p>
            </div>
          ))}

          {logs?.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No history found. Go speak some Aussie!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}