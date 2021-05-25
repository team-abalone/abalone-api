const InCommandCodes = {
  MakeMove: 10,
  CreateRoom: 20,
  JoinRoom: 30,
  CloseRoom: 40,
  SendChatMessage: 50,
  GetUserId: 60,
  StartGame: 70,
};

const OutCommandCodes = {
  IdInitialized: 10,
  GameStarted: 20,
  RoomJoined: 30,
  RoomCreated: 40,
  RoomClosed: 50,
  RoomJoinedOther: 60,
  MadeMove: 70,
};

const GameParameters = {
  MinPlayers: 2,
  MaxPlayers: 6,
  DefaultRadius: 5,
};

const InitialFieldTypes = {
  Default: 10,
  GermanDaisy: 20,
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
  },
};
const Directions = {
  RIGHTUP: [1, 1],
  LEFTUP: [-1, 1],
  LEFTDOWN: [-1, -1],
  RIGHTDOWN: [1, -1],
  NOTSET: [0, 0],
};

export {
  InCommandCodes,
  OutCommandCodes,
  GameParameters,
  InitialFieldTypes,
  FieldConfigs,
  Directions,
};
