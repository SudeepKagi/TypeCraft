import React, { useEffect, useState, useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';
import useAuthStore from '../store/authStore';
import { generatePassage } from '../lib/contentLibrary';

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
    // Generate approx 3.5 words per second + 20 buffer
    const wordTarget = Math.floor(duration * 3.5) + 20;
    const newPassage = generatePassage(mode, wordTarget);
    setPassage(newPassage);
    reset(newPassage);
    setTimeLeft(duration);
    setIsTimeWarpActive(false);
  }, [selectedMode, selectedDuration, reset]);

  // Sync timer with duration selection
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(selectedDuration);
    }
  }, [selectedDuration, status]);

  // Time Warp and XP Logic
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

  // Handle saving results
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

  // Auto-refresh logic (5-second window to view stats)
  useEffect(() => {
    let refreshTimer;
    if (status === 'finished') {
       refreshTimer = setTimeout(() => {
         handleRestart();
       }, 5000); 
    }
    return () => clearTimeout(refreshTimer);
  }, [status, handleRestart]);

  // Restart shortcut
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
            <span className="font-syne text-5xl font-black text-neutral-100 tracking-tighter">{currentWPM}</span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Words_Per_Minute</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-syne text-5xl font-black text-neutral-100 tracking-tighter">{accuracy}<span className="text-2xl text-neutral-500">%</span></span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Precision_Rate</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-syne text-5xl font-black text-primary tracking-tighter shadow-teal-glow">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Time_Remaining</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className={`font-syne text-5xl font-black tracking-tighter transition-colors ${isTimeWarpActive ? 'text-primary animate-pulse' : 'text-neutral-400'}`}>
              +{potentialXp}
            </span>
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Potential_XP</span>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-20 group cursor-pointer flex items-center gap-4 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-widest" onClick={() => handleRestart()}>
          <span className="bg-neutral-900 px-2 py-1 rounded border border-white/10 group-hover:border-primary/40 transition-colors">Esc</span>
          <span>to_Initialize_Reboot</span>
        </div>
      </main>
    </PageWrapper>
  );
};

export default Play;
