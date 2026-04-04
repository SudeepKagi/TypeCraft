const { generateRacePassage } = require('../data/passages');
const rooms = {};

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const raceHandler = (io, socket, prisma) => {
  
  // Create a new race room
  socket.on('race:create', (data) => {
    const roomCode = generateRoomCode();
    const { user } = data; // the user creating it
    
    rooms[roomCode] = {
      id: roomCode,
      status: 'waiting', // waiting, countdown, racing, finished
      players: [
        {
          id: socket.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          dbId: user.id,
          progress: 0,
          wpm: 0,
          isHost: true,
          isFinished: false
        }
      ],
      startTime: null
    };

    socket.join(roomCode);
    
    socket.emit('race:created', { roomCode, players: rooms[roomCode].players });
    console.log(`[Race] Room ${roomCode} created by ${user.username}`);
  });

  // Join existing room
  socket.on('race:join', ({ roomCode, user }) => {
    if (!rooms[roomCode]) {
      return socket.emit('race:error', 'Room not found');
    }
    
    const room = rooms[roomCode];
    if (room.status !== 'waiting') {
      return socket.emit('race:error', 'Race already started');
    }

    // Check if player already in room
    const existingPlayer = room.players.find(p => p.id === socket.id);
    if (!existingPlayer) {
      room.players.push({
        id: socket.id,
        username: user.username + (room.players.length > 0 ? `_${room.players.length + 1}` : ''),
        avatarUrl: user.avatarUrl,
        dbId: user.id || null,
        progress: 0,
        wpm: 0,
        isHost: false,
        isFinished: false
      });
    }

    socket.join(roomCode);
    io.to(roomCode).emit('race:update', { 
      roomCode: roomCode,
      status: room.status, 
      players: room.players 
    });
    
    console.log(`[Race] ${user.username} joined room ${roomCode}`);
  });

  // Start the race countdown
  socket.on('race:start', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Check if requester is host
    const player = room.players.find(p => p.id === socket.id);
    if (player && player.isHost && room.status === 'waiting') {
      room.status = 'countdown';
      io.to(roomCode).emit('race:update', { status: 'countdown', players: room.players });
      
      let count = 5;
      const interval = setInterval(() => {
        count -= 1;
        io.to(roomCode).emit('race:countdown', count);
        
        if (count === 0) {
          clearInterval(interval);
          room.status = 'racing';
          room.startTime = Date.now();
          const passage = generateRacePassage('quotes', 35); // Default quotes for races
          room.passage = passage;
          io.to(roomCode).emit('race:started', { startTime: room.startTime, passage: room.passage });
        }
      }, 1000);
    }
  });

  // Update progress during race
  socket.on('race:progress', ({ roomCode, progress, wpm, accuracy }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'racing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy || 100;
      
      if (progress >= 100 && !player.isFinished) {
        player.isFinished = true;
        // Save to DB and Award XP
        if (player.dbId) {
          // Calculate XP: (WPM * Accuracy / 100)
          const xpGained = Math.max(1, Math.floor(parseFloat(wpm) * (parseFloat(accuracy || 100) / 100)));
          
          Promise.all([
            prisma.raceResult.create({
              data: {
                wpm: parseFloat(wpm),
                accuracy: parseFloat(accuracy || 100),
                userId: player.dbId
              }
            }),
            prisma.user.update({
              where: { id: player.dbId },
              data: {
                xp: { increment: xpGained }
              }
            })
          ]).catch(console.error);
        }
      }

      // Check if all players finished
      const allFinished = room.players.every(p => p.isFinished);
      if (allFinished) {
        room.status = 'finished';
      }

      io.to(roomCode).emit('race:update', { 
        status: room.status, 
        players: room.players 
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Find rooms player was in
    for (const [roomCode, room] of Object.entries(rooms)) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        // If room empty, delete it
        if (room.players.length === 0) {
          delete rooms[roomCode];
        } else {
          // If host left, assign new host
          if (room.players.every(p => !p.isHost)) {
            room.players[0].isHost = true;
          }
          io.to(roomCode).emit('race:update', { status: room.status, players: room.players });
        }
      }
    }
  });
};

module.exports = raceHandler;
