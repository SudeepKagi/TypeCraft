import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const Caret = ({ currentWordRef, currentCharIndex, isTimeWarpActive }) => {
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentWordRef.current) {
      const letters = currentWordRef.current.querySelectorAll('span');
      if (letters && letters[currentCharIndex]) {
        const letter = letters[currentCharIndex];
        const rect = letter.getBoundingClientRect();
        
        // Find parent container (WordDisplay) to get relative positioning
        const container = currentWordRef.current.closest('.flex-wrap');
        const parentRect = container ? container.getBoundingClientRect() : currentWordRef.current.parentElement.getBoundingClientRect();
        
        setCaretPos({
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top + 6
        });
      } else if (letters && letters.length > 0) {
        // Caret at end of word
        const letter = letters[letters.length - 1];
        const rect = letter.getBoundingClientRect();
        const container = currentWordRef.current.closest('.flex-wrap');
        const parentRect = container ? container.getBoundingClientRect() : currentWordRef.current.parentElement.getBoundingClientRect();
        
        setCaretPos({
          x: rect.right - parentRect.left,
          y: rect.top - parentRect.top + 6
        });
      }
    }
  }, [currentCharIndex, currentWordRef]);

  return (
    <motion.span
      className={`absolute bg-primary h-7 shadow-teal-glow transition-all duration-300 ${isTimeWarpActive ? 'w-[4px] scale-y-125 brightness-150 z-10' : 'w-[2px] caret-blink'}`}
      animate={{ x: caretPos.x, y: caretPos.y }}
      transition={{ 
        x: { type: "tween", ease: "linear", duration: 0.05 },
        y: { type: "spring", stiffness: 500, damping: 40, mass: 0.1 },
        default: { duration: 0.1 }
      }}
      style={{ left: 0, top: 0 }}
    />
  );
};
