import net from "net";

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "127.0.0.1";

import { RoomControls, ChatControls } from "./Controls/index.js";

import { InCommandCodes, OutCommandCodes } from "./GlobalVars.js";

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
  console.log(socket);
  var remoteAdress = socket.remoteAdress + socket.remotePort;
  console.log(`Connections from ${remoteAdress} established.`);

  // Keep socket, so it can later be used to notify users about executed actions.
  // (e.g. Player movement, Player joining room, etc.)
  sockets.push(socket);

  // Handling data from client.
  socket.on("data", function (data) {
    // Validating the command structure
    validateCommandStructure(data);

    let { userId } = props;

    /**
     * Depending on the commandType parameter the appropriate
     * action is executed.
     */
    try {
      if (InCommandCodes.commandType === InCommandCodes.CreateRoom) {
        let roomKey = roomControls.CreateRoom(userId);
        socket.write(roomKey);
      } else if (InCommandCodes.commandType === InCommandCodes.JoinRoom) {
        let room = roomControls.JoinRoom(userId, data.roomKey);

        // Notify current user about his successull join.
        socket.write({ commandCode: OutCommandCodes.RoomJoinedSuccessfully });

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
  });

  socket.on("error", function (error) {
    console.log(error);
  });

  socket.once("close", function (ev) {
    console.log(ev);
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
  if (
    !input.hasOwnProperty("commandCode") ||
    !input.hasOwnProperty("props") ||
    (includeUserId && !input.hasOwnProperty("userId"))
  ) {
    throw "Invalid command structure";
  }
};
