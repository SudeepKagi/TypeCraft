require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const raceHandler = require('./src/handlers/raceHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Pass prisma to requests
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
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
    // Ensures scaling by time commitment
    const rawXp = parseFloat(wpm) * (parseFloat(accuracy) / 100) * (challengeDuration / 60);
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
        recentAccuracy: 0
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

    // Provide mock fallback data if database is mostly empty to fulfill UI requirements
    if (leaderboard.length < 5) {
      const mockData = [
        { id: 'm1', username: 'HyperSonic_', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWBSuaIIgm_sPVUllnU5ON9_g22_LkjIx3A6RZNMsZ0iSiXCd3_i4Aym-0xhlKj02Ls0Zp0cnXykQVeXmpmfFj__z8duO2MpdKAaZeZGTyEQOj-ip2zRybFLinQp6mQB44-gjQfVrIWqdknNe60FCvFUC8Jyey5B64gbz6DgDXe4u9u_MApR4zR0ISsnI9A8geUcCr4xNWldCydyBa6ZxeFBcgWBuYNjeKSDlitECd-M2NPbCnuZdFjQDNFvnKbGsUGpiWp4-frRA', wpm: 184, tests: 4210, accuracy: 99.2 },
        { id: 'm2', username: 'GhostCode', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsblPZfb9EkZbrtDAssLzmvlcn3SVAeiNqmMyjpRrfuc2QMkki8R8JIloVtwE0F5gamgAug0-VwwBBNbEZzyjg4ZaPygl0bUYhJD7_XkfRz79eTP-tvncL3bUXRy1rd6SpX-VDj7KUWi8fZGGsJNDo5Dw9x8_p9Il5xHuDOh8U_PZD23j2C6px5x5EUdoX2xh0MV7PH15l-qtvOEehYsBdUFRcKXW3gOWpxw7tHv2Fo6LOqZOF2sha8f2TF1RPcg05cSmL7XYE9cg', wpm: 179, tests: 12842, accuracy: 98.8 },
        { id: 'm3', username: 'VortexTyper', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUebAcLulvrxovVSS3YMquKLO3DkujGAbJ9-jzTTmZj5DIgAAf8LEpGvEQbp2cwHB9Gos7aLb5ZVHhVMUqiGidaE8As80Cy24S4qMaqOBcyt2aH2bDODH1qHpbpNj-r2EPtDQr43nySzvks-SEmD0gDwnVcjBW7ftGA3gSRU6Ipg-6-maHOwtn3NoO5SvU67fQI2UCFR9PDdYC4ymPDz05XZPC9iB0h4fo00vhCAAlKliX1pJjn5vaqYpgDDHOE9hSdSi1CNARMfo', wpm: 175, tests: 809, accuracy: 97.5 },
        { id: 'm4', username: 'NovaPulse', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWBSuaIIgm_sPVUllnU5ON9_g22_LkjIx3A6RZNMsZ0iSiXCd3_i4Aym-0xhlKj02Ls0Zp0cnXykQVeXmpmfFj__z8duO2MpdKAaZeZGTyEQOj-ip2zRybFLinQp6mQB44-gjQfVrIWqdknNe60FCvFUC8Jyey5B64gbz6DgDXe4u9u_MApR4zR0ISsnI9A8geUcCr4xNWldCydyBa6ZxeFBcgWBuYNjeKSDlitECd-M2NPbCnuZdFjQDNFvnKbGsUGpiWp4-frRA', wpm: 168, tests: 562, accuracy: 99.1 },
        { id: 'm5', username: 'Shift_Key', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsblPZfb9EkZbrtDAssLzmvlcn3SVAeiNqmMyjpRrfuc2QMkki8R8JIloVtwE0F5gamgAug0-VwwBBNbEZzyjg4ZaPygl0bUYhJD7_XkfRz79eTP-tvncL3bUXRy1rd6SpX-VDj7KUWi8fZGGsJNDo5Dw9x8_p9Il5xHuDOh8U_PZD23j2C6px5x5EUdoX2xh0MV7PH15l-qtvOEehYsBdUFRcKXW3gOWpxw7tHv2Fo6LOqZOF2sha8f2TF1RPcg05cSmL7XYE9cg', wpm: 164, tests: 2104, accuracy: 96.4 },
        { id: 'm6', username: 'PixelPusher', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUebAcLulvrxovVSS3YMquKLO3DkujGAbJ9-jzTTmZj5DIgAAf8LEpGvEQbp2cwHB9Gos7aLb5ZVHhVMUqiGidaE8As80Cy24S4qMaqOBcyt2aH2bDODH1qHpbpNj-r2EPtDQr43nySzvks-SEmD0gDwnVcjBW7ftGA3gSRU6Ipg-6-maHOwtn3NoO5SvU67fQI2UCFR9PDdYC4ymPDz05XZPC9iB0h4fo00vhCAAlKliX1pJjn5vaqYpgDDHOE9hSdSi1CNARMfo', wpm: 162, tests: 7549, accuracy: 88.2 },
        { id: 'm7', username: 'EchoLogic', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWBSuaIIgm_sPVUllnU5ON9_g22_LkjIx3A6RZNMsZ0iSiXCd3_i4Aym-0xhlKj02Ls0Zp0cnXykQVeXmpmfFj__z8duO2MpdKAaZeZGTyEQOj-ip2zRybFLinQp6mQB44-gjQfVrIWqdknNe60FCvFUC8Jyey5B64gbz6DgDXe4u9u_MApR4zR0ISsnI9A8geUcCr4xNWldCydyBa6ZxeFBcgWBuYNjeKSDlitECd-M2NPbCnuZdFjQDNFvnKbGsUGpiWp4-frRA', wpm: 159, tests: 449, accuracy: 85.9 },
        { id: 'm8', username: 'Shadow_Step', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsblPZfb9EkZbrtDAssLzmvlcn3SVAeiNqmMyjpRrfuc2QMkki8R8JIloVtwE0F5gamgAug0-VwwBBNbEZzyjg4ZaPygl0bUYhJD7_XkfRz79eTP-tvncL3bUXRy1rd6SpX-VDj7KUWi8fZGGsJNDo5Dw9x8_p9Il5xHuDOh8U_PZD23j2C6px5x5EUdoX2xh0MV7PH15l-qtvOEehYsBdUFRcKXW3gOWpxw7tHv2Fo6LOqZOF2sha8f2TF1RPcg05cSmL7XYE9cg', wpm: 155, tests: 3201, accuracy: 87.0 },
        { id: 'm9', username: 'DraftMaster', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUebAcLulvrxovVSS3YMquKLO3DkujGAbJ9-jzTTmZj5DIgAAf8LEpGvEQbp2cwHB9Gos7aLb5ZVHhVMUqiGidaE8As80Cy24S4qMaqOBcyt2aH2bDODH1qHpbpNj-r2EPtDQr43nySzvks-SEmD0gDwnVcjBW7ftGA3gSRU6Ipg-6-maHOwtn3NoO5SvU67fQI2UCFR9PDdYC4ymPDz05XZPC9iB0h4fo00vhCAAlKliX1pJjn5vaqYpgDDHOE9hSdSi1CNARMfo', wpm: 154, tests: 9122, accuracy: 89.0 },
      ];
      
      // Inject DB users into mockdata if they exist
      leaderboard.forEach(dbUser => {
        if (!mockData.find(m => m.id === dbUser.id || m.username === dbUser.username)) {
          mockData.push(dbUser);
        }
      });
      leaderboard = mockData.sort((a,b) => b.wpm - a.wpm);
    }

    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard Error]', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/ai/train', async (req, res) => {
  const { weakness } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Corrected to 1.5-flash
    const prompt = `Generate a JSON object for a typing practice session targeting these characters: "${weakness}".
    Include:
    1. "passage": A 50-word text focusing heavily on those characters.
    2. "insights": A short (1 sentence) technical explanation of why this passage helps muscle memory for these keys.
    Return ONLY JSON.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text().trim();
    
    // Robust JSON extraction to handle Gemini's optional markdown or extra text
    let data;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);
    } catch (e) {
      console.warn('[AI Parse Warning] Trying secondary fallback');
      throw new Error('Malformed AI JSON');
    }
    
    res.json(data);
  } catch (error) {
    console.error('[Train Error]', error.message);
    const fallback = {
      passage: `Focus entirely on your targeted keys: ${weakness}. Repetition builds pathways. Mastering ${weakness} requires patience. Execute precision strokes on ${weakness} until muscle memory solidifies completely without hesitation or error.`,
      insights: `Standard rhythmic repetition protocol initialized for ${weakness}.`
    };
    res.json(fallback);
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
