const users = new Set(); // To store connected usernames

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing messages to the new user
    socket.emit('chat history', chatMessages);

    socket.on('user joined', (username) => {
        users.add(username);
        socket.username = username; // Store username in socket
        socket.broadcast.emit('user joined', username); // Notify others
    });

    socket.on('chat message', ({ message }) => {
        const chatMessage = { username: socket.username, message };
        chatMessages.push(chatMessage);
        io.emit('chat message', chatMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users.delete(socket.username); // Remove user on disconnect
    });
});
