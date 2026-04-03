import { useState, useCallback, useEffect, useRef } from 'react';
import { calculateWPM, calculateConsistency, calculateAccuracy } from '../lib/wpmCalc';

const generateWords = (passage) => {
  return passage.split(' ').map(word => ({
    text: word,
    letters: word.split('').map(char => ({ char, state: 'untouched' })),
    state: 'untouched' // 'untouched', 'typed', 'skipped-with-errors'
  }));
};

export const useTyping = (initialPassage) => {
  const [words, setWords] = useState(() => generateWords(initialPassage));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, running, finished
  const [startTime, setStartTime] = useState(null);
  const [keystrokes, setKeystrokes] = useState([]);
  const [errors, setErrors] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]);
  
  const wpmIntervalRef = useRef(null);

  const reset = useCallback((newPassage = initialPassage) => {
    setWords(generateWords(newPassage));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setStatus('idle');
    setStartTime(null);
    setKeystrokes([]);
    setErrors(0);
    setWpmHistory([]);
    if (wpmIntervalRef.current) cancelAnimationFrame(wpmIntervalRef.current);
  }, [initialPassage]);

  // Derived values
  const correctChars = words.reduce((acc, word) => {
    return acc + word.letters.filter(l => l.state === 'correct').length;
  }, 0) + words.slice(0, currentWordIndex).filter(w => w.state === 'typed').length; // spaces count as correct if word typed

  const currentWPM = startTime && status === 'running'
    ? calculateWPM(correctChars, (Date.now() - startTime) / 60000)
    : 0;

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (status === 'finished') return;

    const key = e.key;
    if (key.length === 1 || key === 'Backspace' || key === ' ') {
      e.preventDefault();
      
      if (status === 'idle') {
        setStatus('running');
        setStartTime(Date.now());
      }

      setWords(prevWords => {
        const newWords = [...prevWords];
        const currentWord = { ...newWords[currentWordIndex] };
        
        if (key === 'Backspace') {
          if (currentCharIndex > 0) {
            currentWord.letters = [...currentWord.letters];
            const charToReset = currentWord.letters[currentCharIndex - 1];
            if (charToReset.state === 'incorrect') {
                // Keep error count logic separate, just reset state
            }
            currentWord.letters[currentCharIndex - 1] = { ...charToReset, state: 'untouched' };
            newWords[currentWordIndex] = currentWord;
            setCurrentCharIndex(currentCharIndex - 1);
          } else if (currentWordIndex > 0) {
            const prevWord = newWords[currentWordIndex - 1];
            if (prevWord.state === 'skipped-with-errors') {
              setCurrentWordIndex(currentWordIndex - 1);
              setCurrentCharIndex(prevWord.letters.length);
              newWords[currentWordIndex - 1] = { ...prevWord, state: 'untouched' };
            }
          }
        } else if (key === ' ') {
          if (currentCharIndex > 0) {
            const hasErrors = currentWord.letters.some(l => l.state === 'incorrect');
            const isComplete = currentCharIndex === currentWord.letters.length;
            
            if (hasErrors || !isComplete) {
              currentWord.state = 'skipped-with-errors';
            } else {
              currentWord.state = 'typed';
            }
            newWords[currentWordIndex] = currentWord;
            setCurrentWordIndex(currentWordIndex + 1);
            setCurrentCharIndex(0);
          }
        } else {
          // Regular character typing
          if (currentCharIndex < currentWord.letters.length) {
            currentWord.letters = [...currentWord.letters];
            const expectedChar = currentWord.letters[currentCharIndex].char;
            const isCorrect = key === expectedChar;
            
            currentWord.letters[currentCharIndex] = {
              ...currentWord.letters[currentCharIndex],
              state: isCorrect ? 'correct' : 'incorrect'
            };

            if (!isCorrect) setErrors(e => e + 1);

            setKeystrokes(prev => [...prev, { char: key, correct: isCorrect, timestamp: Date.now() }]);
            newWords[currentWordIndex] = currentWord;
            setCurrentCharIndex(currentCharIndex + 1);
          } else {
             // Typed past word length (extra incorrect characters)
             // simplified for this implementaton to just bounce or ignore
          }
        }
        
        return newWords;
      });
    }
  }, [status, currentWordIndex, currentCharIndex, startTime]);

  // WPM Sampling via RAF
  useEffect(() => {
    let lastSampleTime = Date.now();
    
    const sampleWPM = () => {
      if (status !== 'running') return;
      const now = Date.now();
      if (now - lastSampleTime >= 1000) {
        lastSampleTime = now;
        setWpmHistory(prev => {
           const elapsedMinutes = (now - startTime) / 60000;
           const current = calculateWPM(correctChars, elapsedMinutes);
           return [...prev, current];
        });
      }
      wpmIntervalRef.current = requestAnimationFrame(sampleWPM);
    };

    if (status === 'running') {
      wpmIntervalRef.current = requestAnimationFrame(sampleWPM);
    }

    return () => cancelAnimationFrame(wpmIntervalRef.current);
  }, [status, startTime, correctChars]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const endTest = useCallback(() => {
    setStatus('finished');
    cancelAnimationFrame(wpmIntervalRef.current);
  }, []);

  return {
    words,
    currentWordIndex,
    currentCharIndex,
    status,
    currentWPM,
    errors,
    keystrokes,
    wpmHistory,
    accuracy: calculateAccuracy(correctChars, keystrokes.length),
    consistency: calculateConsistency(wpmHistory),
    reset,
    endTest
  };
};
