import {
  InvalidCommandException,
  GameNotStartedException,
  FieldException,
} from "../Exceptions.js";
import { FieldConfigs, Directions } from "../GlobalVars.js";
import { v1 as uuidv1 } from "uuid";

class GameControls {
  fieldMap = [];

  constructor() {}

  /**
   * Assigns our fieldMap - we store which marble belongs to which player and which id is assigned to it
   * @param {any} field - an instance of FieldConfigs in GlobalVars.js
   */
  addField = (field) => {
    if (!(field instanceof FieldConfigs)) {
      throw new FieldException();
    }
    //Here we assign unique IDs to each marble that is currently on the board and keep the information on which marble belongs to which player
    //Iterators i and j will be stored as position x and position y
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        if (field[i][j] === 1) {
          fieldMap.push([1, uuidv1, i, j]);
        } else if (field[i][j] === 2) {
          fieldMap.push([2, uuidv1, i, j]);
        } else {
          this.fieldMap.push([0, null, i, j]);
        }
      }
    }
  };

  //Whithout a field, other responses in this category will always fail.
  //By closing a game, we must ensure the field is removed
  closeGame = () => {
    this.fieldMap = null;
  };
  /**
   * This function will basically broadcast a players move to every other player.
   * All checks regarding the possibility of making that move are already done in frontend.
   * Request should look like this: {userId: 'id', commandCode: 70, marbles: [id1,id2,id3], direction: 'LEFTUP'}
   * @param {any} marbles - Array of marbles that are to be moved
   * @param {any} direction - Direction the marbles will move to (enum in frontend)
   */
  makeMove = (marbles, direction) => {
    if (!fieldMap) {
      throw new GameNotStartedException();
    }
    //Command checks
    if (!Directions.includes(direction)) {
      throw new InvalidCommandException();
    }
    if (!marbles) {
      throw new InvalidCommandException();
    }
    if (marbles.length > 5) {
      throw new InvalidCommandException();
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
    //TODO: Maybe add 'nextPlayer' to response
    return marblesWithDirection;
    /*Eventually broadcasts a response like this to all Sockets:
       {"commandCode":10,"toMove":{"ids":[1,2,3],"direction":"LEFTUP"}}
        */
  };

  /**
   * Keeping track on all active marbles currently on our board, we have to remove every entry in fieldMap which gets pushed out of the field
   * @param {any} marbleId -int of marble that is being pushed out
   */
  marbleRemoved = (marbleId) => {
    if (isNaN(marbleId)) {
      throw new InvalidCommandException();
    }
    tempMap = fieldMap.filter((X) => x[1] === marbleId);
    this.fieldMap = tempMap;
  };
  /**
   * Keep track of all moves made. Will be called automatically by the makeMove()-method
   * Can call marbleRemoved-method() if neccessary
   * @param {any} marbleId - currently pushed marble
   * @param {any} xCoordinate - from direction in GlobalVars
   * @param {any} yCoordinate - from direction in GlobalVars
   */
  updateFieldMap = (marbleId, xCoordinate, yCoordinate) => {
    for (let marble in fieldMap) {
      if (marble[1] === marbleId) {
        marble[2] += xCoordinate;
        marble[3] += yCoordinate;
      }
    }
  };
}
export default GameControls;
