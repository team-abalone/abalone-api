function InvalidCommandException(message) {
  this.message = message;
  this.name = InvalidCommandException.name;
}
function InvalidActionException(message) {
  this.message = message;
  this.name = InvalidActionException.name;
}
function RoomNotFoundException(key) {
  this.message = `Room with key ${key} not found`;
  /* TODO: That's some fucked up code.
  if (key !== "undefined") {
    if (key.split("").length != 4) {
      this.message = `${key} is not a valid key. A key must have 5 digits.`;
    }
  }
  */
  this.name = RoomNotFoundException.name;
}
function RoomFullException(key) {
  this.message = `Room with key ${key} is already full.`;
  this.name = RoomFullException.name;
}
function NotRoomHostException() {
  this.message = `You have no rights do delete another player's room.`;
  this.name = NotRoomHostException.name;
}
function NotInRoomException(userId) {
  this.message = `User with Id '${userId}' is currently not in a room.`;
  this.name = NotInRoomException.name;
}
function AlreadyInRoomException(key) {
  this.message = `You are currently in a room with the key ${key}`;
  this.name = AlreadyInRoomException.name;
}
function BadRequestException() {
  this.message = `Request structure incorrect.`;
  this.name = BadRequestException.name;
}
export {
  InvalidCommandException,
  InvalidActionException,
  RoomFullException,
  RoomNotFoundException,
  NotRoomHostException,
  NotInRoomException,
  AlreadyInRoomException,
  BadRequestException,
};
