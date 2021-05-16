import { expect } from "chai";
import { RoomControls } from "../src/Controls/index.js";
import { v1 as uuidv1 } from "uuid";
import {
  AlreadyInRoomException,
  InvalidCommandException,
  RoomNotFoundException,
  RoomFullException,
  NotRoomHostException,
} from "../src/Exceptions.js";

// tests for createRoom.
describe("#createRoom(userId, numberOfPlayers)", function () {
  let roomControls;
  let userId;

  beforeEach(function () {
    roomControls = new RoomControls();
    userId = uuidv1();
  });

  it("room should exist after creation", function () {
    let roomKey = roomControls.createRoom(userId, 2);
    let room = roomControls.findRoomByPlayer(userId);

    // RoomKey cannot be null.
    expect(roomKey).to.not.equal(null);
    // RoomKey needs to have 5 characters.
    expect(roomKey).to.have.lengthOf(5);

    // Room needs to have certain props.
    expect(room).to.have.own.property("roomKey");
    expect(room).to.have.own.property("createdBy");
    expect(room).to.have.own.property("players");
    expect(room).to.have.own.property("numberOfPlayers");
  });

  it("should throw AlreadyInRoomException if user is already in room", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // Should throw AlreadyInRoomException, message should include roomKey of previously created room.
    expect(() => roomControls.createRoom(userId, 2)).to.throw(
      AlreadyInRoomException,
      roomKey
    );
  });

  it("should throw InvalidCommandException if numberOfUsers is NaN", function () {
    // Should throw AlreadyInRoomException, message should include roomKey of previously created room.
    expect(() => roomControls.createRoom(userId, "two")).to.throw(
      InvalidCommandException
    );
  });
});

// tests for joinRoom.
describe("#joinRoom(userId, roomKey)", function () {
  let roomControls;
  let userId;
  let userId1;
  let userId2;

  beforeEach(function () {
    roomControls = new RoomControls();
    userId = uuidv1();
    userId1 = uuidv1();
    userId2 = uuidv1();
  });

  it("should throw RoomNotFoundException if room with roomKey not found.", function () {
    // No room exists yet.
    expect(() => roomControls.joinRoom(userId, "5rt3e")).to.throw(
      RoomNotFoundException
    );
  });

  it("should throw RoomFullException if room already full.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // First join should work.
    expect(() => roomControls.joinRoom(userId1, roomKey)).to.not.throw(Error);

    // Third player trying to join should get RoomFullException.
    expect(() => roomControls.joinRoom(userId2, roomKey)).to.throw(
      RoomFullException
    );
  });

  it("should throw AlreadyInRoomException user already in room.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // First join should work.
    expect(() => roomControls.joinRoom(userId1, roomKey)).to.not.throw(Error);

    // Same player joining again should get AlreadyInRoomException.
    expect(() => roomControls.joinRoom(userId1, roomKey)).to.throw(Error);
  });

  it("user should be in room after joining.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // First join should work.
    let room = roomControls.joinRoom(userId1, roomKey);

    // Players should now contain creator and joined player.
    expect(room.players).to.have.members([userId, userId1]);
  });
});

// tests for startGame.
describe("#startGame(userId, roomKey)", function () {
  let roomControls;
  let userId;
  let userId1;
  let userId2;

  beforeEach(function () {
    roomControls = new RoomControls();
    userId = uuidv1();
    userId1 = uuidv1();
    userId2 = uuidv1();
  });

  it("should throw RoomNotFoundException if room with roomKey not found.", function () {
    // No room exists yet.
    expect(() => roomControls.startGame(userId, "5rt3e")).to.throw(
      RoomNotFoundException
    );
  });

  it("should throw NotRoomHostException if player tries to start other players game.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // Third player trying to join should get RoomFullException.
    expect(() => roomControls.startGame(userId1, roomKey)).to.throw(
      NotRoomHostException
    );
  });

  it("starting game should not throw error with valid parameters.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // Other player joins.
    expect(() => roomControls.joinRoom(userId1, roomKey)).to.not.throw(Error);

    // Starting game should work.
    expect(() => roomControls.startGame(userId, roomKey)).to.not.throw(Error);
  });

  it("Starting game should return room with valid parameters.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // Other player joins.
    expect(() => roomControls.joinRoom(userId1, roomKey)).to.not.throw(Error);

    // Starting game should return room.
    expect(roomControls.startGame(userId, roomKey)).to.have.all.keys(
      "roomKey",
      "createdBy",
      "players",
      "numberOfPlayers",
      "gameField"
    );
  });

  it("Starting game room should include gameField as array with valid parameters.", function () {
    let roomKey = roomControls.createRoom(userId, 2);

    // Other player joins.
    expect(() => roomControls.joinRoom(userId1, roomKey)).to.not.throw(Error);

    let room = roomControls.startGame(userId, roomKey);

    // GameField should be array.
    expect(room.gameField).to.be.an("array");

    // GameField[0] should also be array.
    expect(room.gameField[0]).to.be.an("array");
  });
});
