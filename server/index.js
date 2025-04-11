
// Node.js backend with Socket.io
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let players = [];
let currentTurnIndex = 0;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-game', ({ name }) => {
    const player = {
      id: socket.id,
      name,
      position: 0,
      money: 200000,
    };
    players.push(player);

    io.emit('init', { players, id: socket.id });
    io.emit('update-players', players);

    if (players.length === 1) {
      io.emit('update-turn', player.id);
    }
  });

  socket.on('spin', ({ number }) => {
    const currentPlayer = players[currentTurnIndex];
    if (socket.id === currentPlayer.id) {
      currentPlayer.position += number;
      if (currentPlayer.position > 49) currentPlayer.position = 49;
      io.emit('rolled', number);
      io.emit('update-players', players);

      // Next player's turn
      currentTurnIndex = (currentTurnIndex + 1) % players.length;
      io.emit('update-turn', players[currentTurnIndex].id);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    players = players.filter((p) => p.id !== socket.id);
    io.emit('update-players', players);

    if (players.length > 0) {
      currentTurnIndex %= players.length;
      io.emit('update-turn', players[currentTurnIndex].id);
    }
  });
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
