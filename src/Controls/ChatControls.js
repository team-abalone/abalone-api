class ChatControls {
  constructor() {}

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
  };
}

export default ChatControls;
