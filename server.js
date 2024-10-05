const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Array to hold chat messages
let chatMessages = [];

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

    socket.on('chat message', ({ username, message }) => {
        const chatMessage = { username, message };
        chatMessages.push(chatMessage); // Store message in the array
        io.emit('chat message', chatMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
