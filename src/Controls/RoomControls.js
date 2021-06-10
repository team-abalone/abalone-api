import cryptoRandomString from "crypto-random-string";

import {
  RoomNotFoundException,
  RoomFullException,
  NotRoomHostException,
  NotInRoomException,
  AlreadyInRoomException,
  InvalidCommandException,
} from "../Exceptions.js";
import { FieldConfigs, InitialFieldTypes } from "../GlobalVars.js";

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
  createRoom = (userId, numberOfPlayers, userName, gameFieldType) => {
    let existing = this.findRoomByPlayer(userId);

    // Close existing room if exists.
    if (existing) {
      this.closeRoom(userId, existing.roomKey);
      //throw new AlreadyInRoomException(existing.roomKey);
    }

    if (isNaN(numberOfPlayers)) {
      throw new InvalidCommandException();
    }

    let room = {
      roomKey: cryptoRandomString({ length: 5, type: "distinguishable" }),
      createdBy: userId,
      players: [userId],
      numberOfPlayers: numberOfPlayers,
      gameFieldType,
      playerMap: { [userId]: userName },
    };

    this.rooms.push(room);
    return room.roomKey;
  };

  /**
   * Enables the user with the given id to join a room with the given roomKey.
   * @param {*} userId The userId of the user to create the room for.
   * @param {*} roomKey The roomKey of the room to join     *
   */
  joinRoom = (userId, roomKey, userName) => {
    let roomToJoin = this.rooms.find((r) => r.roomKey == roomKey);

    if (!roomToJoin) {
      throw new RoomNotFoundException(roomKey);
    }

    if (roomToJoin.players.length >= roomToJoin.numberOfPlayers) {
      throw new RoomFullException(roomToJoin.roomKey);
    }

    if (roomToJoin.players.includes(userId)) {
      throw new AlreadyInRoomException(this.findRoomByPlayer(userId).roomKey);
    }

    if (!roomToJoin.players.includes(userId)) {
      roomToJoin.players.push(userId);
      roomToJoin.playerMap[userId] = userName;
    }

    return roomToJoin;
  };

  /**
   * Starts the game with the given roomKey.
   * @param {*} userId
   * @param {*} roomKey
   */
  startGame = (userId) => {
    let room = this.findRoomByPlayer(userId);

    if (!room) {
      throw new RoomNotFoundException(roomKey);
    }

    if (room.createdBy !== userId) {
      throw new NotRoomHostException();
    }

    // For now we always return the same field.
    let initField;

    switch (room.gameFieldType) {
      case InitialFieldTypes.Default:
        initField = FieldConfigs.TwoPlayers.Default;
        break;
      default:
        initField = FieldConfigs.TwoPlayers.GermanDaisy;
        break;
    }

    var field = Object.keys(initField).map(function (key) {
      return initField[key];
    });

    room.gameField = field;
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].id === room.id) {
        this.rooms[i] = room;
      }
    }
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
    return this.rooms.find((rooms) => rooms.players.includes(userId));
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

  /**
   * This will be of need for updates that occur from other Controls-classes
   * Changes will be brought here to make them permanent
   * @param {any} room
   */
  updateRooms = (room) => {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].roomKey === room.roomKey) {
        rooms[i] = room;
      }
    }
  };
}

export default RoomControls;
