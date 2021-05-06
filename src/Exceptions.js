function InvalidCommandException(message) {
    this.message = message;
    this.name = "InvalidCommandException";
}
function InvalidActionException(message) {
    this.message = message;
    this.name = "InvalidActionException";
}
function RoomNotFoundException(key) {
    this.message = `Room with key ${key} not found\n`;
    if (key !== 'undefined') {
        if (key.split('').length != 4) {
            this.message = `${key} is not a valid key. A key must have 5 digits.\n`
        }
    }
    this.name = "RoomNotFoundException";
}
function RoomFullException(key) {
    this.message = `Room with key ${key} is already full.\n`;
    this.name = "RoomFullException";
}
function NotRoomHostException() {
    this.message = `You have no rights do delete another player's room.\n`;
    this.name = `NotRoomHostException`;
}
function NotInRoomException(userId) {
    this.message = `User with Id '${userId}' is currently not in a room.\n`;
    this.name = `NotInRoomException`;
}
function AlreadyInRoomException(key) {
    this.message = `You are currently in a room with the key '${key}'\n`;
    this.name = `AlreadyInRoomException`;
}
export { InvalidCommandException, InvalidActionException, RoomFullException, RoomNotFoundException, NotRoomHostException, NotInRoomException, AlreadyInRoomException }