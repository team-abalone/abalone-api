import randomstring from "randomstring";

import {
  RoomNotFoundException,
  RoomFullException,
  NotRoomHostException,
  NotInRoomException,
  AlreadyInRoomException,
  InvalidCommandException,
} from "../Exceptions.js";
import { FieldConfigs } from "../GlobalVars.js";

/**
 * Contains logic implementations, regarding
 * all actions around rooms.
 */
class RoomControls {
  rooms;
  constructor() {
    this.rooms = [];
  }

  /**
   * Creates a new room for the user with the given id
   * and returns it.
   * @param {*} userId The id of the user to create the room for.
   * @returns The roomKey of the created room.
   */
  createRoom = (userId, numberOfPlayers) => {
    let existing = this.findRoomByPlayer(userId);

    if (existing) {
      throw new AlreadyInRoomException(existing.roomkey);
    }

    if (isNaN(numberOfPlayers)) {
      throw new InvalidCommandException();
    }

    let room = {
      roomKey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
      numberOfPlayers: numberOfPlayers,
    };

    this.rooms.push(room);
    return room.roomKey;
  };

  /**
   * Enables the user with the given id to join a room with the given roomKey.
   * @param {*} userId The userId of the user to create the room for.
   * @param {*} roomKey The roomKey of the room to join     *
   */
  joinRoom = (userId, roomKey) => {
    let roomToJoin = this.rooms.find((r) => r.roomKey == roomKey);

    if (!roomToJoin) {
      throw new RoomNotFoundException(roomKey);
    }

    if (roomToJoin.players.length >= roomToJoin.numberOfPlayers) {
      throw new RoomFullException(roomToJoin.roomkey);
    }

    if (roomToJoin.players.includes(userId)) {
      throw new AlreadyInRoomException(this.findRoomByPlayer(userId).roomkey);
    }

    if (!roomToJoin.players.includes(userId)) {
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
      throw new RoomNotFoundException(roomKey);
    }

    if (room.createdBy !== userId) {
      throw new NotRoomHostException();
    }

    // For now we always return the same field.
    let field = { ...FieldConfigs.TwoPlayers.Default };
    room.gameField = { ...field };

    return room;
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
   * Returns the room the user with the given id is currently in.
   * @param {*} userId The id of the user to search the room for.
   * @returns The room the user with the given id is in.
   */
  findRoomByPlayer = (userId) => {
    return this.rooms.find((rooms) =>
      rooms.players.find((p) => p.userId === userId)
    );
  };

  /**
   * Closes the room with the given roomKey, provided that the userId
   * matches the creators userId.
   * @param {*} userId The userId of the user, that made the request.
   * @param {*} roomKey The roomKey of the room to close.
   */
  closeRoom = (userId, roomKey) => {
    let room = this.rooms.find((r) => r.roomKey === roomKey);

    if (!room) {
      throw new RoomNotFoundException(roomKey);
    }

    if (room.createdBy !== userId) {
      throw new NotRoomHostException();
    }

    // Remove room from array.
    this.rooms = this.rooms.filter((r) => (r === r.roomKey) === roomKey);
    console.log(`Room with key ${roomKey} was deleted.`);

    return room;
  };

  /**
   * Lets player leave the room
   * Calls closeRoom() if room is empty after leaving or if the host leaves
   * @param {*} userId The userId; needed for findRoomByPlayer()-call
   */
  leaveRoom = (userId) => {
    let roomToLeave = this.findRoomByPlayer(userId);

    if (!roomToLeave) {
      throw new NotInRoomException(userId);
    }

    let { createdBy, roomKey, players } = roomToLeave;

    //If host leaves, the room should close.
    if (createdBy === userId || players.length < 1) {
      this.closeRoom(userId, roomKey);
    }
  };
}

export default RoomControls;
