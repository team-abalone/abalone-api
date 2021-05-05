import randomstring from "randomstring";
import { RoomNotFoundException, RoomFullException, NotRoomHostExeption } from "../Exceptions.js"

/**
 * Contains logic implementations, regarding
 * all actions around rooms.
 */
class RoomControls {
    rooms;
    constructor() {
        this.rooms =[];
    }

  /**
   * Creates a new room for the user with the given id
   * and returns it.
   * @param {*} userId The id of the user to create the room for.
   * @returns The roomKey of the created room.
   */

    
    createRoom = (userId) => {
    //TODO: Check if user already has room and close it.

    let room = {
      "roomkey": randomstring.generate(5),
      "createdBy": userId,
      "players": [userId]
    };

    this.rooms.push(room);

    return room.roomkey;
  };

  /**
   * Enables the user with the given id to join a room with the given roomKey.
   * @param {*} userId The userId of the user to create the room for.
   * @param {*} roomKey The roomKey of the room to join
   */
  joinRoom = (userId, roomKey) => {
    let roomToJoin = this.rooms.find((r) => r.roomkey == roomKey);

      try {
          if (!roomToJoin) {
              throw new RoomNotFoundException(roomKey);
          }
      } catch (e) {
          socket.write(`${e.name}: ${e.message}`);
      }
      try {
          if (roomToJoin.players > 4) {
              throw new RoomFullException(roomToJoin.roomKey);
          }
      } catch (e) {
          socket.write(`${e.name}: ${e.message}`);
      }

    let alreadyJoined = roomToJoin.players.find((x) => x.userId == userId);

    if (!alreadyJoined) {
      roomToJoin.players.push(userId);
    }
  };

  /**
   * Just used for debugging purposes.
   * TODO: remove later.
   * @param {*} rooms
   */
  displayRooms = (rooms) => {
    for (let i = 0; i < rooms.length; i++) {
      console.log(rooms[i][0]);
    }
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
    let room = this.rooms.find((r) => r.roomkey == roomKey);

      try {
          if (!room) {
              throw new RoomNotFoundException(roomKey);
          }

          if (room.createdBy !== userId) {
              throw new NotRoomHostExeption();

          }

          // Remove room from array.
          this.rooms = this.rooms.filter((r) => r === room);
      }
      catch (e) {
          socket.write(`${e.name}: ${e.message}`);
      }
  };
}

export default RoomControls;
