import {
  InvalidCommandException,
  GameNotStartedException,
  FieldException,
} from "../Exceptions.js";
import { FieldConfigs, Directions } from "../GlobalVars.js";
import { v1 as uuidv1 } from "uuid";

class GameControls {
  constructor() {}

  /**
   * Assigns our fieldMap - we store which marble belongs to which player and which id is assigned to it
   * @param {any} room - Gamefield and Fieldmap should be stored in corresponding Room
   */
  addFieldMap = (room) => {
    if (!room.gameField) {
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

    //Here we assign unique IDs to each marble that is currently on the board and keep the information on which marble belongs to which player
    //Iterators i and j will be stored as position x and position y
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        let tempMarble = {
          player: field[i][j],
          id: uuidv1,
          xCoordinate: i,
          yCoordinate: j,
        };
        if (tempMarble.player === 0) {
          tempMarble.id = null;
        }
        fieldMap.push(tempMarble);
      }
    }
    room.fieldMap = fieldMap; //FieldMap stored in Room with every Hexagon's data
  };

  //Whithout a field, other responses in this category will always fail.
  //By closing a game, we must ensure the field is removed
  closeGame = () => {
    if (!room.fieldMap) {
      throw new FieldException();
    }
    room.fieldMap = null;
  };
  /**
   * This function will basically broadcast a players move to every other player.
   * All checks regarding the possibility of making that move are already done in frontend.
   * Request should look like this: {userId: 'id', commandCode: 70, marbles: [id1,id2,id3], direction: 'LEFTUP'}
   * @param {any} marbles - Array of marbles that are to be moved
   * @param {any} direction - Direction the marbles will move to (enum in frontend)
   */
  makeMove = (room, marbles, direction) => {
    if (!room.fieldMap) {
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

    //Updating fieldMap of room
    for (let id in marblesWithDirection.ids) {
      updateFieldMap(room, id, marblesWithDirection.direction);
    }
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
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }
    room.fieldMap = room.fieldMap.filter((X) => x.id === marbleId);
  };
  /**
   * Keep track of all moves made. Will be called automatically by the makeMove()-method
   * Can call marbleRemoved-method() if neccessary
   * @param {any} marbleId - currently pushed marble
   * @param {any} xCoordinate - from direction in GlobalVars
   * @param {any} yCoordinate - from direction in GlobalVars
   */
  updateFieldMap = (room, marbleId, direction) => {
    if (!room.fieldMap) {
      throw new GameNotStartedException();
    }

    if (!Directions.hasOwnProperty(direction)) {
      throw new InvalidCommandException(); //TODO: Maybe deal with an explicit InvalidDirectionException later
    }
    for (let marble in room.fieldMap) {
      if (marble.id === marbleId) {
        marble.xCoordinate += Directions.direction[0];
        marble.yCoordinate += Directions.direction[1];
        //If a marble goes beyond the border, it should get removed
        if (
          marble.xCoordinate > room.gameField[marble.yCoordinate] ||
          marble.xCoordinate < 0
        ) {
          marbleRemoved(marble.id);
        } else if (marble.yCoordinate > 9 || marble.yCoordinate < 0) {
          this.marbleRemoved(marble.id);
        }
      }
    }
  };
}
export default GameControls;