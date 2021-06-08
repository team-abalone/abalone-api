import net from "net";

const PORT = process.env.PORT || 5001;
const host = process.env.HOST || "0.0.0.0";

import { RoomControls, ChatControls, GameControls } from "./Controls/index.js";
import {
  InCommandCodes,
  OutCommandCodes,
  ExceptionCodes,
} from "./GlobalVars.js";

import { v1 as uuidv1 } from "uuid";

import {
  InvalidCommandException,
  RoomException,
  ServerException,
  GameException,
} from "./Exceptions.js";

const server = net.createServer();

const roomControls = new RoomControls();
const chatControls = new ChatControls();
const gameControls = new GameControls();

let sockets = [];

server.listen(PORT, host, function () {
  console.log(`Abalone server running \nPORT: ${PORT} \Host: ${host}\n`);
});

/**
 * The following structure is used to send commands:
 * {
 *  userId: <userId>,
 *  commandCode: <commandCode>
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

    let {
      userId,
      commandCode,
      numberOfPlayers,
      roomKey,
      marbles,
      direction,
      gameFieldType,
      userName,
      renegadeId,
      secondTurn,
    } = convertedData;

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
          sendConvertedResponse({
            commandCode: OutCommandCodes.IdInitialized,
            userId,
          })
        );
      } else if (commandCode === InCommandCodes.CreateRoom) {
        let roomKey = roomControls.createRoom(
          userId,
          numberOfPlayers,
          userName,
          gameFieldType
        );

        // Send roomKey to room creator.
        socket.write(
          sendConvertedResponse({
            commandCode: OutCommandCodes.RoomCreated,
            roomKey,
          })
        );
      } else if (commandCode === InCommandCodes.JoinRoom) {
        let room = roomControls.joinRoom(userId, roomKey, userName);

        // Notify current user about his successful join.
        socket.write(
          sendConvertedResponse({
            commandCode: OutCommandCodes.RoomJoined,
            roomKey: room?.roomKey,
            players: room?.players,
            createdBy: room?.createdBy,
            numberOfPlayers: room?.numberOfPlayers,
            playerMap: room?.playerMap,
          })
        );

        // Notify other players in room about room join.
        broadCastToRoom(room, userId, {
          commandCode: OutCommandCodes.RoomJoinedOther,
          roomKey: room?.roomKey,
          players: room?.players,
          createdBy: room?.createdBy,
          numberOfPlayers: room?.numberOfPlayers,
          playerMap: room?.playerMap,
        });
      } else if (commandCode === InCommandCodes.CloseRoom) {
        let room = roomControls.closeRoom(userId, roomKey);

        if (room) {
          socket.write(
            sendConvertedResponse({
              commandCode: OutCommandCodes.RoomClosed,
            })
          );
        }

        // Notify other players in room about room closal.
        broadCastToRoom(room, userId, {
          commandCode: OutCommandCodes.RoomClosed,
        });
      } else if (commandCode === InCommandCodes.StartGame) {
        let room = roomControls.startGame(userId);
        let players = [];

        // Notify creator of room about successful game start.
        socket.write(
          sendConvertedResponse({
            commandCode: OutCommandCodes.GameStarted,
            gameField: room.gameField,
            roomKey: room?.roomKey,
            players: room?.players,
            createdBy: room?.createdBy,
            numberOfPlayers: room?.numberOfPlayers,
            playerMap: room?.playerMap,
          })
        );

        // Notify other players in room about game start.
        broadCastToRoom(room, userId, {
          commandCode: OutCommandCodes.GameStarted,
          gameField: room.gameField,
          roomKey: room?.roomKey,
          players: room?.players,
          createdBy: room?.createdBy,
          numberOfPlayers: room?.numberOfPlayers,
          playerMap: room?.playerMap,
        });
      } else if (commandCode === InCommandCodes.SendChatMessage) {
        // TODO: Fix or remove, chat not that important right now.
        chatControls.chatFunction(data, rooms, socket);
      } else if (commandCode === InCommandCodes.MakeMove) {
        //If move is not valid, an exception will be thrown here
        gameControls.makeMove(
          roomControls.findRoomByPlayer(userId),
          marbles,
          direction,
          renegadeId,
          secondTurn
        );
        //Broadcast marbles and direction that are to be moved to other players
        broadCastToRoom(roomControls.findRoomByPlayer(userId), userId, {
          commandCode: OutCommandCodes.MadeMove,
          ids: marbles,
          direction: direction,
          renegadeId: renegadeId,
          secondTurn: secondTurn,
        });
      } else if (commandCode === InCommandCodes.CloseGame) {
        roomControls.updateRooms(
          gameControls.closeGame(roomControls.findRoomByPlayer(userId))
        );
        socket.write(
          sendConvertedResponse({
            commandCode: OutCommandCodes.CloseGame,
            message: `Game has been closed. Returning to lobby.`,
          })
        );
      } else {
        throw new InvalidCommandException();
      }
    } catch (err) {
      // Here we handle errors in case something goes wrong ;)

      //Separation may be of need later on - TODO: update if needed or remove if there will not be a significant difference
      if (err instanceof RoomException) {
        socket.write(
          sendConvertedResponse({
            commandCode: ExceptionCodes.RoomException,
            response: err.response,
          })
        );
        console.error(err);
      } else if (err instanceof ServerException) {
        socket.write(
          sendConvertedResponse({
            commandCode: ExceptionCodes.ServerException,
            response: err.response,
          })
        );
        console.error(err);
      } else if (err instanceof GameException) {
        socket.write(
          sendConvertedResponse({
            commandCode: ExceptionCodes.GameException,
            response: err.response,
          })
        );
      } else {
        socket.write(sendConvertedResponse(err.response));
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
  return `${JSON.stringify(res)}\n`;
};

/**
 * Broadcasting a payload to all players in room, excluding the user with the excludeUserId.
 * @param {*} room The room to broadcast to.
 * @param {*} excludeUserId The user to exclude.
 * @param {*} payload The payload to broadcast.
 */
//TODO: param room is redundant. whithin broadCastToRoom, we can retrieve the corresponding room via the exludeUserId-param
const broadCastToRoom = (room, excludeUserId, payload) => {
  // Notify other players about game start.
  let otherPlayers = sockets.filter(
    (s) => room.players.includes(s.name) && s.name !== excludeUserId
  );

  console.log(payload);
  otherPlayers.forEach((op) => {
    op.write(sendConvertedResponse(payload));
  });
};
