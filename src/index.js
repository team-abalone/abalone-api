require('dotenv').config()

const PORT  = process.env.PORT || 5001
const io = require('socket.io')(PORT);

io.on('connection', (socket) => {
    console.log("connection received");

    socket.on('create-room', (message) => {
        console.log('room-creation received');
        // TODO: Handle room creation accordingly and return information to client.
    });
});

