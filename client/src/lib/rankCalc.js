export const calculateRank = (wpm, accuracy = 100) => {
  if (wpm >= 130 && accuracy >= 95) return { name: 'VORTEX', color: '#6366f1', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]' };
  if (wpm >= 100) return { name: 'GHOST', color: '#10b981', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' };
  if (wpm >= 70) return { name: 'ACE', color: '#3b82f6', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' };
  if (wpm >= 40) return { name: 'PILOT', color: '#f59e0b', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' };
  return { name: 'ROOKIE', color: '#94a3b8', glow: 'none' };
};
