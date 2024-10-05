const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory (if you have other static files)
app.use(express.static(path.join(__dirname, 'public')));

// Update the route to serve index.html from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve the main HTML file from root
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', ({ username, message }) => {
        io.emit('chat message', { username, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
