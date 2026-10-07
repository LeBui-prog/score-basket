const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Servir les fichiers statiques du dossier public
app.use(express.static('public'));

// État du match stocké côté serveur
let gameState = {
  scoreA: 0,
  scoreB: 0,
  teamA: "ÉQUIPE A",
  teamB: "ÉQUIPE B",
  period: 1
};

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté :', socket.id);

  // Envoyer l'état actuel au nouvel arrivant
  socket.emit('updateState', gameState);

  // Réception des actions de la télécommande
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
    gameState = {
      scoreA: 0,
      scoreB: 0,
      teamA: "ÉQUIPE A",
      teamB: "ÉQUIPE B",
      period: 1
    };
    io.emit('updateState', gameState);
  });

  socket.on('updateNames', (names) => {
    if (names.teamA) gameState.teamA = names.teamA;
    if (names.teamB) gameState.teamB = names.teamB;
    io.emit('updateState', gameState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});