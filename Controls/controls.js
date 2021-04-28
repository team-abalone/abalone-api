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
    static joinRoom = (rooms, roomKey) => {

    }

    //Subroutine used to search Rooms to find one with the right key
    //Mainly to be used in other functions
    static findRoomViaKey = (rooms, roomKey) => {
        console.log(`Roomkey given: ${roomKey}\n`); //debug line
        let foundRoom;
        let check = 0;                              //will stay 0 if no room is found
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i][0] == roomKey) {
                foundRoom = rooms[i];
                check = 1;                          // room found -> check passes
            }
        }
        if (check == 0) {                           //Null will be returned in case of no found room. 
            console.log("ROOM NOT FOUND");          //debug line -> TO DO: write message to socket
            return null;
        }

        return foundRoom;
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

