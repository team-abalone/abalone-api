function InvalidCommandException(message) {
    this.message = message;
    this.name = "InvalidCommandException";
}

function InvalidActionException(message) {
    this.message = message;
    this.name = "InvalidActionException";
}
function RoomNotFoundException(key) {
    this.message = `Room with key ${key} not found`;
    this.name = "RoomNotFoundException";
}
function RoomFullException(key) {
    this.message = `Room with key ${key} is already full.`;
    this.name = "RoomFullException";
}
function NotRoomHostException() {
    this.message = `You have no rights do delete another player's room.`;
    this.name = `NotRoomHostException`;
}

export { InvalidCommandException, InvalidActionException, RoomFullException, RoomNotFoundException }