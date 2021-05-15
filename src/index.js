import net from "net";

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "0.0.0.0";

import { RoomControls, ChatControls } from "./Controls/index.js";
import { InCommandCodes, OutCommandCodes } from "./GlobalVars.js";

import { v1 as uuidv1 } from "uuid";

import {
  InvalidCommandException,
  RoomException,
  ServerException,
} from "./Exceptions.js";

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
  console.log(socket.remoteAddress + " " + socket.remotePort);
  let remoteAdress = socket.remoteAddress + " " + socket.remotePort; // mind the scope
  console.log(`Connections from ${remoteAdress} established.`);

  // Keep socket, so it can later be used to notify users about executed actions.
  // (e.g. Player movement, Player joining room, etc.)
  sockets.push(socket);

  // Handling data from client.
  socket.on("data", function (data) {
    let convertedData = JSON.parse(data.toString());
    //validateCommandStructure(convertedData);

    let { userId, commandCode, props } = convertedData;

    if (userId && !socket.name) {
      socket.name = userId;
    }

    /**
     * Depending on the commandType parameter the appropriate
     * action is executed.
     */
    try {
      // Needs to be the first action the app calls, before everything else,
      // assigns the user a uuid, that needs to be included on each request afterwards
      if (commandCode === InCommandCodes.GetUserId) {
        userId = uuidv1();

        // For finding appropriate socket later.
        socket.name = userId;

        socket.write(
          sendConvertedResponse(
            JSON.stringify({
              commandCode: OutCommandCodes.IdInitialized,
              userId,
            })
          )
        );
      } else if (commandCode === InCommandCodes.CreateRoom) {
        let roomKey = roomControls.createRoom(userId, props.numberOfPlayers);

        // Send roomKey to room creator.
        socket.write(
          sendConvertedResponse(
            JSON.stringify({
              commandCode: OutCommandCodes.RoomCreated,
              roomKey,
            })
          )
        );
      } else if (commandCode === InCommandCodes.JoinRoom) {
        let room = roomControls.joinRoom(userId, props.roomKey);

        // Notify current user about his successful join.
        socket.write(
          sendConvertedResponse(
            JSON.stringify({
              commandCode: OutCommandCodes.RoomJoined,
              room,
            })
          )
        );

        // Notify other players in room about room join.
        broadCastToRoom(
          room,
          userId,
          JSON.stringify({
            commandCode: OutCommandCodes.RoomJoinedOther,
            room,
          })
        );
      } else if (commandCode === InCommandCodes.CloseRoom) {
        let room = roomControls.closeRoom(userId, props.roomKey);

        if (room) {
          socket.write(
            sendConvertedResponse(
              JSON.stringify({
                commandCode: OutCommandCodes.RoomClosed,
              })
            )
          );
        }

        // Notify other players in room about room closal.
        broadCastToRoom(
          room,
          userId,
          JSON.stringify({
            commandCode: OutCommandCodes.RoomClosed,
          })
        );
      } else if (commandCode === InCommandCodes.StartGame) {
        let room = roomControls.startGame(userId, props.roomKey);

        // Notify creator of room about successful game start.
        socket.write(
          sendConvertedResponse(
            JSON.stringify({
              commandCode: OutCommandCodes.GameStarted,
              gameField: room.gameField,
            })
          )
        );

        // Notify other players in room about game start.
        broadCastToRoom(
          room,
          userId,
          JSON.stringify({
            commandCode: OutCommandCodes.GameStarted,
            gameField: room.gameField,
          })
        );
      } else if (commandCode === InCommandCodes.SendChatMessage) {
        // TODO: Fix or remove, chat not that important right now.
        chatControls.chatFunction(data, rooms, socket);
      } else {
        throw new InvalidCommandException();
      }
    } catch (err) {
      // Here we handle errors in case something goes wrong ;)

      //Separation may be of need later on - TODO: update if needed or remove if there will not be a significant difference
      if (err instanceof RoomException) {
        socket.write(sendConvertedResponse(JSON.stringify(err.response)));
        console.error(err);
      } else if (err instanceof ServerException) {
        socket.write(sendConvertedResponse(JSON.stringify(err.response)));
        console.error(err);
      } else {
        socket.write(sendConvertedResponse(JSON.stringify(err.response)));
        console.error(err);
      }
    }
  });

  socket.on("error", function (error) {
    // socket.write(error);
  });

  socket.once("close", function (ev) {
    // Probably not a good idea to close room with socket disconnect,
    // as theoretically the client can loose connection and reconnect.
    // Maybe implement a timeout of x seconds and close room after that.
    //roomControls.leaveRoomWithSocket(socket);
  });
});

/**
 * Validates the overall command structure,
 * used on the input to check if it meets the criteria
 * for a valid command.
 * @param {*} input
 * @param {*} includeUserId
 */

const validateCommandStructure = (
  input,
  includeUserId = false,
  includeProps = false
) => {
  try {
    if (
      !input.hasOwnProperty("commandCode") ||
      (includeProps && !input.hasOwnProperty("props")) ||
      (includeUserId && !input.hasOwnProperty("userId"))
    ) {
      throw new InvalidCommandException();
    }
  } catch (e) {
    console.log(`${e.name}: ${e.message}`);
  }
};

/**
 * Used to add a linebreak to every response. Our client will be reading all the data in lines,
 * this ensures that the Client knows, where our response ends.
 * @param {any} res - String resulting from JSON
 */
const sendConvertedResponse = (res) => {
  return `${res}\n`;
};

/**
 * Broadcasting a payload to all players in room, excluding the user with the excludeUserId.
 * @param {*} room The room to broadcast to.
 * @param {*} excludeUserId The user to exclude.
 * @param {*} payload The payload to broadcast.
 */
const broadCastToRoom = (room, excludeUserId, payload) => {
  // Notify other players about game start.
  let otherPlayers = sockets.filter(
    (s) => room.players.includes(s.name) && s.name !== excludeUserId
  );

  otherPlayers.forEach((op) => {
    op.write(
      sendConvertedResponse(
        JSON.stringify({
          commandCode: OutCommandCodes.RoomJoinedOther,
          props: { ...room },
        })
      )
    );
  });
};
