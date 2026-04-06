require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const raceHandler = require('./src/handlers/raceHandler');

const app = express();
const server = http.createServer(app);

// Trust proxy for secure cookies in production (Render/Vercel)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const prisma = new PrismaClient();
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json());

// Pass prisma to requests
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Configure Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === 'production', // Trust reverse proxy for HTTPS
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Use 'lax' even in prod because it is now "first-party" via proxy
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Mount Routes
const authRoutes = require('./src/routes/auth')(prisma);
app.use('/auth', authRoutes);

// Consolidation: /auth/me is handled by the auth routes router.
// Removing redundant index-level listener to prevent conflicts.

// Complete Onboarding
app.post('/api/user/onboarding', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  const { username, avatarId, avatarUrl } = req.body;
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username: username || req.user.username,
        avatarId: avatarId || req.user.avatarId,
        avatarUrl: avatarUrl || req.user.avatarUrl,
        onboardingCompleted: true
      }
    });

    // Update session user
    req.login(updatedUser, (err) => {
      if (err) return res.status(500).json({ error: 'Session update failed' });
      res.json({ success: true, user: updatedUser });
    });
  } catch (error) {
    console.error('Onboarding Error:', error);
    if (error.code === 'P2002') {
       return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Update Profile
app.post('/api/user/update', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  const { username, avatarUrl } = req.body;
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username: username || req.user.username,
        avatarUrl: avatarUrl || req.user.avatarUrl
      }
    });

    // Update session user
    req.login(updatedUser, (err) => {
      if (err) return res.status(500).json({ error: 'Session update failed' });
      res.json({ success: true, user: updatedUser });
    });
  } catch (error) {
    console.error('Update Error:', error);
    if (error.code === 'P2002') {
       return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Register or get user
app.post('/api/users', async (req, res) => {
  const { username, email, avatarUrl } = req.body;
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { username, avatarUrl },
      create: { username, email, avatarUrl }
    });
    res.json(user);
  } catch (error) {
    console.error('[User sync error]', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Save result and update XP
app.post('/api/results', async (req, res) => {
  const { userId, wpm, accuracy, duration, selectedDuration, mode, keystrokes } = req.body;

  try {
    const result = await prisma.raceResult.create({
      data: {
        wpm: parseFloat(wpm),
        accuracy: parseFloat(accuracy),
        userId
      }
    });

    // Update CharacterStats if keystrokes provided
    if (keystrokes && Array.isArray(keystrokes)) {
      // Group by char first for efficient DB updates? 
      // For now, iterative upsert is safe for small sets (keystrokes is usually ~50-300 items)
      for (const stroke of keystrokes) {
        if (stroke.char && stroke.char.length === 1) {
          const char = stroke.char.toLowerCase();
          await prisma.characterStat.upsert({
            where: { userId_char: { userId, char } },
            update: {
              correctCount: { increment: stroke.correct ? 1 : 0 },
              totalCount: { increment: 1 }
            },
            create: {
              userId,
              char,
              correctCount: stroke.correct ? 1 : 0,
              totalCount: 1
            }
          });
        }
      }
    }

    const activeDuration = parseInt(duration) || 60;
    const challengeDuration = parseInt(selectedDuration) || activeDuration;

    if (mode === 'solo' || mode === 'trainer' || mode === 'words' || mode === 'quotes' || mode === 'code') {
      await prisma.typingSession.create({
        data: {
          wpm: parseFloat(wpm),
          accuracy: parseFloat(accuracy),
          duration: activeDuration,
          mode: mode || 'time',
          userId
        }
      });
    }

    // Calculate XP: (WPM * Accuracy / 100) * (ChallengeDuration / 60)
    // Trainer passages are shorter, so we treat them as fixed 30s effort for XP purposes if duration not provided
    const weightFactor = mode === 'trainer' ? 0.5 : (challengeDuration / 60);
    const rawXp = parseFloat(wpm) * (parseFloat(accuracy) / 100) * weightFactor;
    const xpGained = Math.max(1, Math.floor(rawXp));
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpGained }
      }
    });

    res.json({ result, xpGained, totalXp: updatedUser.xp });
  } catch (error) {
    console.error('[Results Error]', error);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// Get user stats for dashboard
app.get('/api/users/:userId/stats', async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await prisma.raceResult.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50
    });

    if (results.length === 0) {
      return res.json({
        bestWpm: 0,
        avgWpm: 0,
        totalTests: 0,
        momentum: [],
        recentAccuracy: 0,
        recentRaces: []
      });
    }

    const bestWpm = Math.max(...results.map(r => r.wpm));
    
    // Avg WPM last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentResults = results.filter(r => new Date(r.date) >= thirtyDaysAgo);
    const avgWpm = recentResults.length > 0 
      ? recentResults.reduce((acc, r) => acc + r.wpm, 0) / recentResults.length 
      : 0;

    const totalTests = await prisma.raceResult.count({ where: { userId } });
    
    // Momentum (last 10 tests for Sparkline)
    const momentum = results.slice(0, 10).reverse().map(r => r.wpm);
    const recentAccuracy = results[0]?.accuracy || 0;
    
    const recentRaces = results.slice(0, 5).map(r => ({
      id: r.id,
      wpm: r.wpm,
      accuracy: r.accuracy,
      date: r.date
    }));

    res.json({
      bestWpm,
      avgWpm: parseFloat(avgWpm.toFixed(1)),
      totalTests,
      momentum,
      recentAccuracy,
      recentRaces
    });
  } catch (error) {
    console.error('[Stats Error]', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get heatmap statistics
app.get('/api/users/:userId/heatmap', async (req, res) => {
  const { userId } = req.params;
  try {
    const stats = await prisma.characterStat.findMany({
      where: { userId }
    });
    // Return map for easier frontend consumption
    const heatMap = {};
    stats.forEach(s => {
      heatMap[s.char] = {
        accuracy: (s.correctCount / s.totalCount) * 100,
        total: s.totalCount
      };
    });
    res.json(heatMap);
  } catch (error) {
    console.error('[Heatmap Error]', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// Sockets
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  
  raceHandler(io, socket, prisma);

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

app.get('/api/leaderboard', async (req, res) => {
  try {
    let users = await prisma.user.findMany({
      include: {
        results: true
      }
    });

    // Map and calculate highest WPM
    let leaderboard = users.map(user => {
      const topResult = user.results.sort((a,b) => b.wpm - a.wpm)[0];
      return {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        wpm: topResult ? topResult.wpm : 0,
        tests: user.results.length || 0,
        accuracy: topResult ? topResult.accuracy : 0
      };
    }).filter(user => user.wpm > 0).sort((a, b) => b.wpm - a.wpm);
    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard Error]', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

const validateSaturation = (passage, weakness) => {
  if (!passage || !weakness) return false;
  // Normalize weakness to a set of characters
  const targetChars = weakness.toLowerCase().replace(/[\s,]/g, '').split('');
  if (targetChars.length === 0) return true; // No weakness provided, technically saturated
  
  const words = passage.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  return words.every(word => targetChars.some(char => word.includes(char)));
};

const LOCAL_DICTIONARY = {
  'q': ["quick", "query", "unique", "opaque", "squat", "liquid", "quest", "quack", "quality", "squeak"],
  'z': ["zone", "blaze", "jazz", "zero", "gaze", "buzz", "maze", "size", "azure", "wizard"],
  'x': ["extra", "axle", "next", "fix", "oxygen", "hex", "box", "apex", "index", "pixel"],
  'j': ["jump", "just", "joint", "judge", "major", "object", "project", "enjoy", "adjunct", "jacket"],
  'v': ["video", "vital", "voice", "vivid", "vector", "valve", "vault", "evolve", "vocal", "vortex"],
  'k': ["key", "kind", "keep", "known", "break", "click", "check", "speak", "skate", "krill"],
  'w': ["word", "work", "wait", "west", "swing", "swim", "write", "wave", "wrench", "wrist"],
  'y': ["cycle", "yield", "crypt", "style", "layer", "hyper", "glyph", "proxy", "entry", "synch"],
  'p': ["power", "point", "pixel", "phase", "speed", "pulse", "optic", "alpha", "input", "pilot"],
  't': ["tech", "time", "test", "total", "point", "trace", "state", "track", "trust", "trial"],
  'a': ["alpha", "array", "await", "area", "base", "data", "frame", "main", "phase", "state"],
  'e': ["echo", "enter", "every", "edge", "true", "code", "level", "speed", "test", "reset"],
  'i': ["input", "index", "init", "light", "point", "logic", "link", "pixel", "grid", "fix"],
  'o': ["open", "node", "core", "point", "mode", "option", "local", "flow", "logic", "word"],
  'n': ["node", "next", "link", "index", "near", "kind", "open", "even", "main", "count"],
  'r': ["race", "root", "error", "reset", "core", "trace", "grid", "rank", "true", "break"],
  's': ["sync", "state", "speed", "system", "save", "test", "list", "base", "site", "past"],
  'u': ["user", "unit", "unique", "pulse", "input", "build", "true", "fault", "full", "gauge"],
  'b': ["base", "bits", "byte", "break", "build", "back", "boot", "block", "bin", "beam"],
  'c': ["code", "core", "cycle", "click", "cloud", "cache", "count", "clear", "case", "sync"],
  'd': ["data", "done", "dead", "drive", "disk", "dark", "deep", "drop", "dual", "dump"],
  'f': ["flow", "file", "fast", "fault", "fill", "find", "fixed", "flag", "flash", "form"],
  'g': ["grid", "gate", "glow", "gauge", "gain", "gear", "grab", "gray", "gap", "get"],
  'h': ["hash", "high", "head", "hook", "host", "hard", "held", "halt", "haze", "half"],
  'l': ["link", "loop", "level", "local", "light", "load", "list", "line", "last", "long"],
  'm': ["mode", "main", "memory", "map", "mask", "mesh", "mono", "made", "menu", "miss"],
  ';': ["code;", "logic;", "syntax;", "yield;", "await;", "return;", "const;", "let;", "if;", "while;"],
  '[': ["arr[i]", "data[0]", "list[n]", "val[x]", "map[k]", "set[v]", "box[y]", "bit[z]", "obj[p]", "key[s]"],
  ']': ["arr[0]", "map[x]", "list[i]", "data[z]", "set[k]", "val[y]", "bit[p]", "box[s]", "obj[v]", "key[n]"],
  '{': ["{data:", "{node:", "{item:", "{type:", "{kind:", "{link:", "{sync:", "{base:", "{core:", "{user:"],
  '}': ["data}", "node}", "item}", "type}", "kind}", "link}", "sync}", "base}", "core}", "user}"],
  '<': ["<div", "<span", "<path", "<svg", "<link", "<user", "<item", "<node", "<sync", "<core"],
  '>': ["div>", "span>", "path>", "svg>", "link>", "user>", "item>", "node>", "sync>", "core>"]
};

// Generates a passage locally if AI fails, ensuring 100% saturation
const generateLocalSaturatedPassage = (weakness) => {
  const chars = weakness.toLowerCase().replace(/[\s,]/g, '').split('');
  if (chars.length === 0) return { passage: "Type the characters correctly to improve your precision.", insights: "Standard calibration mode initialized." };
  
  let passageRaw = [];
  for (let i = 0; i < 20; i++) {
    const targetChar = chars[i % chars.length];
    const choices = LOCAL_DICTIONARY[targetChar] || [targetChar, targetChar + targetChar, targetChar + " " + targetChar];
    const word = choices[Math.floor(Math.random() * choices.length)];
    passageRaw.push(word);
  }
  
  // Shuffle slightly
  const passage = passageRaw.sort(() => Math.random() - 0.5).join(' ');
  return {
    passage,
    insights: `Local saturation backup engaged for [ ${weakness} ]. Direct hardware override providing 100% targeted routine.`
  };
};

app.post('/api/ai/train', async (req, res) => {
  const { weakness } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Upgraded to 2.0-flash
    const prompt = `Generate a JSON object for a typing practice session targeting these characters: "${weakness}".
    GOAL: Create a training passage where EVERY WORD contains at least one of these characters: "${weakness}".
    
    Strict Rules:
    1. 100% Saturation: Every single word in the "passage" field MUST contain at least one of: ${weakness}.
    2. Length: 20-30 words (prefer quality and saturation over length).
    3. Style: Technical, cyber-industrial, elite operator tone.
    4. Format: Return ONLY a JSON object with "passage" and "insights" strings.

    Example for 'q': "quick query unique opaque squat liquid quest..."
    Example for 'z': "zone blaze jazz zero gaze buzz maze size..."

    JSON Structure:
    { "passage": "...", "insights": "..." }`;
    
    let data;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text().trim();
      
      try {
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          data = JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
          
          if (validateSaturation(data.passage, weakness)) {
            console.log(`[AI Trainer] Saturation validated on attempt ${attempts + 1}`);
            break; 
          } else {
            console.warn(`[AI Trainer] Saturation failed on attempt ${attempts + 1}. Retrying...`);
          }
        }
      } catch (e) {
        console.warn(`[AI Trainer] Parse error on attempt ${attempts + 1}: ${e.message}`);
      }
      attempts++;
    }

    if (!data || !validateSaturation(data.passage, weakness)) {
      throw new Error('Failed to generate saturated passage after multiple attempts');
    }
    
    res.json(data);
  } catch (error) {
    console.warn('[AI Trainer] Gemini failed:', error.message);
    const localResult = generateLocalSaturatedPassage(weakness);
    res.json(localResult);
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
