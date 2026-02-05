const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store users and messages
const users = new Map();
const messageHistory = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, {
      id: socket.id,
      username,
      joinedAt: new Date()
    });

    // Send welcome message
    const welcomeMessage = {
      id: Date.now().toString(),
      text: `Welcome to the chat, ${username}!`,
      sender: 'System',
      timestamp: new Date(),
      isSystem: true
    };

    socket.emit('message', welcomeMessage);
    
    // Notify others
    const joinMessage = {
      id: Date.now().toString(),
      text: `${username} has joined the chat`,
      sender: 'System',
      timestamp: new Date(),
      isSystem: true
    };

    socket.broadcast.emit('message', joinMessage);
    
    // Send current users list
    io.emit('users', Array.from(users.values()));
    
    // Send message history
    if (messageHistory.length > 0) {
      socket.emit('messageHistory', messageHistory.slice(-50));
    }
  });

  // Handle incoming messages
  socket.on('sendMessage', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now().toString(),
      text: messageData.text,
      sender: user.username,
      senderId: socket.id,
      timestamp: new Date(),
      isSystem: false
    };

    // Save to history (keep last 100 messages)
    messageHistory.push(message);
    if (messageHistory.length > 100) {
      messageHistory.shift();
    }

    // Broadcast to all connected clients
    io.emit('message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('userTyping', {
        userId: socket.id,
        username: user.username,
        isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);

      // Notify others
      const leaveMessage = {
        id: Date.now().toString(),
        text: `${user.username} has left the chat`,
        sender: 'System',
        timestamp: new Date(),
        isSystem: true
      };

      io.emit('message', leaveMessage);
      io.emit('users', Array.from(users.values()));
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});