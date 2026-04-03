import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';

const Trainer = () => {
  const [weakness, setWeakness] = useState('');
  const [passage, setPassage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { 
    words, currentWordIndex, currentCharIndex, status, currentWPM, 
    accuracy, reset 
  } = useTyping(passage || "Awaiting training passage...");

  const handleGenerate = async () => {
    if (!weakness.trim()) return;
    setLoading(true);
    setError(null);
    setPassage(''); // reset current
    try {
      const response = await fetch('http://localhost:4000/api/ai/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakness })
      });
      
      if (!response.ok) throw new Error('API query failed');
      const data = await response.json();
      
      setPassage(data.passage.trim());
      reset(data.passage.trim()); // explicitly reset the typing hook
    } catch (err) {
      setError("AI Generation failed. Check local GEMINI_API_KEY in server/.env");
    } finally {
      setLoading(false);
    }
  };

  const isRacing = status === 'running' || status === 'finished';

  return (
    <PageWrapper>
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen flex flex-col items-center">
        
        <div className="text-center mb-12">
           <h1 className="text-5xl md:text-7xl font-syne font-black text-neutral-100 tracking-tighter shadow-glow-primary">AI Trainer</h1>
           <p className="text-sm text-neutral-400 font-inter mt-4 max-w-md mx-auto">
             Target your weakest keybinds. Our neural engine generates a custom typing protocol to enforce muscle memory.
           </p>
        </div>

        {/* Input Configuration Panel */}
        {!isRacing && !passage && (
          <div className="w-full max-w-2xl custom-glass p-8 rounded-2xl border border-primary/20 bg-neutral-900/50 shadow-teal-glow">
            <h2 className="text-xs uppercase font-inter text-primary tracking-widest font-bold mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-[14px]">psychology</span> Target Weakness
            </h2>
            
            <div className="space-y-6 flex flex-col">
               <div className="space-y-2">
                 <label className="text-xs text-neutral-400 font-mono">Problematic Characters (e.g., "; q z [ ]")</label>
                 <input 
                    type="text" 
                    value={weakness}
                    onChange={(e) => setWeakness(e.target.value)}
                    placeholder="Enter characters to practice..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 text-neutral-200 font-mono text-sm tracking-widest outline-none transition-all"
                    onKeyDown={(e) => {
                       if (e.key === 'Enter') handleGenerate();
                    }}
                 />
               </div>

               <button 
                 onClick={handleGenerate}
                 disabled={loading || !weakness.trim()}
                 className={`w-full py-4 rounded-lg font-syne font-black text-lg tracking-wider transition-all duration-300 ${
                    loading || !weakness.trim() 
                     ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                     : 'bg-primary text-on-primary hover:bg-emerald-400 shadow-teal-glow'
                 }`}
               >
                 {loading ? 'GENERATING PROTOCOL...' : 'INITIALIZE TARGETED PRACTICE'}
               </button>

               {error && (
                 <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono p-3 rounded text-center">
                    {error}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Active Trainer Area */}
        {passage && (
          <div className="w-full mt-8 fade-in">
             
             {/* Stats Display */}
             <div className="w-full flex justify-between items-end mb-6 border-b border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-primary shadow-glow-primary animate-pulse"></div>
                   <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">Targeted Phase</span>
                </div>
                
                {status !== 'idle' && (
                  <div className="flex gap-8">
                     <div className="flex flex-col items-end">
                       <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-widest">WPM</span>
                       <span className="font-syne font-black text-2xl text-primary">{Math.floor(currentWPM)}</span>
                     </div>
                     <div className="flex flex-col items-end">
                       <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-widest">Accuracy</span>
                       <span className="font-syne font-black text-2xl text-neutral-100">{accuracy.toFixed(1)}%</span>
                     </div>
                  </div>
                )}
             </div>

             {/* Typing Component */}
             <div className="relative custom-glass p-8 rounded-xl border border-neutral-800/80 mb-8 min-h-[160px]">
                <WordDisplay 
                  words={words} 
                  currentWordIndex={currentWordIndex} 
                  currentCharIndex={currentCharIndex} 
                  status={status} 
                />
             </div>

             {/* Footer Actions */}
             <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <button 
                  onClick={() => reset(passage)}
                  className="px-8 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-primary hover:border-primary/50 transition-colors flex items-center gap-2"
                >
                   <span className="material-symbols-outlined text-[16px]">refresh</span> Restart Protocol
                </button>

                <button 
                  onClick={() => { setPassage(''); setWeakness(''); }}
                  className="px-8 py-3 rounded-lg bg-transparent border border-neutral-800 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-2"
                >
                   Target New Weakness
                </button>
             </div>

          </div>
        )}

      </main>
    </PageWrapper>
  );
};

export default Trainer;
