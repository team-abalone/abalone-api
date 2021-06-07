import {
  GameNotStartedException,
  FieldException,
  RoomNotFoundException,
  InvalidDirectionException,
  GameCommandException,
} from "../Exceptions.js";
import { FieldConfigs, Directions } from "../GlobalVars.js";

class GameControls {
    constructor() { }
    
  
    /**
   * Removes gameField from our room. Other gamerequests will not work after not having a gameField assigned to the room.
   * @param {any} room
   */
closeGame = (room) => {
    if (!(room)) {
        throw new RoomNotFoundException();
    }
    if (!room.gameField) {
          throw new GameNotStartedException();
      }
    delete room.gameField;

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
    if (marbles.length > 3 || marbles.length < 1) {
      throw new GameCommandException();
    }
    if (!room) {
      throw new RoomNotFoundException();
    }
    //Command checks
    if (!Directions.hasOwnProperty(direction)) {
      throw new InvalidDirectionException();
    }

    if (!direction) {
      throw new GameCommandException();
      }
  };
   
  compareField = (room,gameField) => {
    if (!room) {
      throw new RoomNotFoundException();
      }
      if (!room.gameField) {
      throw new GameNotStartedException();
      }
      if (!gameField) {
      throw new GameCommandException();
      }
      if (room.gameField == gameField) {
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
