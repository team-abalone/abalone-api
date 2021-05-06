import net from "net";

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "0.0.0.0";

import { RoomControls, ChatControls } from "./Controls/index.js";
import { InCommandCodes, OutCommandCodes } from "./GlobalVars.js";
import { InvalidCommandException , InvalidActionException} from "./Exceptions.js";

const server = net.createServer();

const roomControls = new RoomControls();
const chatControls = new ChatControls();

let sockets = [];

server.listen(PORT, host, function () {
  console.log(`Abalone server running \nPORT: ${PORT} \Host: ${host}\n`);
});

/**
 * The following structure is used to send commands:
 * {
 *  userId: <userId>,
 *  commandCode: <commandCode>,
 *  props: <props>,
 * }
 */
server.on("connection", function (socket) {
    //console.log(socket); keep log cleaner for now
    console.log(socket.remoteAddress + " " + socket.remotePort)
    let remoteAdress = socket.remoteAddress + " " + socket.remotePort; // mind the scope 
    console.log(`Connections from ${remoteAdress} established.`);

    // Keep socket, so it can later be used to notify users about executed actions.
    // (e.g. Player movement, Player joining room, etc.)
    sockets.push(socket);

    // Handling data from client.
    socket.on("data", function (data) {
        let convertedData = JSON.parse(data.toString());  /*raw data Object = Buffer (type: "Buffer" data: [...] -> must be converted)*/
        validateCommandStructure(convertedData);

        let { userId, commandCode, props } = convertedData;

        //Kommentiere ich hier während rebasing aus. Nach dem merge werde ich wieder alles testen, dann teste ich das nach und nach dazu
        //Fix folgt in den nächsten stunden

        /*
        // Notify other players about join of player.
        let otherPlayers = sockets.find(
          (s) => s.name in room.players && s.name !== socket.name
        );

        for (let i = 0; i < otherPlayers.length; i++) {
          otherPlayers[i].write({
            commandCode: OutCommandCodes.GameStarted,
            props: { gameField: room.gameField },
          });
        }
      } else if (InCommandCodes.commandType === InCommandCodes.StartGame) {
        let room = roomControls.startGame(userId, data.roomKey);

        // Notify creator of room about successful game start.
        socket.write({
          commandCode: OutCommandCodes.GameStarted,
          props: { gameField: room.gameField },
        });

        // Notify creator of room about successful game start.
        let otherPlayers = sockets.find(
          (s) => s.name in room.players && s.name !== room.createdBy
        );

        for (let i = 0; i < otherPlayers.length; i++) {
          otherPlayers[i].write({
            commandCode: OutCommandCodes.GameStarted,
            props: { gameField: room.gameField },
          });
        }
      } else if (
        InCommandCodes.commandType === InCommandCodes.SendChatMessage
      ) {
        // TODO: Fix or remove, chat not that important right now.
        chatControls.chatFunction(data, rooms, socket);
      } else {
        throw new Error("Unclear type of action.");
      }
    } catch (err) {
      socket.write(err);
    }
  });*/


        /**
         * Depending on the commandType parameter the appropriate
         * action is executed.
         */
        try {
            if (commandCode === InCommandCodes.CreateRoom) {
                let roomKey = roomControls.createRoom(userId, props, socket);
                socket.write(roomKey);
            } else if (commandCode === InCommandCodes.JoinRoom) {
                roomControls.joinRoom(userId, props, socket);
                // TODO: Notify other users currently in room.
            } else if (commandCode === InCommandCodes.LeaveRoom) {
                roomControls.leaveRoom(userId, socket);
                // TODO: Notify other users currently in room.
            } else if (commandCode === InCommandCodes.SendChatMessage
            ) {
                // TODO: Fix or remove, chat not that important right now.
                chatControls.chatFunction(data, rooms, socket);
            } else {
                throw new InvalidActionException("Unclear type of action.");
            }
        } catch (e) {
            socket.write(`${e.name}: ${e.message}`);
        }
    });

    socket.on("error", function (error) {
        socket.write(error);
    });

    socket.once("close", function (ev) {
        console.log(ev);
        roomControls.leaveRoomWithSocket(socket);
        console.log(`${remoteAdress} was closed.`);
    });
});

/**
 * Validates the overall command structure,
 * used on the input to check if it meets the criteria
 * for a valid command.
 * @param {*} input
 * @param {*} includeUserId
 */

const validateCommandStructure = (input, includeUserId = false) => {
    try {
        if (
            !input.hasOwnProperty("commandCode") ||
            !input.hasOwnProperty("props") ||
            ((includeUserId == true) && !input.hasOwnProperty("userId"))
        ) {
            throw new InvalidCommandException("Invalid Argument");
        }
    } catch (e) {
        console.log(`${e.name}: ${e.message}`);
    }
};
