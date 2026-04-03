import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Caret = ({ currentWordRef, currentCharIndex }) => {
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentWordRef.current) {
      const letters = currentWordRef.current.querySelectorAll('span');
      if (letters && letters[currentCharIndex]) {
        const letter = letters[currentCharIndex];
        const rect = letter.getBoundingClientRect();
        const parentRect = currentWordRef.current.parentElement.getBoundingClientRect();
        
        setCaretPos({
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top
        });
      } else if (letters && letters.length > 0) {
          // Caret at end of word
          const letter = letters[letters.length - 1];
          const rect = letter.getBoundingClientRect();
          const parentRect = currentWordRef.current.parentElement.getBoundingClientRect();
          
          setCaretPos({
            x: rect.right - parentRect.left,
            y: rect.top - parentRect.top
          });
      }
    }
  }, [currentCharIndex, currentWordRef]);

  return (
    <motion.span
      className="absolute bg-primary w-[2px] h-7 shadow-[0_0_8px_rgba(29,158,117,0.8)] caret-blink"
      animate={{ x: caretPos.x, y: caretPos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.5 }}
      style={{ left: 0, top: 0 }}
    />
  );
};
