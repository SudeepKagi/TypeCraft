import { useState, useCallback, useEffect, useRef } from 'react';
import { calculateWPM, calculateConsistency, calculateAccuracy } from '../lib/wpmCalc';
import useSettingsStore from '../store/settingsStore';

// Sound effects disabled per system update

const generateWords = (passage) => {
  return passage.split(' ').map(word => ({
    text: word,
    letters: word.split('').map(char => ({ char, state: 'untouched' })),
    state: 'untouched' // 'untouched', 'typed', 'skipped-with-errors'
  }));
};

const compareChars = (pressed, expected) => {
  if (pressed === expected) return true;
  // Handle common dash/hyphen variants to prevent false negatives
  const hyphens = ['-', '–', '—', '−'];
  if (hyphens.includes(pressed) && hyphens.includes(expected)) return true;
  return false;
};

export const useTyping = (initialPassage) => {
  const [session, setSession] = useState({
    words: generateWords(initialPassage),
    currentWordIndex: 0,
    currentCharIndex: 0,
    status: 'idle',
    startTime: null,
    keystrokes: [],
    errors: 0,
    currentWPM: 0,
    wpmHistory: []
  });
  
  const wpmIntervalRef = useRef(null);

  const reset = useCallback((newPassage = initialPassage) => {
    setSession({
      words: generateWords(newPassage),
      currentWordIndex: 0,
      currentCharIndex: 0,
      status: 'idle',
      startTime: null,
      keystrokes: [],
      errors: 0,
      currentWPM: 0,
      wpmHistory: []
    });
    if (wpmIntervalRef.current) cancelAnimationFrame(wpmIntervalRef.current);
  }, [initialPassage]);

  // Derived values
  const correctChars = session.words.reduce((acc, word) => {
    return acc + (word.letters ? word.letters.filter(l => l.state === 'correct').length : 0);
  }, 0);

  // Update WPM in a side effect or calculation
  useEffect(() => {
    if (session.status === 'running' && session.startTime) {
      const now = Date.now();
      const elapsedMs = Math.max(1000, now - session.startTime); // Clamp to 1s min to prevent spikes
      const elapsedMinutes = elapsedMs / 60000;
      setSession(prev => ({
        ...prev,
        currentWPM: calculateWPM(correctChars, elapsedMinutes)
      }));
    }
  }, [session.status, session.startTime, correctChars]);

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (session.status === 'finished') return;

    // Sound logic removed per system update

    const key = e.key;
    if (key.length === 1 || key === 'Backspace' || key === ' ') {
      e.preventDefault();
      
      setSession(prev => {
        if (prev.status === 'finished') return prev;
        
        const newSession = { ...prev };
        if (newSession.status === 'idle') {
          newSession.status = 'running';
          newSession.startTime = Date.now();
        }

        const newWords = [...newSession.words];
        // Safety check to ensure we don't access out of bounds index
        if (newSession.currentWordIndex >= newWords.length) return prev;
        
        const currentWord = { ...newWords[newSession.currentWordIndex] };
        if (!currentWord || !currentWord.letters) return prev;

        currentWord.letters = [...currentWord.letters];
        
        if (key === 'Backspace') {
          if (newSession.currentCharIndex > 0) {
            currentWord.letters[newSession.currentCharIndex - 1] = { 
              ...currentWord.letters[newSession.currentCharIndex - 1], 
              state: 'untouched' 
            };
            newWords[newSession.currentWordIndex] = currentWord;
            newSession.currentCharIndex -= 1;
          } else if (newSession.currentWordIndex > 0) {
            const prevWord = { ...newWords[newSession.currentWordIndex - 1] };
            if (prevWord.state === 'skipped-with-errors') {
              newSession.currentWordIndex -= 1;
              newSession.currentCharIndex = prevWord.letters.length;
              prevWord.state = 'untouched';
              newWords[newSession.currentWordIndex] = prevWord;
            }
          }
        } else if (key === ' ') {
          if (newSession.currentCharIndex > 0) {
            const hasErrors = currentWord.letters.some(l => l.state === 'incorrect');
            const isComplete = newSession.currentCharIndex === currentWord.letters.length;
            
            currentWord.state = (hasErrors || !isComplete) ? 'skipped-with-errors' : 'typed';
            newWords[newSession.currentWordIndex] = currentWord;
            newSession.currentWordIndex += 1;
            newSession.currentCharIndex = 0;
          }
        } else {
          if (newSession.currentCharIndex < currentWord.letters.length) {
            const expectedChar = currentWord.letters[newSession.currentCharIndex].char;
            const isCorrect = compareChars(key, expectedChar);
            
            currentWord.letters[newSession.currentCharIndex] = {
              ...currentWord.letters[newSession.currentCharIndex],
              state: isCorrect ? 'correct' : 'incorrect'
            };

            if (!isCorrect) newSession.errors += 1;
            newSession.keystrokes = [...newSession.keystrokes, { char: key, correct: isCorrect, timestamp: Date.now() }];
            newWords[newSession.currentWordIndex] = currentWord;
            newSession.currentCharIndex += 1;
          }
        }
        
        newSession.words = newWords;

        // Check if finished
        const isLastWord = newSession.currentWordIndex === newSession.words.length - 1;
        const lastWord = newSession.words[newSession.words.length - 1];
        const lastWordFinished = lastWord.letters.every(l => l.state !== 'untouched');

        if (newSession.currentWordIndex === newSession.words.length || (isLastWord && lastWordFinished)) {
           newSession.status = 'finished';
        }
        
        return newSession;
      });
    }
  }, [session.status]);

  // WPM Sampling via RAF
  useEffect(() => {
    let lastSampleTime = Date.now();
    
    const sampleWPM = () => {
      if (session.status !== 'running') return;
      const now = Date.now();
      if (now - lastSampleTime >= 1000) {
        lastSampleTime = now;
        setSession(prev => {
           const elapsedMinutes = Math.max(1000, now - prev.startTime) / 60000;
           const current = calculateWPM(correctChars, elapsedMinutes);
           return {
             ...prev,
             wpmHistory: [...prev.wpmHistory, current]
           };
        });
      }
      wpmIntervalRef.current = requestAnimationFrame(sampleWPM);
    };

    if (session.status === 'running') {
      wpmIntervalRef.current = requestAnimationFrame(sampleWPM);
    }

    return () => cancelAnimationFrame(wpmIntervalRef.current);
  }, [session.status, session.startTime, correctChars]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const endTest = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'finished' }));
    cancelAnimationFrame(wpmIntervalRef.current);
  }, []);

  return {
    words: session.words,
    currentWordIndex: session.currentWordIndex,
    currentCharIndex: session.currentCharIndex,
    status: session.status,
    currentWPM: session.currentWPM,
    errors: session.errors,
    keystrokes: session.keystrokes,
    wpmHistory: session.wpmHistory,
    accuracy: calculateAccuracy(correctChars, session.keystrokes.length),
    consistency: calculateConsistency(session.wpmHistory),
    reset,
    endTest
  };
};
