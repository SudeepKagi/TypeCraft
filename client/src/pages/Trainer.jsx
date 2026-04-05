import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';
import useAuthStore from '../store/authStore';

const Trainer = () => {
  const [weakness, setWeakness] = useState('');
  const [passage, setPassage] = useState('');
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaturated, setIsSaturated] = useState(false);
  const userId = useAuthStore(state => state.userId);

  const { 
    words, currentWordIndex, currentCharIndex, status, currentWPM, 
    accuracy, reset, keystrokes 
  } = useTyping(passage || "Awaiting training passage...");
  
  const addXP = useAuthStore(state => state.addXP);

  // Handle saving results
  useEffect(() => {
    if (status === 'finished' && userId && passage) {
      fetch('http://localhost:4000/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          wpm: currentWPM,
          accuracy,
          mode: 'trainer',
          keystrokes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.xpGained) {
          addXP(data.xpGained);
        }
      })
      .catch(err => console.error('Failed to save trainer result:', err));
    }
  }, [status, userId, passage, currentWPM, accuracy, addXP]);

  const handleGenerate = async () => {
    if (!weakness.trim()) return;
    setLoading(true);
    setError(null);
    setPassage(''); 
    try {
      const response = await fetch('http://localhost:4000/api/ai/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakness })
      });
      
      if (!response.ok) throw new Error('API query failed');
      const data = await response.json();
      
      setPassage(data.passage.trim());
      setInsights(data.insights);

      const targetChars = weakness.toLowerCase().replace(/[\s,]/g, '').split('');
      const wordsLower = data.passage.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      const saturated = wordsLower.every(word => targetChars.some(char => word.includes(char)));
      setIsSaturated(saturated);

      reset(data.passage.trim()); 
    } catch (err) {
      setError("AI Generation failed. Check local GEMINI_API_KEY in server/.env");
    } finally {
      setLoading(false);
    }
  };

  const handleHeatmapSync = async () => {
      if (!userId) return;
      setLoading(true);
      try {
         const response = await fetch(`http://localhost:4000/api/users/${userId}/heatmap`);
         const data = await response.json();
         
         const weaknesses = Object.entries(data)
           .filter(([char, stats]) => stats.accuracy < 90 && stats.total > 10)
           .sort((a, b) => a[1].accuracy - b[1].accuracy)
           .slice(0, 5)
           .map(([char]) => char)
           .join(' ');
           
         if (weaknesses) {
            setWeakness(weaknesses);
         } else {
            setError("No significant weaknesses detected. Keep practicing!");
         }
      } catch (err) {
         console.error('Heatmap analysis failed:', err);
      } finally {
         setLoading(false);
      }
  };

  const isRacing = status === 'running' || status === 'finished';
  const isTimeWarpActive = status === 'running' && currentWPM > 80;

  return (
    <PageWrapper>
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen flex flex-col items-center">
        
        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-7xl font-syne font-black text-neutral-100 tracking-tighter uppercase shadow-glow-primary">AI Trainer</h1>
           <p className="text-sm text-neutral-400 font-inter mt-4 max-w-md mx-auto">
             Target your weakest keybinds. Our AI engine generates custom passages to build targeted muscle memory.
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
                 <label className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Problematic Characters (e.g., "; q z [ ]")</label>
                  <div className="flex gap-2">
                    <input 
                       type="text" 
                       value={weakness}
                       onChange={(e) => setWeakness(e.target.value)}
                       placeholder="Enter characters to practice..."
                       className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 text-neutral-200 font-mono text-sm tracking-widest outline-none transition-all"
                       onKeyDown={(e) => {
                          if (e.key === 'Enter') handleGenerate();
                       }}
                    />
                    <button 
                      onClick={handleHeatmapSync}
                      className="px-4 rounded-lg bg-neutral-800 border border-white/5 text-primary hover:bg-neutral-700 transition-colors flex items-center justify-center group"
                      title="Analyze Heatmap"
                    >
                      <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500">neurology</span>
                    </button>
                  </div>
               </div>

               <button 
                 onClick={handleGenerate}
                 disabled={loading || !weakness.trim()}
                 className={`w-full py-4 rounded-lg font-syne font-black text-lg tracking-wider uppercase transition-all duration-300 ${
                    loading || !weakness.trim() 
                     ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                     : 'bg-primary text-on-primary hover:bg-emerald-400 shadow-teal-glow'
                 }`}
               >
                 {loading ? 'Preparing Session...' : 'Start Training'}
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
                   <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">Active Training</span>
                </div>
                
                <div className="flex gap-8">
                   <div className="flex flex-col items-end">
                     <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-widest text-right w-full">Coverage</span>
                     <span className={`font-mono text-xs font-bold leading-7 ${isSaturated ? 'text-primary' : 'text-yellow-500'}`}>
                       {isSaturated ? '100% TARGETED' : 'PARTIAL COVERAGE'}
                     </span>
                   </div>
                   
                   {status !== 'idle' && (
                     <>
                       <div className="flex flex-col items-end">
                         <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-widest">WPM</span>
                         <span className="font-syne font-black text-2xl text-primary">{Math.floor(currentWPM)}</span>
                       </div>
                       <div className="flex flex-col items-end">
                         <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-widest">Accuracy</span>
                         <span className="font-syne font-black text-2xl text-neutral-100">{accuracy.toFixed(1)}%</span>
                       </div>
                     </>
                   )}
                </div>
             </div>

             {/* Typing Component */}
              <div className={`relative custom-glass p-8 rounded-xl border transition-all duration-500 mb-8 min-h-[160px] ${isTimeWarpActive ? 'border-primary/50 shadow-teal-glow translate-y-[-2px]' : 'border-neutral-800/80'}`}>
                 <WordDisplay 
                   words={words} 
                   currentWordIndex={currentWordIndex} 
                   currentCharIndex={currentCharIndex} 
                   status={status} 
                   isTimeWarpActive={isTimeWarpActive}
                 />
              </div>

              {/* Analysis Insights */}
              {insights && (
                 <div className="mb-12 p-6 bg-primary/5 border-l-2 border-primary rounded-r-xl animate-fade-in flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-1">analytics</span>
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest leading-none">Training Insight</span>
                       <p className="text-sm font-inter text-neutral-300 leading-relaxed italic">"{insights}"</p>
                    </div>
                 </div>
              )}

             {/* Footer Actions */}
             <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <button 
                  onClick={() => reset(passage)}
                  className="px-8 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-primary hover:border-primary/50 transition-colors flex items-center gap-2 uppercase tracking-widest"
                >
                   <span className="material-symbols-outlined text-[16px]">refresh</span> Restart Session
                </button>

                <button 
                  onClick={() => { setPassage(''); setWeakness(''); }}
                  className="px-8 py-3 rounded-lg bg-transparent border border-neutral-800 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-2 uppercase tracking-widest"
                >
                   Change Target
                </button>
             </div>

          </div>
        )}

      </main>
    </PageWrapper>
  );
};

export default Trainer;
