import net from 'net';

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "127.0.0.1";

let server = net.createServer();

server.listen(PORT, host, function () {
    console.log(`abalone server running \nPORT: ${PORT} \Host: ${host}\nServer Adress: ${JSON.stringify(server.adress)}`);
});

server.on("connection", function (socket) {
    var remoteAdress = socket.remoteAdress + socket.remotePort;
    console.log("Connected");

    socket.on("data", function (d) {
        /*
         * Functions that handle input go here
         * Chat : gets message, returns array [playername][msg] -> display in app
         *
         * */
       
    });

    socket.on("error", function (error) {
        console.log(error);
    });

    socket.once("close", function () {

    });

});


