import randomstring from 'randomstring';

class serverControls {
    static createRoom = (socket) => {
        /* CreateRoom returns a new room that is pushed to an array of rooms in the index.js
         The remoteadress of the person that created the room will initially be stored in room[1] (as host)  */

       let room = [];                                                    // Element [0] will be room key, this will be needed for people to join the room
       room.push(randomstring.generate(5));                             //Generates 5 digit randomstring as roomkey
       socket.name = `${socket.remoteAddress} : ${socket.remotePort}`;  //later identifies corresponding socket

       room.push(socket.name);
       

        return room;
    }

    //Function to let players 2-4 enter the room via key
    static joinRoom = (rooms, roomKey, socket) => {

        socket.name = `${socket.remoteAddress} : ${socket.remotePort}`;
        let roomToJoin = this.findRoomViaKey(rooms, roomKey);
        if (this.checkPlayers(roomToJoin) > 4) {
            console.log("ERROR: ROOM IS FULL");
        }
        else {
            roomToJoin.push(socket.name);
            console.log(`${socket.name} joined the room with the key ${roomKey}\nNumber of Players: ${this.checkPlayers(roomToJoin)}`);
        }

    }
    //Subroutine used to display number of players that are currently in a room
    //Mainly to be used in other functions
    static checkPlayers = (room) => {
        return (room.length - 1);
    }

    //Subroutine used to search Rooms to find one with the right key
    //Mainly to be used in other functions
    // TO DO : find out why string comparison is always false, even though the strings seem equal
    static findRoomViaKey = (rooms, roomKey) => {
        console.log(`Roomkey given: ${roomKey}\n`); //debug line
        
        let foundRoom;
        let check = 0;                              //will stay 0 if no room is found
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i][0].normalize() === roomKey.normalize()) {
                foundRoom = rooms[i];
                console.log(typeof (roomKey) + " " + roomKey);
                console.log(typeof (rooms[i][0]) + " " + rooms[i][0]);
                check = 1;                          // room found -> check passes
            } else {
                console.log(typeof (roomKey) + " " + roomKey);
                console.log(typeof (rooms[i][0]) + " " + rooms[i][0]);
            }
        }
        if (check == 0) {                           //Null will be returned in case of no found room. 
            console.log("ROOM NOT FOUND");          //debug line -> TO DO: write message to socket
            
            return null;
        }

        return foundRoom;
    }
    //debug function
    static displayRooms = (rooms) => {
        for (let i = 0; i < rooms.length; i++) {
            console.log(rooms[i][0]);
        }
    }

    //Dummy function to test Server functionality
    static chatFunction = (data) => {
        let extractedString = (data + '').split(" ");
        let name = extractedString[1];
        let msg = "";
        
        for (let i = 2; i < extractedString.length; i++) {
            msg += `${extractedString[i]} `;
        }
        console.log(`${name} said: ${msg}`);

       // return { name, msg };  -Eventually, the server will response with an array
    }
}
export default serverControls;

