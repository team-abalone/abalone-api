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
const roomControls = new RoomControls();
const gameControls = new GameControls();
describe("#addFieldMap(room)", function () {
  let userId;

  beforeEach(function () {
    userId = uuidv1;
  });
  it("fieldMap should exist as property of room after addFieldMap()", function () {
    //we first need a room
    let roomKey = roomControls.createRoom(userId, 3);
    let room = roomControls.findRoomByRoomKey(roomKey);

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
  let room;
  let userId;

  beforeEach(function () {
    userId = uuidv1;
    let roomKey = roomControls.createRoom(userId, 3);
    room = roomControls.startGame(userId, roomKey);
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
  let userId;
  let room;
  beforeEach(function () {
    userId = uuidv1;

    let roomKey = roomControls.createRoom(userId, 2);

    room = roomControls.startGame(userId, roomKey);
    room = gameControls.addFieldMap(room);
  });
  it("makemove should return an object containing marbleIds and the Direction after successfully executing", function () {
    let marbleIds = [
      room.fieldMap[0].id,
      room.fieldMap[1].id,
      room.fieldMap[2].id,
    ];
    let direction = "RIGHTUP";

    let response = gameControls.makeMove(room, marbleIds, direction);
    let expected = {
      ids: [room.fieldMap[0].id, room.fieldMap[1].id, room.fieldMap[2].id],
      direction: direction,
    };
    expect(response.ids).to.equal(expected.ids);
    expect(response.direction).to.equal(expected.direction);
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
    expect(() => gameControls.makeMove(room, [], direction)).to.throw(
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
  let userId;
  let room;
  let marbleId;
  beforeEach(function () {
    userId = uuidv1;
    let roomKey = roomControls.createRoom(userId, 3);

    room = roomControls.startGame(userId, roomKey);
    room = gameControls.addFieldMap(room);
    marbleId = room.fieldMap[2].id; //example id
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
    expect(removedMarble).to.equal(undefined);
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
    gameControls.closeGame(room);
    expect(() => gameControls.marbleRemoved(room, marbleId)).to.throw(
      GameNotStartedException
    );
  });
});
describe("#updateFieldMap(room, marbleId, direction)", function () {
  let room;
  let userId;
  let marbleId;
  let direction;
  beforeEach(function () {
    userId = uuidv1;
    let roomKey = roomControls.createRoom(userId, 3);
    room = roomControls.startGame(userId, roomKey);
    room = gameControls.addFieldMap(room);
    marbleId = room.fieldMap[2].id;
    direction = "RIGHTUP";
  });
  it("updateFieldMap should update moving marbles to keep track of current board", function () {
    //Example test with RIGHTUP direction -> adds 1/1 to x/y coordinate
    let currentMarble;

    for (let i = 0; i < room.fieldMap.length; i++) {
      if (room.fieldMap[i].id === marbleId) {
        currentMarble = room.fieldMap[i];
      }
    }
    expect(currentMarble).to.not.equal(undefined);

    room = gameControls.updateFieldMap(room, marbleId, direction);
    let updatedMarble;
    for (let i = 0; i < room.fieldMap.length; i++) {
      if (room.fieldMap[i].id === marbleId) {
        updatedMarble = room.fieldMap[i];
      }
    }

    expect(currentMarble.xCoordinate).to.not.equal(updatedMarble.xCoordinate);
    expect(currentMarble.yCoordinate).to.not.equal(updatedMarble.yCoordinate);
  });
  it("updateFieldMap should remove marbles that go beyond our borders", function () {
    //Example test with LEFTDOWN direction -> subtracts 1/1 from x/y coordinate
    //Test with marbleId= 0 -> first marble in first line - if this moves leftdown, it should be beyond our border an thus get deleted
    direction = "LEFTDOWN";
    marbleId = 0;
    let currentMarble;
    for (let i = 0; i < room.fieldMap.length; i++) {
      if (room.fieldMap[i].id === marbleId) {
        currentMarble = room.fieldMap[i];
      }
    }

    room = gameControls.updateFieldMap(room, marbleId, direction);

    let updatedMarble;
    for (let i = 0; i < room.fieldMap.length; i++) {
      if (room.fieldMap[i].id === marbleId) {
        updatedMarble = room.fieldMap[i];
      }
    }
    expect(currentMarble).to.not.equal(undefined);
    //player= 0 means this hexagon does not belong to either player and thus being empty
    expect(updatedMarble).to.equal(undefined);
  });
  it("no room -> RoomNotFoundException", function () {
    expect(() =>
      gameControls.updateFieldMap(null, marbleId, direction)
    ).to.throw(RoomNotFoundException);
  });
  it("no room.fieldMap -> GameNotStartedException", function () {
    gameControls.closeGame(room);
    expect(() =>
      gameControls.updateFieldMap(room, marbleId, direction)
    ).to.throw(GameNotStartedException);
  });
  it("direction not part of Directions in GlobalVars.js -> InvalidDirectionException", function () {
    direction = "Up";
    expect(() =>
      gameControls.updateFieldMap(room, marbleId, direction)
    ).to.throw(InvalidDirectionException);
  });
  it("marbleId not a number -> GameCommandException", function () {
    marbleId = "not a number";
    expect(() =>
      gameControls.updateFieldMap(room, marbleId, direction)
    ).to.throw(GameCommandException);
  });
});
