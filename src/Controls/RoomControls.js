import randomstring from "randomstring";

import { RoomNotFoundException, RoomFullException, NotRoomHostException, NotInRoomException, AlreadyInRoomException, BadRequestException } from "../Exceptions.js";
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
    createRoom = (userId, numberOfPlayers, socket) => {
        //TODO: Check if user already has room and close it.
        let exceptionThrown = false;
        try {
            if (this.findRoomByPlayer(userId) != null) {
                throw new AlreadyInRoomException(this.findRoomByPlayer(userId).roomkey)
            }
            if (isNaN(numberOfPlayers)) {
                throw new BadRequestException();
            }
        }
        catch (e) {
            socket.write(`${e.name}: ${e.message}\n`);
            exceptionThrown = true;
        }
        if (exceptionThrown == false) {
            //Room maps userId to socket. Needed for broadcasting across room
            let room = {
                "roomkey": randomstring.generate(5),
                "createdBy": userId,
                "players": [{
                    "userId": userId,
                    "socket" : socket
                }],
                "numberOfPlayers": numberOfPlayers,
            };
            this.rooms.push(room);
            return room.roomkey;
        }
    }


    /**
     * Enables the user with the given id to join a room with the given roomKey.
     * @param {*} userId The userId of the user to create the room for.
     * @param {*} roomKey The roomKey of the room to join     * 
     */
    joinRoom = (userId, roomKey, socket) => {
        let roomToJoin = this.rooms.find((r) => r.roomkey == roomKey);
        let exceptionThrown = false;

        try {
            if (!roomToJoin) {
                throw new RoomNotFoundException(roomKey);
            }

            if (roomToJoin.players.length >= roomToJoin.numberOfPlayers) {
                throw new RoomFullException(roomToJoin.roomkey);
            }

            if (this.findRoomByPlayer(userId)) {
                throw new AlreadyInRoomException(this.findRoomByPlayer(userId).roomkey);
            }
        } catch (e) {
            socket.write(`${e.name}: ${e.message}`);
            exceptionThrown = true;
        }
        if (exceptionThrown === false) {
            roomToJoin.players.push(
                {
                    "userId": userId,
                    "socket": socket
                }
            );
            
            this.broadcastToRoom(roomToJoin, `\n${userId} joined the room.`);
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
        console.log(userId);
        return this.rooms.find((rooms) => rooms.players.find((p) => p.userId === userId));
    };

    /**
     * Closes the room with the given roomKey, provided that the userId
     * matches the creators userId.
     * @param {*} userId The userId of the user, that made the request.
     * @param {*} roomKey The roomKey of the room to close.
     */
    closeRoom = (userId, roomKey, socket) => {
        let room = this.rooms.find((r) => r.roomkey === roomKey);
        let exceptionThrown = false;
        let roomHost = room.createdBy;

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
            this.broadcastToRoom(roomToLeave, `\n${userId} has left`);
            roomToLeave = roomToLeave.players.filter((p) => p.userId === userId);
            //TODO: broadcast to players in room
            

            //If host leaves, the room should close
            if (roomHost === userId) {
                this.closeRoom(userId, roomToLeaveKey, socket);
            }
            //If no player remains, the room should close as well
            else if (amountPlayers <= 1) {
                this.closeRoom(userId, roomToLeaveKey, socket);
            }
        }
    };

    /**
     * For automatic leaving when socket is closed
     * @param {*} socket - Required to get corresponding room
     */
    leaveRoomWithSocket = (socket) => {
        let userId;
        for (let i=0; i < this.rooms.length; i++) {
            for (let j = 0; j < this.rooms[i].players.length; j++) {
                if (this.rooms[i].players[j].socket === socket) {
                    userId = this.rooms[i].players[j].userId;
                }
            }
        }
        this.leaveRoom(userId, socket);
    }

    /**
     * Subroutine used for server to send messages across a room.
     * @param {*} room - To get sockets of all players
     * @param {*} message - Message that is broadcastet among players whithin a room
     */
    broadcastToRoom = (room, message) => {
        for (let i = 0; i < room.players.length; i++) {
            room.players[i].socket.write(message);
        }
    }
   
    
}

  
export default RoomControls;
