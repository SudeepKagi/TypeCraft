import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';

// Added a longer passage to properly trigger scrolling
const samplePassage = "mechanical keyboard switches provide tactile feedback speed and precision are essential for high performance typists who seek the flow state of mind where thoughts translate directly into digital reality without hesitation or lag rhythm is the foundation of consistency across prolonged periods of intense coding sessions";

const Play = () => {
  const { 
    words, currentWordIndex, currentCharIndex, status, currentWPM, 
    accuracy, reset, endTest 
  } = useTyping(samplePassage);
  
  const [timeLeft, setTimeLeft] = useState(60);

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

  // Restart shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        reset();
        setTimeLeft(60);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [reset]);

  const progressPercent = ((60 - timeLeft) / 60) * 100;

  return (
    <PageWrapper>
      <main className="pt-32 pb-20 flex flex-col items-center px-4 max-w-[860px] mx-auto min-h-screen">
        {/* Mode & Duration Selectors */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex bg-surface-container-low p-1 rounded-xl">
            <button className="px-5 py-2 text-xs font-mono font-bold bg-primary text-on-primary rounded-lg transition-all duration-200">Words</button>
            <button className="px-5 py-2 text-xs font-mono text-outline hover:text-on-surface transition-all duration-200">Quotes</button>
            <button className="px-5 py-2 text-xs font-mono text-outline hover:text-on-surface transition-all duration-200">Code</button>
            <button className="px-5 py-2 text-xs font-mono text-outline hover:text-on-surface transition-all duration-200">Voice</button>
          </div>
          <div className="flex bg-surface-container-low p-1 rounded-xl">
            <button className="px-4 py-2 text-xs font-mono text-outline hover:text-on-surface transition-all duration-200">15</button>
            <button className="px-4 py-2 text-xs font-mono text-outline hover:text-on-surface transition-all duration-200">30</button>
            <button className="px-4 py-2 text-xs font-mono font-bold bg-primary text-on-primary rounded-lg transition-all duration-200">60</button>
            <button className="px-4 py-2 text-xs font-mono text-outline hover:text-on-surface transition-all duration-200">120</button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-neutral-900 mb-8 relative overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-primary/40 transition-all duration-1000 ease-linear"
             style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Typing Arena Canvas */}
        <WordDisplay 
          words={words} 
          currentWordIndex={currentWordIndex} 
          currentCharIndex={currentCharIndex} 
        />

        {/* Action / Error Details */}
        <div className="mt-8 flex gap-4 text-xs font-mono items-center opacity-40">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-on-surface"></span>
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            <span className="underline decoration-error">Incorrect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
            <span>Remaining</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-1">
            <span className="font-syne text-5xl font-extrabold text-on-surface">{currentWPM}</span>
            <span className="font-mono text-xs text-on-surface-variant tracking-widest uppercase">Words Per Minute</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-syne text-5xl font-extrabold text-on-surface">{accuracy}<span className="text-2xl text-on-surface-variant">%</span></span>
            <span className="font-mono text-xs text-on-surface-variant tracking-widest uppercase">Accuracy</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-syne text-5xl font-extrabold text-primary">00:{timeLeft.toString().padStart(2, '0')}</span>
            <span className="font-mono text-xs text-on-surface-variant tracking-widest uppercase">Time Remaining</span>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-20 custom-glass border border-outline-variant/10 px-6 py-3 rounded-xl flex items-center gap-4 text-xs font-mono text-on-surface-variant">
          <span className="bg-surface-container-high px-2 py-1 rounded border border-outline-variant/30 text-on-surface">Esc</span>
          <span>to Restart Test</span>
        </div>
      </main>
    </PageWrapper>
  );
};

export default Play;
