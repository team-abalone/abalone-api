import net from 'net';

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "127.0.0.1";

let server = net.createServer();

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
         * */

        //received data should start with '0', '1' or '2' to indicate which functions to use
        //0 : join another socket
        //1 : write lobby chat
        //2 : game logic
        // further types could occur depending on final game (cheat function, etc)

        let type = (d+'').split(" ")[0];

        if (type == 0) {
            console.log("case1");
        }
        else if (type == 1) {
            console.log("case2");
        }
        else if (type == 2) {
            console.log("case3");
        }
    });

    socket.on("error", function (error) {
        console.log(error);
    });

    socket.once("close", function () {

    });

});




