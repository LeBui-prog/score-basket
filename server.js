const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Indique explicitement le dossier 'public' quel que soit l'environnement d'exécution
app.use(express.static(path.join(__dirname, 'public')));

// Redirection automatique vers index.html sur la racine '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// État du match stocké côté serveur
let gameState = {
  scoreA: 0,
  scoreB: 0,
  teamA: "ÉQUIPE A",
  teamB: "ÉQUIPE B",
  period: 1
};

io.on('connection', (socket) => {
  socket.emit('updateState', gameState);

  socket.on('changeScore', (data) => {
    if (data.team === 'A') gameState.scoreA = Math.max(0, gameState.scoreA + data.delta);
    if (data.team === 'B') gameState.scoreB = Math.max(0, gameState.scoreB + data.delta);
    io.emit('updateState', gameState);
  });

  socket.on('changePeriod', (delta) => {
    gameState.period = Math.max(1, gameState.period + delta);
    io.emit('updateState', gameState);
  });

  socket.on('resetGame', () => {
    gameState = { scoreA: 0, scoreB: 0, teamA: "ÉQUIPE A", teamB: "ÉQUIPE B", period: 1 };
    io.emit('updateState', gameState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});