const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatMessages = []; // Store chat messages
const activeUsers = {}; // Object to track active users and their messages

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing messages to the new user
    socket.emit('chat history', chatMessages);

    socket.on('user joined', (username) => {
        socket.username = username; // Store the username in the socket
        if (!activeUsers[username]) {
            activeUsers[username] = []; // Initialize user's message history
        }
        socket.broadcast.emit('user joined', username);
    });

    socket.on('chat message', (message) => {
        const chatMessage = { username: socket.username, message };
        chatMessages.push(chatMessage); // Store message in global history
        activeUsers[socket.username].push(chatMessage); // Store in user's history
        io.emit('chat message', chatMessage);
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
