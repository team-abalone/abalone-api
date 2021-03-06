const InCommandCodes = {
  MakeMove: 10,
  CreateRoom: 20,
  JoinRoom: 30,
  CloseRoom: 40,
  SendChatMessage: 50,
  GetUserId: 60,
  StartGame: 70,
  CloseGame: 80,
  Surrender: 90,
  LeaveRoom: 100,
};

const OutCommandCodes = {
  IdInitialized: 10,
  GameStarted: 20,
  RoomJoined: 30,
  RoomCreated: 40,
  RoomClosed: 50,
  RoomJoinedOther: 60,
  MadeMove: 70,
  CloseGame: 80,
  Surrender: 90,
  RoomLeft: 100,
  RoomLeftOtherPlayer: 101,
  NoRoomToLeave: 102,
};

const ExceptionCodes = {
  ServerException: 100,
  GameException: 200,
  ChatException: 300,
  RoomException: 400,
};

const GameParameters = {
  MinPlayers: 2,
  MaxPlayers: 6,
  DefaultRadius: 5,
};

const InitialFieldTypes = {
  GermanDaisy: 10,
  Default: 20,
  TheWall: 30,
  Snakes: 40,
};

/**
 * For now we only implement two player matches and
 * two possible starting fields (the default and german daisy).
 * 0 ... empty
 * 1 ... Player 1
 * 2 ... Player 2
 */
const FieldConfigs = {
  TwoPlayers: {
    Default: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 0, 0],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2],
    ],
    GermanDaisy: [
      [0, 0, 0, 0, 0],
      [1, 1, 0, 0, 2, 2],
      [1, 1, 1, 0, 2, 2, 2],
      [0, 1, 1, 0, 0, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 0, 0, 1, 1, 0],
      [2, 2, 2, 0, 1, 1, 1],
      [2, 2, 0, 0, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    Snakes: [
      [2, 2, 2, 2, 2],
      [2, 0, 0, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 0],
      [2, 0, 0, 2, 2, 1, 1, 0],
      [0, 2, 0, 2, 0, 1, 0, 1, 0],
      [0, 2, 2, 1, 1, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
    TheWall: [
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [0, 2, 2, 2, 2, 2, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
    ],
  },
};

const Directions = {
  RIGHTUP: [1, 1],
  LEFTUP: [-1, 1],
  LEFTDOWN: [-1, -1],
  RIGHTDOWN: [1, -1],
  RIGHT: [1, 0],
  LEFT: [-1, 0],
  NOTSET: [0, 0],
};

export {
  InCommandCodes,
  OutCommandCodes,
  GameParameters,
  InitialFieldTypes,
  FieldConfigs,
  Directions,
  ExceptionCodes,
};
