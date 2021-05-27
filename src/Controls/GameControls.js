import {
  GameNotStartedException,
  FieldException,
  RoomNotFoundException,
  InvalidDirectionException,
  GameCommandException,
} from "../Exceptions.js";
import { FieldConfigs, Directions } from "../GlobalVars.js";

class GameControls {
  constructor() {}

  /**
   * Assigns our fieldMap - we store which marble belongs to which player and which id is assigned to it
   * May change, depending on the decision if the fieldMap is built in frontend or backend - TODO: Maybe minor changes, depending on decision
   * @param {any} room - Gamefield and Fieldmap should be stored in corresponding Room
   */
  addFieldMap = (room) => {
    if (!room) {
      throw new RoomNotFoundException();
    }
    if (!room.hasOwnProperty("gameField")) {
      throw new GameNotStartedException();
    }
    /*fieldMap will contain: 
        [
        int: player - the player the marble belongs to,
        int//uuid - the marbles unique ID,
        int xCoordinate - xCoordinate of the marble on the board,
        int yCoordinate - yCoordinate of the marble on the board
       ]*/
    let fieldMap = [];
    let currentId = 0;
    //Here we assign unique IDs to each marble that is currently on the board and keep the information on which marble belongs to which player
    //Iterators i and j will be stored as position x and position y
    for (let i = 0; i < room.gameField.length; i++) {
      for (let j = 0; j < room.gameField[i].length; j++) {
        let tempMarble = {
          player: room.gameField[i][j], // Can be 1 or 2 at this stage of developement
          id: currentId,
          xCoordinate: i,
          yCoordinate: j,
        };
        //We only keep marbles in fieldMap - not empty Hexagons
        if (!(tempMarble.player === 0)) {
          fieldMap.push(tempMarble);
          currentId++;
        }
      }
    }
    room.fieldMap = fieldMap; //FieldMap stored in Room with every Hexagon's data
    return room;
  };

  /**
   * Removes fieldMap from our room. Other gamerequests will not work after not having a fieldMap assigned to the room.
   * @param {any} room
   */
  closeGame = (room) => {
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }
    delete room.fieldMap;
    return room;
  };
  /**
   * This function will basically broadcast a players move to every other player.
   * All checks regarding the possibility of making that move are already done in frontend.
   * Request should look like this: {userId: 'id', commandCode: 70, marbles: [id1,id2,id3], direction: 'LEFTUP'}
   * @param {any} room - current room
   * @param {any} marbles - Array of marbles that are to be moved
   * @param {any} direction - Direction the marbles will move to (enum in frontend)
   */
  makeMove = (room, marbles, direction) => {
    if (!marbles) {
      throw new GameCommandException();
    }
    if (marbles.length > 5 || marbles.length < 1) {
      throw new GameCommandException();
    }
    if (!room) {
      throw new RoomNotFoundException();
    }
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }
    //Command checks
    if (!Directions.hasOwnProperty(direction)) {
      throw new InvalidDirectionException();
    }

    if (!direction) {
      throw new GameCommandException();
    }

    //Creating object to broadcast
    let ids = [];
    for (let i = 0; i < marbles.length; i++) {
      ids.push(marbles[i]);
    }
    let marblesWithDirection = {
      ids: ids,
      direction: direction,
    };

    //Updating fieldMap of room
    for (let id in marblesWithDirection.ids) {
      this.updateFieldMap(room, id, marblesWithDirection.direction);
    }
    //TODO: Maybe add 'nextPlayer' to response
    return marblesWithDirection;
    /*Eventually broadcasts a response like this to all Sockets:
       {"commandCode":10,"toMove":{"ids":[1,2,3],"direction":"LEFTUP"}}
        */
  };

  /**
   * Keeping track on all active marbles currently on our board, we have to remove every entry in fieldMap which gets pushed out of the field
   * @param {any} room - current room
   * @param {any} marbleId -int of marble that is being pushed out
   */
  marbleRemoved = (room, marbleId) => {
    if (isNaN(marbleId)) {
      throw new GameCommandException();
    }

    if (!room) {
      throw new RoomNotFoundException();
    }
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }

    for (let entry in room.fieldMap) {
      if (entry.id === marbleId) {
        room.fieldMap = room.fieldMap.filter((x) => x.id === entry.id);
      }
    }
  };
  /**
   * Keep track of all moves made. Will be called automatically by the makeMove()-method
   * Can call marbleRemoved-method() if neccessary
   * @param {any} room - current room
   * @param {any} marbleId - marble that is being updated (single marble)
   * @param {any} direction - includes movement for x- and y-coordinate (defined in GlobalVars.js)
   */
  updateFieldMap = (room, marbleId, direction) => {
    if (!room) {
      throw new RoomNotFoundException();
    }
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }
    if (isNaN(marbleId)) {
      throw new GameCommandException();
    }

    if (!Directions.hasOwnProperty(direction)) {
      throw new InvalidDirectionException();
    }

    for (let i = 0; i < room.fieldMap.length; i++) {
      if (room.fieldMap[i].id === marbleId) {
        direction = this.directionConverter(direction);
        room.fieldMap[i].xCoordinate += direction[0];
        room.fieldMap[i].yCoordinate += direction[1];
      }
      if (
        room.fieldMap[i].xCoordinate >
          room.gameField[room.fieldMap[i].yCoordinate] ||
        room.fieldMap[i].xCoordinate < 0
      ) {
        room = this.marbleRemoved(marbleId);
      } else if (
        room.fieldMap[i].yCoordinate > 9 ||
        room.fieldMap[i].yCoordinate < 0
      ) {
        room = this.marbleRemoved(marbleId);
      }
    }
    return room;
  };

  compareField = (room, fieldMap) => {
    if (!room) {
      throw new RoomNotFoundException();
    }
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }
    if (!fieldMap) {
      throw new GameCommandException();
    }
    if (room.fieldMap == fieldMap) {
      return true;
    } else {
      return false;
    }
  };

  directionConverter = (direction) => {
    if (direction == "RIGHTUP") {
      return Directions.RIGHTUP;
    } else if (direction == "RIGHTDOWN") {
      return Directions.RIGHTDOWN;
    } else if (direction == "LEFTUP") {
      return Directions.LEFTUP;
    } else if (direction == "LEFTDOWN") {
      return Directions.LEFTDOWN;
    } else {
      return Directions.NOTSET;
    }
  };
}
export default GameControls;
