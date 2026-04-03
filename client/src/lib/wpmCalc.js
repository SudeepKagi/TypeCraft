export const calculateWPM = (correctChars, elapsedMinutes) => {
  if (elapsedMinutes <= 0) return 0;
  return Math.round((correctChars / 5) / elapsedMinutes);
};

export const calculateRawWPM = (totalChars, elapsedMinutes) => {
  if (elapsedMinutes <= 0) return 0;
  return Math.round((totalChars / 5) / elapsedMinutes);
};

export const calculateAccuracy = (correctChars, totalChars) => {
  if (totalChars === 0) return 100;
  return Number(((correctChars / totalChars) * 100).toFixed(2));
};

export const calculateConsistency = (wpmHistory) => {
  if (!wpmHistory || wpmHistory.length < 2) return 100;
  
  const mean = wpmHistory.reduce((sum, val) => sum + val, 0) / wpmHistory.length;
  if (mean === 0) return 100;

  const squaredDifferences = wpmHistory.map(wpm => Math.pow(wpm - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / wpmHistory.length;
  const stddev = Math.sqrt(variance);
  
  const consistency = 100 - ((stddev / mean) * 100);
  return Number(Math.max(0, Math.min(100, consistency)).toFixed(2));
};
