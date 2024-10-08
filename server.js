const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatMessages = []; // Store chat messages
const activeUsers = {}; // Object to track active users

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user joined', (username) => {
        socket.username = username;
        activeUsers[username] = true; // Track active user

        // Send the last 50 messages to the new user
        const recentMessages = chatMessages.slice(-50); // Limit to last 50 messages
        socket.emit('chat history', recentMessages);
        socket.broadcast.emit('user joined', username); // Notify others

        // Send the updated user list
        io.emit('update user list', Object.keys(activeUsers));
    });

    socket.on('chat message', (data) => {
        const chatMessage = { username: data.username, message: data.message, file: data.file };
        chatMessages.push(chatMessage); // Store message in global history

        // Optional: Limit stored chat messages to prevent memory overflow
        if (chatMessages.length > 1000) {
            chatMessages.shift(); // Remove the oldest message
        }

        io.emit('chat message', chatMessage); // Broadcast message to all
    });

    socket.on('reply message', (data) => {
        const replyMessage = {
            username: data.username,
            message: data.message,
            replyTo: data.replyTo
        };
        chatMessages.push(replyMessage); // Store the reply message

        // Optionally limit stored chat messages
        if (chatMessages.length > 1000) {
            chatMessages.shift();
        }

        io.emit('chat message', replyMessage); // Broadcast reply to all
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete activeUsers[socket.username]; // Remove user on disconnect

        // Update user list for all clients
        io.emit('update user list', Object.keys(activeUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
