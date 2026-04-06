import React, { useEffect, useState, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';
import useAuthStore from '../store/authStore';
import { generatePassage } from '../lib/contentLibrary';
import { Logo } from '../components/ui/Logo';

const ResultsOverlay = ({ wpm, accuracy, xp, onRestart }) => {
  useEffect(() => {
    const handleKey = (e) => {
       if (e.key === 'Enter' || e.key === 'Escape') {
         onRestart();
       }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in px-4">
       <div className="max-w-xl w-full p-8 md:p-12 custom-glass border border-primary/20 rounded-3xl text-center shadow-teal-glow relative overflow-hidden">
          {/* Background Glow Decoration */}
          <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />

          <div className="flex flex-col items-center gap-4 mb-6 relative z-10">
             <Logo size={64} />
             <h2 className="font-heading font-black md:text-5xl text-neutral-100 tracking-tighter uppercase tracking-widest">Results</h2>
          </div>
          <div className="w-12 h-1 bg-primary/20 mx-auto mb-10 relative z-10 rounded-full" />
          
          <div className="grid grid-cols-2 gap-8 md:gap-12 mb-12 relative z-10">
             <div className="flex flex-col gap-2 overflow-hidden">
                <span className="text-5xl md:text-6xl font-heading font-black">{wpm}</span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest whitespace-nowrap">Words Per Minute</span>
             </div>
             <div className="flex flex-col gap-2 overflow-hidden">
                <span className="text-5xl md:text-6xl font-heading font-black">{accuracy}<span className="text-3xl text-neutral-600">%</span></span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest whitespace-nowrap">Accuracy Rate</span>
             </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-10 flex items-center justify-between relative z-10">
             <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-[28px]">bolt</span>
                <div className="text-left">
                   <h3 className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.2em]">XP Gained</h3>
                   <p className="text-[10px] font-inter text-neutral-500 italic uppercase">Skill development confirmed.</p>
                </div>
             </div>
             <span className="text-3xl md:text-4xl font-heading font-black">+{xp} XP</span>
          </div>

          <div className="flex flex-col items-center gap-4 relative z-10">
             <button 
                onClick={onRestart}
                className="w-full py-5 bg-primary text-on-primary font-heading font-black hover:bg-emerald-400 transition-all shadow-teal-glow group active:scale-95"
             >
                RESTART
             </button>
             <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-[0.3em] opacity-40">
                <span className="bg-neutral-800 px-2 py-1 rounded border border-white/10 uppercase">Press Enter to Start New Test</span>
             </div>
          </div>
       </div>
    </div>
  );
};

const Play = () => {
  const [selectedMode, setSelectedMode] = useState('words');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [passage, setPassage] = useState(() => generatePassage('words', 60));
  const [isTimeWarpActive, setIsTimeWarpActive] = useState(false);
  
  const { 
    words, currentWordIndex, currentCharIndex, status, currentWPM, 
    accuracy, reset, endTest, keystrokes 
  } = useTyping(passage);
  
  const [timeLeft, setTimeLeft] = useState(selectedDuration);
  const userId = useAuthStore(state => state.userId);
  const addXP = useAuthStore(state => state.addXP);

  const handleRestart = useCallback((mode = selectedMode, duration = selectedDuration) => {
    const wordTarget = Math.floor(duration * 3.5) + 20;
    const newPassage = generatePassage(mode, wordTarget);
    setPassage(newPassage);
    reset(newPassage);
    setTimeLeft(duration);
    setIsTimeWarpActive(false);
  }, [selectedMode, selectedDuration, reset]);

  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(selectedDuration);
    }
  }, [selectedDuration, status]);

  const potentialXp = Math.max(1, Math.floor(currentWPM * (accuracy / 100) * (selectedDuration / 60)));

  useEffect(() => {
    if (status === 'running' && currentWPM > 100) {
      setIsTimeWarpActive(true);
    } else if (currentWPM < 85) {
      setIsTimeWarpActive(false);
    }
  }, [currentWPM, status]);

  useEffect(() => {
    let timer;
    if (status === 'running' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, endTest]);

  useEffect(() => {
    if (status === 'finished' && userId) {
      fetch('http://localhost:4000/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          wpm: currentWPM,
          accuracy,
          duration: selectedDuration - timeLeft,
          selectedDuration: selectedDuration,
          mode: selectedMode,
          keystrokes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.xpGained) {
          addXP(data.xpGained);
        }
      })
      .catch(err => console.error('Failed to save solo result:', err));
    }
  }, [status, userId, currentWPM, accuracy, timeLeft, addXP, selectedDuration, selectedMode]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleRestart]);

  const progressPercent = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <PageWrapper>
      <main className="pt-32 pb-20 flex flex-col items-center px-4 max-w-[860px] mx-auto min-h-screen">
        {/* Mode & Duration Selectors */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex bg-[#111111] border border-white/5 p-1 rounded-xl">
            {['words', 'quotes', 'code'].map((mode) => (
              <button 
                key={mode}
                onClick={() => {
                  setSelectedMode(mode);
                  handleRestart(mode, selectedDuration);
                }}
                className={`px-5 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all duration-200 ${selectedMode === mode ? 'bg-primary text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-200'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex bg-[#111111] border border-white/5 p-1 rounded-xl">
            {[15, 30, 60, 120].map((dur) => (
              <button 
                key={dur}
                onClick={() => {
                  setSelectedDuration(dur);
                  handleRestart(selectedMode, dur);
                }}
                className={`px-4 py-2 text-xs font-mono rounded-lg transition-all duration-200 ${selectedDuration === dur ? 'bg-primary text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-200'}`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-900 mb-8 relative overflow-hidden rounded-full border border-white/5">
          <div 
            className="absolute inset-y-0 left-0 bg-primary/40 transition-all duration-1000 ease-linear shadow-teal-glow"
             style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Typing Arena Canvas */}
        <div className={`w-full transition-all duration-500 ${isTimeWarpActive ? 'scale-[1.02] drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]' : ''}`}>
          <WordDisplay 
            words={words} 
            currentWordIndex={currentWordIndex} 
            currentCharIndex={currentCharIndex}
            isTimeWarpActive={isTimeWarpActive} 
          />
        </div>

        {/* Action / Error Details */}
        <div className="mt-8 flex gap-6 text-[10px] font-mono items-center opacity-40 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-100"></span>
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Error</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`w-full mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 p-8 border border-white/5 rounded-2xl transition-colors duration-500 ${isTimeWarpActive ? 'bg-primary/5 border-primary/20' : 'bg-neutral-950/20'}`}>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-heading font-black text-neutral-100 tracking-tighter">{currentWPM}</span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">WPM</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-heading font-black text-neutral-100 tracking-tighter">{accuracy}<span className="text-2xl text-neutral-500">%</span></span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Accuracy</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-heading font-black text-primary tracking-tighter shadow-teal-glow">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Remaining</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className={`font-heading font-black tracking-tighter transition-colors ${isTimeWarpActive ? 'text-primary animate-pulse' : 'text-neutral-400'}`}>
              +{potentialXp}
            </span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Potential_XP</span>
          </div>
        </div>

        {status === 'finished' && (
          <ResultsOverlay 
            wpm={currentWPM}
            accuracy={accuracy}
            xp={potentialXp}
            onRestart={() => handleRestart()}
          />
        )}

        <div className="mt-20 group cursor-pointer flex items-center gap-4 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-widest" onClick={() => handleRestart()}>
          <span className="bg-neutral-900 px-2 py-1 rounded border border-white/10 group-hover:border-primary/40 transition-colors">Esc</span>
          <span>to_Restart_Test</span>
        </div>
      </main>
    </PageWrapper>
  );
};

export default Play;
