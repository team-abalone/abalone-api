import { InvalidCommandException,GameNotStartedException, FieldException } from "../Exceptions.js";
import { FieldConfigs } from "../GlobalVars.js";
import { v1 as uuidv1 } from "uuid";

class GameControls {
  field;
  directions = ["RIGHTUP", "LEFTUP", "LEFTDOWN", "RIGHTDOWN", "NOTSET"];

    constructor() {
    
    }
    //Adding our field. Other methods will always throw an error if there is no active field.
    addField = (field) => {
        if (!(field instanceof FieldConfigs)) {
            throw new FieldException();
        }
        //Here we assign unique IDs to each marble that is currently on the board
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[i].length; j++) {
                if (field[i][j] === 1 || field[i][j] === 2) {
                    field[i][j] = uuidv1;
                }
            }
        }
    }

    //Whithout a field, other responses in this category will always fail.
    closeGame = () => {
        this.field = null;
    }
  /**
   * This function will basically broadcast a players move to every other player.
   * All checks regarding the possibility of making that move are already done in frontend.
   * Request should look like this: {userId: 'id', commandCode: 70, marbles: [id1,id2,id3], direction: 'LEFTUP'}
   * @param {any} marbles - Array of marbles that are to be moved
   * @param {any} direction - Direction the marbles will move to (enum in frontend)
   */
    makeMove = (marbles, direction) => {
        if (!field) {
            throw new GameNotStartedException();
        }
    //Command checks
    if (!this.directions.includes(direction)) {
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
}
export default GameControls;
