import React, { useRef, useEffect } from 'react';
import { Caret } from './Caret';

const Word = ({ word, isCurrent, wordRef, isTimeWarpActive }) => {
  return (
    <div 
      ref={isCurrent ? wordRef : null} 
      className={`inline-block mr-2 mb-4 transition-all duration-300 ${word.state === 'skipped-with-errors' ? 'underline decoration-error' : ''} ${isTimeWarpActive && isCurrent ? 'scale-110 brightness-125' : ''}`}
    >
      {word.letters.map((l, i) => {
        let colorClass = 'text-outline-variant';
        if (l.state === 'correct') colorClass = isTimeWarpActive ? 'text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-on-surface';
        if (l.state === 'incorrect') colorClass = 'text-error';
        
        return (
          <span key={i} className={`${colorClass} transition-all duration-200`}>
            {l.char}
          </span>
        );
      })}
    </div>
  );
};

export const WordDisplay = ({ words, currentWordIndex, currentCharIndex, isTimeWarpActive }) => {
  const currentWordRef = useRef(null);
  const containerRef = useRef(null);

  // Smooth scroll 3 lines
  useEffect(() => {
    if (currentWordRef.current && containerRef.current) {
        const currentTop = currentWordRef.current.offsetTop;
        const containerTop = containerRef.current.offsetTop;
        const relativeTop = currentTop - containerTop;
        
        // If word is getting lower than 3 lines down (approx 3 * 36px), scroll up
        if (relativeTop > 100) {
             containerRef.current.style.transform = `translateY(-${relativeTop - 36}px)`;
        } else if (currentWordIndex === 0) {
             containerRef.current.style.transform = `translateY(0px)`;
        }
    }
  }, [currentWordIndex]);

  return (
    <div className="relative w-full overflow-hidden min-h-[160px] flex items-start mt-8">
      <div 
        ref={containerRef}
        className="font-mono text-2xl md:text-3xl leading-[1.6] select-none text-left w-full tracking-wide transition-transform duration-150 ease-out flex flex-wrap"
      >
        {words.map((word, index) => (
          <Word 
            key={index} 
            word={word} 
            isCurrent={index === currentWordIndex} 
            wordRef={currentWordRef}
            isTimeWarpActive={isTimeWarpActive}
          />
        ))}
        <Caret currentWordRef={currentWordRef} currentCharIndex={currentCharIndex} isTimeWarpActive={isTimeWarpActive} />
      </div>
    </div>
  );
};
