import { InvalidCommandException } from "../Exceptions.js";

class GameControls {
  field;
  directions = ["RIGHTUP", "LEFTUP", "LEFTDOWN", "RIGHTDOWN", "NOTSET"];

  constructor(field) {
    // this line will remain if neccassary - but all checks are done in frontend
    this.field = field;
  }
  /**
   * This function will basically broadcast a players move to every other player.
   * All checks regarding the possibility of making that move are already done in frontend.
   * Request should look like this: {userId: 'id', commandCode: 70, marbles: [id1,id2,id3], direction: 'LEFTUP'}
   * @param {any} marbles - Array of marbles that are to be moved
   * @param {any} direction - Direction the marbles will move to (enum in frontend)
   */
  makeMove = (marbles, direction) => {
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
