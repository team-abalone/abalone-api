import randomstring from "randomstring";
import { GameParameters, FieldConfigs } from "../GlobalVars";

/**
 * Contains logic implementations, regarding
 * all actions around rooms.
 */
class RoomControls {
  rooms = [];

  constructor() {}

  /**
   * Creates a new room for the user with the given id
   * and returns it.
   * @param {*} userId The id of the user to create the room for.
   * @returns The roomKey of the created room.
   */
  createRoom = (userId, numberOfPlayers) => {
    //TODO: Check if user already has room and close it.
    if (
      numberOfPlayers > GameParameters.MaxPlayers ||
      numberOfPlayers < GameParameters.MinPlayers
    ) {
      throw new Error(
        `Number of players needs to be between ${GameParameters.MinPlayers} and ${GameParameters.MaxPlayers}.`
      );
    }

    let room = {
      roomkey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
      numberOfPlayers,
    };

    rooms.push(room);

    return room.roomkey;
  };

  /**
   * Enables the user with the given id to join a room with the given roomKey.
   * @param {*} userId The userId of the user to create the room for.
   * @param {*} roomKey The roomKey of the room to join
   */
  joinRoom = (userId, roomKey) => {
    let roomToJoin = this.rooms.find((r) => r.roomKey == roomKey);

    if (!roomToJoin) {
      throw new Error(
        `Room with key ${roomToJoin.roomKey} could not be found. Make sure to enter a valid key.`
      );
    }

    if (roomToJoin.players > 4) {
      throw new Error(`Room with key ${roomToJoin.roomKey} is already full.`);
    }

    let alreadyJoined = roomToJoin.players.find((x) => x.userId == userId);

    if (!alreadyJoined) {
      roomToJoin.players.push(userId);
    }

    return roomToJoin;
  };

  /**
   * Starts the game with the given roomKey.
   * @param {*} userId
   * @param {*} roomKey
   */
  startGame = (userId, roomKey) => {
    let room = this.findRoomByRoomKey(roomKey);

    if (!room) {
      throw new Error(`Room with roomKey ${roomKey} does not exist.`);
    }

    if (room.createdBy !== userId) {
      throw new Error("Only the owner of a room can start the game.");
    }

    let field = { ...FieldConfigs.TwoPlayers.Default };
    room.gameField = field;

    return room;
  };

  /**
   * Returns the room the user with the given id is currently in.
   * @param {*} userId The id of the user to search the room for.
   * @returns The room the user with the given id is in.
   */
  findRoomByPlayer = (userId) => {
    return this.rooms.find((rooms) => rooms.players.includes(userId));
  };

  /**
   * Returns the room with the given roomKey
   * @param {*} roomKey The roomKey of the room to search.
   * @returns The room the roomKey belongs to.
   */
  findRoomByRoomKey = (roomKey) => {
    return this.rooms.find((rooms) => rooms.roomKey === roomKey);
  };

  /**
   * Closes the room with the given roomKey, provided that the userId
   * matches the creators userId.
   * @param {*} userId The userId of the user, that made the request.
   * @param {*} roomKey The roomKey of the room to close.
   */
  closeRoom = (userId, roomKey) => {
    let room = this.rooms.find((r) => r.roomKey == roomKey);

    if (!room) {
      throw new Error(`Room with key ${roomKey} could not be found.`);
    }

    if (room.createdBy !== userId) {
      throw new Error(`Cannot delete another players room.`);
    }

    // Remove room from array.
    this.rooms = this.rooms.filter((r) => r === room);
  };
}

export default RoomControls;
