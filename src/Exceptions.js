class ServerException extends Error {
  constructor(message) {
    super(message);
    this.response = {
      Exception: this.constructor.name,
      Message: message,
    };
    Error.captureStackTrace(this, this.constructor);
  }
}
class InvalidCommandException extends ServerException {
  constructor() {
    super(`Command with invalid command-structure submitted.`);
  }
}
class GameException extends Error {
  constructor(message) {
    super(message);
    this.response = {
      Exception: this.constructor.name,
      Message: message,
    };
    Error.captureStackTrace(this, this.constructor);
  }
}

class GameNotStartedException extends GameException {
  constructor() {
    super(`Currently, there is no active game.`);
  }
}
class FieldException extends GameException {
  constructor() {
    super(`Invalid field-structure detected.`);
  }
}
class InvalidDirectionException extends GameException {
  constructor() {
    super(`Invalid Direction detected`);
  }
}
class GameCommandException extends GameException {
  constructor() {
    super(`Invalid GameCommand`);
  }
}
class RoomException extends Error {
  constructor(message) {
    super(message);
    this.response = {
      Exception: this.constructor.name,
      Message: message,
    };
    Error.captureStackTrace(this, this.constructor);
  }
}
class AlreadyInRoomException extends RoomException {
  constructor(roomKey) {
    super(`You are currently in a room with the key ${roomKey}`);
  }
}

class NotInRoomException extends RoomException {
  constructor(userId) {
    super(`User with Id ${userId} is currently not in a room.`);
  }
}

class NotRoomHostException extends RoomException {
  constructor() {
    super(`You have no rights to delete another player's room`);
  }
}
class RoomFullException extends RoomException {
  constructor(roomKey) {
    super(`Room with ${roomKey} is already full`);
  }
}
class RoomNotFoundException extends RoomException {
  constructor(roomKey) {
    super(`Room with key ${roomKey} not found`);
  }
}

export {
  InvalidCommandException,
  RoomFullException,
  RoomNotFoundException,
  NotRoomHostException,
  NotInRoomException,
  AlreadyInRoomException,
  RoomException,
  ServerException,
  GameException,
  GameNotStartedException,
  FieldException,
  InvalidDirectionException,
  GameCommandException,
};
