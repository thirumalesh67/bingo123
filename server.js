const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const cors = require('cors');
const Game = require('./models/game');
const User = require('./models/user');
const path = require('path');

const { checkBingo } = require('./utils/gameUtils');

const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');
require('dotenv').config();
const port = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

// Socket Setup
const io = socketIo(server);
const corsOptions = {
  origin: 'http://localhost:3001', // Replace with your frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../frontend/build')));

// Define your API routes and other Express middleware here

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const usernameToSocket = {};
const gamePlayers = {};
const gameRooms = {};

io.on('connection', (socket) => {
  console.log('A user connected.');

  // Handle joining a room with a specific game code
  socket.on('joinRoom', async (roomCode, username, board) => {
    try {
      const game = await Game.findOne({ code: roomCode });
      if (!game) {
        return;
      }
      const user = await User.findOne({ username });
      if (!user) {
        return;
      }
      game.players.push(user);
      game.playerCardConfigurations.push({ user: user._id, cardGrid: board });
      await game.save();
      socket.join(roomCode);
      console.log(`${username} joined room: ${roomCode}`);
      usernameToSocket[socket] = { username, roomCode };
      if (gamePlayers[roomCode]) {
        gamePlayers[roomCode].push(username);
      } else {
        gamePlayers[roomCode] = [username];
      }

      if (!gameRooms[roomCode]) {
        gameRooms[roomCode] = {
          users: [],
          selectedNumbers: [],
          currentPlayerIndex: 0,
        };
      }

      gameRooms[roomCode].users.push({
        socket,
        username,
        board,
      });
      // Send a message to the room
      io.to(roomCode).emit('joinRoom', gamePlayers[roomCode]);
      console.log(gamePlayers);
    } catch (error) {
      console.log(`Socket Join Room Error ${roomCode}, ${username}`);
    }
  });

  socket.on('leaveRoom', (roomCode, username) => {
    socket.leave(roomCode);
    console.log(`${username} left room: ${roomCode}`);
    delete usernameToSocket[socket];
    io.to(roomCode).emit('leaveRoom', username);
  });

  socket.on('selectNumber', (roomCode, selectedNumber) => {
    const room = gameRooms[roomCode];
    const currentUserIndex = room.users.findIndex(
      (user) => user.socket === socket,
    );
    if (currentUserIndex === room.currentPlayerIndex) {
      if (!room.selectedNumbers.includes(selectedNumber)) {
        room.selectedNumbers.push(selectedNumber);
      }

      // Check FOR BINGO
      let gameOver = false;
      let winners = 'Winners: ';
      for (let i = 0; i < room.users.length; i++) {
        const { username, board } = room.users[i];
        if (checkBingo(board, room.selectedNumbers)) {
          winners = winners + username + '; ';
          gameOver = true;
        }
      }

      io.to(roomCode).emit('selectNumber', selectedNumber);

      room.currentPlayerIndex =
        (room.currentPlayerIndex + 1) % room.users.length;

      // Notify the next player that it's their turn
      if (gameOver) {
        io.to(roomCode).emit('gameOver', winners);
      } else {
        const nextPlayer = room.users[room.currentPlayerIndex];
        nextPlayer.socket.emit('yourTurn');
      }
    }
  });

  socket.on('startGame', (roomCode) => {
    io.to(roomCode).emit('startGame');
    const currentPlayer = gameRooms[roomCode].currentPlayerIndex;
    const currentPlayerSocket = gameRooms[roomCode].users[currentPlayer].socket;
    currentPlayerSocket.emit('yourTurn');
  });

  // Handle other socket events here...

  // Handle disconnections
  socket.on('disconnect', () => {
    if (usernameToSocket[socket]) {
      const { roomCode, username } = usernameToSocket[socket];
      socket.leave(roomCode);
      console.log(`${username} left room: ${roomCode}`);
      io.to(roomCode).emit('leaveRoom', username);
      const players = gamePlayers[roomCode];
      const filt_players = players.filter((item) => item != username);
      gamePlayers[roomCode] = filt_players;
      io.to(roomCode).emit('joinRoom', gamePlayers[roomCode]);
      console.log(`${username} user disconnected`);
    }

    delete usernameToSocket[socket];
  });
});

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

// MongoDB connection setup
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
