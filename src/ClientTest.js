require('dotenv').config()

const io = require("socket.io-client")(`ws://${process.env.SERVER_HOST}:${process.env.PORT}`);

/**
 * Small test POC for the server.
 * Sends a create-room request to the api.
 */
io.on('connect', (socket) => {
    console.log("connection success");
    
    io.emit('create-room', {
        players: 2,
        sideLength: 6,
    });
});