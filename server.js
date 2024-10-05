const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatMessages = []; // Store chat messages
const activeUsers = {}; // Object to track active users and their messages

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing messages to the new user
    socket.emit('chat history', chatMessages);

    socket.on('user joined', (username) => {
        socket.username = username; // Store the username in the socket
        if (!activeUsers[username]) {
            activeUsers[username] = []; // Initialize user's message history
        }
        socket.broadcast.emit('user joined', username); // Notify others
    });

    socket.on('chat message', (data) => {
        const chatMessage = { username: data.username, message: data.message };
        chatMessages.push(chatMessage); // Store message in global history
        io.emit('chat message', chatMessage); // Broadcast message to all
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete activeUsers[socket.username]; // Remove user on disconnect
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
