import { RoomControls, GameControls } from "../src/Controls/index.js";
import { v1 as uuidv1 } from "uuid";
import { expect } from "chai";
import randomstring from "randomstring";
import { Directions } from "../src/GlobalVars.js";
import {
  AlreadyInRoomException,
  InvalidCommandException,
  RoomNotFoundException,
  RoomFullException,
  NotRoomHostException,
  NotInRoomException,
  GameNotStartedException,
  FieldException,
  InvalidDirectionException,
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
  it("when there are no marbles given, it should lead to an InvalidCommandException", function () {
    let direction = Directions.RIGHTUP;
    room = gameControls.closeGame(room);
    expect(() => gameControls.makeMove(room, null, direction)).to.throw(
      InvalidCommandException
    );
  });
  it("selecting more than 5 marbles or less than 1 will lead to a InvalidCommandException", function () {
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
      InvalidCommandException
    );
    let nullId = [];
    expect(() => gameControls.makeMove(room, nullId, direction)).to.throw(
      InvalidCommandException
    );
  });
  it("no direction leads to another InvalidCommandException", function () {
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
      InvalidCommandException
    );
  });
});
