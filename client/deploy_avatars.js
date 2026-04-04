const fs = require('fs');
const path = require('path');

const srcDir = "C:\\Users\\sudee\\.gemini\\antigravity\\brain\\9e10ae22-4c16-436b-b883-8b0296b285e3";
const destDir = "c:\\Projects\\TypeCraft\\client\\public\\avatars";

const mapping = {
  "avatar_3_signal_breaker_1775305946316.png": "avatar_3.png",
  "avatar_4_neural_ghost_1775305966923.png": "avatar_4.png",
  "avatar_5_data_reaper_1775305984060.png": "avatar_5.png",
  "avatar_6_void_watcher_1775306002446.png": "avatar_6.png",
  "avatar_7_chrome_rider_1775306028620.png": "avatar_7.png",
  "avatar_8_pulse_medic_1775306046547.png": "avatar_8.png"
};

Object.entries(mapping).forEach(([src, dest]) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Failed to copy ${src}:`, err.message);
  }
});
