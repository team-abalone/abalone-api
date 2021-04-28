import randomstring from 'randomstring';

class serverControls {
    static createRoom = (socket) => {
        /* CreateRoom returns a new room that is pushed to an array of rooms in the index.js
         The remoteadress of the person that created the room will initially be stored in room[1] (as host)  */

       let room = [];                                                    // Element [0] will be room key, this will be needed for people to join the room
       room.push(randomstring.generate(5));                             //Generates 5 digit randomstring as roomkey
       socket.name = `${socket.remoteAddress} : ${socket.remotePort}`;  //later identifies corresponding socket

       room.push(socket.name);
        console.log(`Raum[0]: ${room[0]} \nRaum[1]: ${room[1]}`);

        return room;
    }
    
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

