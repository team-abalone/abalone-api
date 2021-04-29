import net from 'net';
import serverControls from './Controls/controls.js';
//const fA = require('./Controls/controls.js');

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "127.0.0.1";

const server = net.createServer();

//Different Rooms created by the createRoom() function go here. These allow the Server to write to corresponding sockets
 let rooms = [];

server.listen(PORT, host, function () {
    console.log(`Abalone server running \nPORT: ${PORT} \Host: ${host}\n`);
});

server.on("connection", function (socket) {
    //getting sockets adress for connecting non-host-players later on
    var remoteAdress = socket.remoteAdress + socket.remotePort;
    console.log("Connected");

    //when socket is build:
    socket.on("data", function (d) {
        /*
         * Functions that handle input go here
         * Chat : gets message, returns array [playername][msg] -> display in app
         * Join: accepts parameter
         * Game: to be discussed
         * */

        //received data should start with '0', '1' or '2' to indicate which functions to use
        //0 : join another socket
        //1 : write lobby chat
        //2 : game logic
        // further types could occur depending on final game (cheat function, etc)

        let type = (d.toString()).split(" ")[0];
        
        if (type == 0) {
            rooms.push(serverControls.createRoom(socket));
            console.log(rooms[rooms.length-1][0]); //debug line            
        }

        else if (type == 1) {
            serverControls.chatFunction(d, rooms, socket); //will later return an array, consisting of username and message and write it to the socket
        }

        else if (type == 2) {
            serverControls.joinRoom(rooms, (d.toString()).split(" ")[1], socket);
        }
            //debug only
        else if (type == 3) {
            serverControls.findRoomByPlayer(rooms, socket);
            console.log(`DEBUG FINDROOMBYPLAYER: ${serverControls.findRoomByPlayer(rooms, socket)[0].toString()}`);
        }   //debug only
        else if (type == 4) {
            serverControls.displayRooms(rooms);
        }
        else {
            console.log("Unclear type of action");
        }
    });

    socket.on("error", function (error) {
        console.log(error);
    });

    socket.once("close", function () {

    });

});




