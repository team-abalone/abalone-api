import randomstring from "randomstring";

/**
 * Contains logic implementations, regarding
 * all actions around rooms.
 */
class RoomControls {
  rooms = [];

  constructor() {}

  /**
   * Creates a new room for the user with the id <props.userId>
   * and returns it.
   * @param {*} props
   * @returns The roomKey of the created room.
   */
  createRoom = (userId) => {
    //TODO: Check if user already has room and close it.

    let room = {
      roomkey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
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

  //Subroutine used to find the Room a certain player is in
  //Mainly to be used in other functions
  findRoomByPlayer = (userId) => {
    return this.rooms.find((rooms) => rooms.players === userId);
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
