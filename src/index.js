const config = require('dotenv').config();
const net = require('net');


const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "127.0.0.1";

let server = net.createServer();
server.listen(PORT, host, () => {
    res.send("abalone server running");
})


/*
let express = require('express')
let app = express()
const io = require('socket.io')(server);



io.on('connection', (socket) => {
    console.log('request received');


});*/