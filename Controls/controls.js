import randomstring from 'randomstring';

class serverControls {
    /* CreateRoom returns a new room that is pushed to an array of rooms in the index.js
    The remoteadress of the person that created the room will initially be stored in room[1] (as host)  */
    static createRoom = (socket) => {

       let room = [];                                                    // Element [0] will be room key, this will be needed for people to join the room
       room.push(randomstring.generate(5));                             //Generates 5 digit randomstring as roomkey
       socket.name = `${socket.remoteAddress} : ${socket.remotePort}`;  //later identifies corresponding socket

       room.push(socket);
       

        return room;
    }

    //Function to let players 2-4 enter the room via key
    static joinRoom = (rooms, roomKey, socket) => {

        socket.name = `${socket.remoteAddress} : ${socket.remotePort}`;
        let roomToJoin = this.findRoomViaKey(rooms, roomKey);
        if (roomToJoin != undefined) {
            if (this.checkPlayers(roomToJoin) > 4) {
                console.log("ERROR: ROOM IS FULL");
            }
            else {
                roomToJoin.push(socket);
                console.log(`${socket.name} joined the room with the key ${roomKey}\nNumber of Players: ${this.checkPlayers(roomToJoin)}`);
            }
        } else {
            socket.write("Room could not be found. Please try enter the key again.")
        }

    }

    //Subroutine used to display number of players that are currently in a room
    //Mainly to be used in other functions
    static checkPlayers = (room) => {
        return (room.length - 1);
    }

    //Subroutine used to search Rooms to find one with the right key
    //Mainly to be used in other functions
    // TO DO : refactoring later on
    static findRoomViaKey = (rooms, roomKey) => {
        
        //roomkey had a space at the end that a room at [0] doesnt have. This solution should be refactored later on
        let roomKeyNew = roomKey.split('')[0] + roomKey.split('')[1] + roomKey.split('')[2] + roomKey.split('')[3] + roomKey.split('')[4];

        let foundRoom;
        
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i][0].toString().normalize() == roomKeyNew.normalize()) {
                foundRoom = rooms[i];
                console.log("FOUND A ROOM");                               
            }
        }
        // If no room is found, 'foundRoom' will be returned as 'undefined'
        return foundRoom;
    }

    //debug function
    static displayRooms = (rooms) => {
        for (let i = 0; i < rooms.length; i++) {
            console.log(rooms[i][0]);
        }
    }

    //Subroutine used to find the Room a certain player is in
    //Mainly to be used in other functions
    static findRoomByPlayer = (rooms, socket) => {
        let foundRoom;
        for (let i = 0; i < rooms.length; i++) {
            for (let j = 1; j < rooms[i].length; j++) {
                if (rooms[i][j].name == socket.name) {
                    foundRoom = rooms[i];
                }             
            }
        }
        //Similar to findRoomViaKey, foundRoom will be returned as undefined if no room could be found
        return foundRoom;
    }


    //Dummy function to test Server functionality
    static chatFunction = (data, rooms, socket) => {
        let extractedString = data.toString().split(" ");
        let name = extractedString[1];
        let msg = "";
        
        for (let i = 2; i < extractedString.length; i++) {
            msg += `${extractedString[i]} `;
        }
        //gets the Room the current socket is in
        let currentRoom = this.findRoomByPlayer(rooms, socket);
        if (currentRoom != undefined) {
            //Writes to every socket in the room
            for (let i = 1; i < currentRoom.length; i++) {
                currentRoom[i].write(msg);
            }
        } else {
            socket.write("Currently, you appear not to be in a room.");
        }
       // return { name, msg };  -Eventually, the server will respond with an array
    }

    //Filter out rooms that have no players, whenever a player leaves
    static closeRoom = () => { }
}

   
export default serverControls;

