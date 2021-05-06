import randomstring from "randomstring";

import { RoomNotFoundException, RoomFullException, NotRoomHostException, NotInRoomException, AlreadyInRoomException } from "../Exceptions.js";
import { GameParameters, FieldConfigs } from "../GlobalVars";


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
  createRoom = (userId, numberOfPlayers,socket) => {
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
      "roomkey": randomstring.generate(5),
      "createdBy": userId,
      "players": [userId],
      "numberOfPlayers":numberOfPlayers,
    };


    /**
     * Enables the user with the given id to join a room with the given roomKey.
     * @param {*} userId The userId of the user to create the room for.
     * @param {*} roomKey The roomKey of the room to join
     */
    joinRoom = (userId, roomKey, socket) => {
        let roomToJoin = this.rooms.find((r) => r.roomkey == roomKey);
        let exceptionThrown = false;

        try {
            
            if (!roomToJoin) {
                throw new RoomNotFoundException(roomKey);
            }

            if (roomToJoin.players > 4) {
                throw new RoomFullException(roomToJoin.roomKey);
            }

            if (this.findRoomByPlayer(userId)) {
                throw new AlreadyInRoomException(this.findRoomByPlayer(userId).roomkey);
            }
        } catch (e) {
            socket.write(`${e.name}: ${e.message}`);
            exceptionThrown = true;
        }
        if (exceptionThrown === false) {
            roomToJoin.players.push(userId);
            socket.write("Room joined successfully");
        } else {
            socket.write("Could not join room.");
        }
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
   * Returns the room with the given roomKey
   * @param {*} roomKey The roomKey of the room to search.
   * @returns The room the roomKey belongs to.
   */
  findRoomByRoomKey = (roomKey) => {
    return this.rooms.find((rooms) => rooms.roomkey === roomKey);
  };
  


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
    closeRoom = (userId, roomKey,socket) => {
        let room = this.rooms.find((r) => r.roomkey === roomKey);
        let exceptionThrown = false;
        let roomHost = room.createdBy;
        //debug
        console.log(roomHost);
        try {
            if (room === 'undefined') {
                throw new RoomNotFoundException(roomKey);
            }
            if (room.createdBy !== userId) {
                throw new NotRoomHostException();

            }            
        }
        catch (e) {
            socket.write(`${e.name}: ${e.message}`);
            exceptionThrown = true;
        }
        // Remove room from array.
        if (exceptionThrown == false) {
            this.rooms = this.rooms.filter((r) => r === room);
            console.log(`Room with key ${roomKey} was deleted`);
        }
    };


    /**
     * Lets player leave the room
     * Calls closeRoom() if room is empty after leaving or if the host leaves
     * @param {*} userId The userId; needed for findRoomByPlayer()-call
     */
    leaveRoom = (userId, socket) => {
        let roomToLeave;
        let exceptionThrown = false;
        try {
            roomToLeave = this.findRoomByPlayer(userId);

            if (roomToLeave === 'undefined') {
                throw new NotInRoomException(userId);                
            }
           
        }
        catch (e) {
            socket.write(`${e.name}: ${e.message}`);
            exceptionThrown = true;
        }

        if (exceptionThrown == false) {
            let amountPlayers = roomToLeave.players.length;
            let roomHost = roomToLeave.createdBy;
            let roomToLeaveKey = roomToLeave.roomkey;
            //debug line
            console.log(`key: ${roomToLeaveKey} \ncreatedBy: ${roomHost} \nNumber of players: ${amountPlayers}`);
            roomToLeave = roomToLeave.players.filter((r) => r.userId === userId);
            //TODO: broadcast to players in room
            console.log(`Room with key ${roomToLeaveKey}: \n${userId} has left`);

            //If host leaves, the room should close
            if (roomHost === userId) {
                this.closeRoom(userId, roomToLeaveKey,socket);
            }
            //If no player remains, the room should close as well
            else if (amountPlayers <= 1) {
                this.closeRoom(userId, roomToLeaveKey,socket);
            }
        }
    };
    
}
  
export default RoomControls;
