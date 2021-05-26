import { RoomControls, GameControls } from "../src/Controls/index.js";
import { v1 as uuidv1 } from "uuid";
import { expect } from "chai";
import randomstring from "randomstring";
import { Directions } from "../src/GlobalVars.js";
import {
  AlreadyInRoomException,
  RoomNotFoundException,
  RoomFullException,
  NotRoomHostException,
  NotInRoomException,
  GameNotStartedException,
  FieldException,
  InvalidDirectionException,
  GameCommandException,
} from "../src/Exceptions.js";

describe("#addFieldMap(room)", function () {
  const roomControls = new RoomControls();
  const gameControls = new GameControls();
  let userId;

  beforeEach(function () {
    userId = uuidv1;
  });
  it("fieldMap should exist as property of room after addFiledMap()", function () {
    //we first need a room
    let room = {
      roomKey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
      numberOfPlayers: 3,
    };
    room = roomControls.startGame(userId, room.roomKey);
    expect(room).to.have.own.property("gameField");
    //As everything is set up, we can now call the addFieldMap-method

    room = gameControls.addFieldMap(room);
    //Check if the room now has the fieldMap-property
    expect(room).to.have.own.property("fieldMap");
  });
  it("if no room is given as param, RoomNotFoundException should be thrown", function () {
    expect(() => gameControls.addFieldMap(null)).to.throw(
      RoomNotFoundException
    );
  });
  it("if the room does not have the property 'gameField' then GameNotStartedException should be thrown", function () {
    let room = {
      roomKey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
      numberOfPlayers: 3,
    };
    expect(() => gameControls.addFieldMap(room)).to.throw(
      GameNotStartedException
    );
  });
});
describe("#closeGame(room)", function () {
  beforeEach(function () {
    userId = uuidv1;
    let room = {
      roomKey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
      numberOfPlayers: 3,
    };
    room = roomControls.startGame(userId, room.roomKey);
  });

  it("room.gameField should not exist after calling gameControls.closeGame(room)", function () {
    expect(room).to.have.own.property("gameField");
    room = gameControls.addFieldMap(room);
    expect(room).to.have.own.property("fieldMap");
    //Setup is done, now we can try to close the game
    room = gameControls.closeGame(room);
    expect(room).to.not.have.own.property("fieldMap");
  });

  it("if the room does not have the property fieldMap, GameNotStartedException is thrown", function () {
    expect(room).to.have.own.property("gameField");

    expect(() => gameControls.closeGame(room)).to.throw(
      GameNotStartedException
    );
  });
});
describe("#makeMove(room,marbles,direction)", function () {
  beforeEach(function () {
    userId = uuidv1;

    let room = {
      roomKey: randomstring.generate(5),
      createdBy: userId,
      players: [userId],
      numberOfPlayers: 3,
    };
    room = roomControls.startGame(userId, room.roomKey);
    room = gameControls.addFieldMap(room);
  });
  it("makemove should return an object containing marbleIds and the Direction after successfully executing", function () {
    let marbleIds = [
      room.fieldMap[0].id,
      room.fieldMap[1].id,
      room.fieldMap[2].id,
    ];
    let direction = Directions.RIGHTUP;

    let response = gameControls.makeMove(room, marbleIds, direction);
    let expected = {
      ids: [room.gameField[0].id, room.gameField[1].id, room.gameField[2].id],
      direction: direction,
    };

    expect(response).to.equal(expected);
  });
  it("no room given should lead to a RoomNotFoundException", function () {
    let marbleIds = [
      room.fieldMap[0].id,
      room.fieldMap[1].id,
      room.fieldMap[2].id,
    ];
    let direction = Directions.RIGHTUP;

    expect(() => gameControls.makeMove(null, marbleIds, direction)).to.throw(
      RoomNotFoundException
    );
  });
  it("room without fieldMap should lead to GameNotStartedException", function () {
    let marbleIds = [
      room.fieldMap[0].id,
      room.fieldMap[1].id,
      room.fieldMap[2].id,
    ];
    let direction = Directions.RIGHTUP;
    room = gameControls.closeGame(room);
    expect(() => gameControls.makeMove(room, marbleIds, direction)).to.throw(
      GameNotStartedException
    );
  });
  it("directions not included in GlobalVars.js should lead to InvalidDirectionException", function () {
    let marbleIds = [
      room.gameField[0].id,
      room.gameField[1].id,
      room.gameField[2].id,
    ];
    let direction = "down";
    expect(() => gameControls.makeMove(room, marbleIds, direction)).to.throw(
      InvalidDirectionException
    );
  });
  it("when there are no marbles given, it should lead to a GameCommandException", function () {
    let direction = Directions.RIGHTUP;
    room = gameControls.closeGame(room);
      expect(() => gameControls.makeMove(room, null, direction)).to.throw(
          GameCommandException
    );
  });
  it("selecting more than 5 marbles or less than 1 will lead to a GameCommandException", function () {
    let marbleIds = [
      room.fieldMap[0].id,
      room.fieldMap[1].id,
      room.fieldMap[2].id,
      room.fieldMap[3].id,
      room.fieldMap[4].id,
      room.fieldMap[5].id,
    ];
    let direction = Directions.RIGHTUP;
    room = gameControls.closeGame(room);
      expect(() => gameControls.makeMove(room, marbleIds, direction)).to.throw(
          GameCommandException
    );
    let nullId = [];
      expect(() => gameControls.makeMove(room, nullId, direction)).to.throw(
          GameCommandException
    );
  });
  it("no direction leads to another GameCommandException", function () {
    let marbleIds = [
      room.fieldMap[0].id,
      room.fieldMap[1].id,
      room.fieldMap[2].id,
      room.fieldMap[3].id,
      room.fieldMap[4].id,
      room.fieldMap[5].id,
    ];

    room = gameControls.closeGame(room);
      expect(() => gameControls.makeMove(room, marbleIds, null)).to.throw(
          GameCommandException
    );
  });
});
describe("#marbleRemoved(room,marbleId)", function () {
    beforeEach(function () {
        userId = uuidv1;

        let room = {
            roomKey: randomstring.generate(5),
            createdBy: userId,
            players: [userId],
            numberOfPlayers: 3,
        };
        room = roomControls.startGame(userId, room.roomKey);
        room = gameControls.addFieldMap(room);
        let marbleId = room.fieldMap[2].id; //example id
    });
    it("When marble gets removed, the marble should be filtered", function () {
        let currentMarble;
        let removedMarble;

        for (let marble in room.fieldMap) {
            if (marble.id === marbleId) {
                currentMarble = marble;
            }
        }
        gameControls.marbleRemoved(room, marbleId);
        for (let marble in room.fieldMap) {
            if (marble.id === marbleId) {
                removedMarble = marble;
            }
        }
        expect(currentMarble).to.not.equal(null);
        expect(removedMarble).to.equal(null);

    });
    it("marbleId has to be a number, otherwise GameCommandException should be thrown", function () {
        expect(() => gameControls.marbleRemoved(room, "not a number")).to.throw(
            GameCommandException
        );
    });
    it("if no room is given, a RoomNotFoundException should be thrown", function () {
        expect(() => gameControls.marbleRemoved(null, marbleId)).to.throw(
            RoomNotFoundException
        );
    });
    it("If room does not have the property 'fieldMap' a GameNotStartedException should be thrown", function () {
        room.closeGame(room);
        expect(() => gameControls.marbleRemoved(room, marbleId)).to.throw(
            GameNotStartedException
        );
    });
});
describe("#updateFieldMap(room, marbleId, direction)", function () {
    beforeEach(function () {
        let room = {
            roomKey: randomstring.generate(5),
            createdBy: userId,
            players: [userId],
            numberOfPlayers: 3,
        };
        room = roomControls.startGame(userId, room.roomKey);
        room = gameControls.addFieldMap(room);
        let marbleId = room.fieldMap[2];
        let direction = Directions.RIGHTUP;
    });
    it("updateFieldMap should update moving marbles to keep track of current board", function () {
        //Example test with RIGHTUP direction -> adds 1/1 to x/y coordinate
        let currentMarble;
        for (let marble in room.fieldMap) {
            if (marble.id === marbleId) {
                currentMarble = marble;
            }
        }

        gameControls.updateFieldMap(room, marbleId, direction);
        let updatedMarble;
        for (let marble in room.fieldMap) {
            if (marble.id === marbleId) {
                updatedMarble = marble;
            }
        }

        expect(currentMarble.xCoordinate).to.equal(updatedMarble.xCoordinate + 1);
        expect(currentMarble.yCoordinate).to.equal(updatedMarble.yCoordinate + 1);
    });
    it("updateFieldMap should remove marbles that go beyond our borders", function () {
        //Example test with LEFTDOWN direction -> subtracts 1/1 from x/y coordinate
        //Test with marbleId= 0 -> first marble in first line - if this moves leftdown, it should be beyond our border an thus get deleted
        direction = Directions.LEFTDOWN;
        marbleId = 0;
        let currentMarble;
        for (let marble in room.fieldMap) {
            if (marble.id === marbleId) {
                currentMarble = marble;
            }
        }
       
        gameControls.updateFieldMap(room, marbleId, direction);

        let updatedMarble;
        for (let marble in room.fieldMap) {
            if (marble.id === marbleId) {
                updatedMarble = marble;
            }
        }
        expect(currentMarble).to.not.equal(null);
        //player= 0 means this hexagon does not belong to either player and thus being empty
        expect(updatedMarble).to.equal(null);

    });
    it("no room -> RoomNotFoundException", function () {
        expect(() => gameControls.updateFieldMap(null, marbleId,direction)).to.throw(
            RoomNotFoundException
        );
    });
    it("no room.fieldMap -> GameNotStartedException", function () {
        gameControls.closeGame(room);
        expect(() => gameControls.updateFieldMap(room, marbleId, direction)).to.throw(
            GameNotStartedException
        );
    });
    it("direction not part of Directions in GlobalVars.js -> InvalidDirectionException", function () {
        direction = "Up";
        expect(() => gameControls.updateFieldMap(room, marbleId, direction)).to.throw(
            InvalidDirectionException
        );
    });
    it("marbleId not a number -> GameCommandException", function () {
        marbleId = "not a number";
        expect(() => gameControls.updateFieldMap(room, marbleId, direction)).to.throw(
            GameCommandException
        );
    });

});