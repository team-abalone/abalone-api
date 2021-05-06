const InCommandCodes = {
    "MakeMove": "10",
    "CreateRoom": "20",
    "JoinRoom": "30",
    "CloseRoom": "40",
    "LeaveRoom": "50",
    "SendChatMessage": "60"
};

const OutCommandCodes = {
  "GameStarted": "10",
  "RoomJoinedSuccessfully": "20"
};

/** 
 *  Würde ich in 'props' mitschicken bei Raumerstellung
 *  
const GameParameters = {
 
  MinPlayers: 2,
  MaxPlayers: 6,
  DefaultRadius: 5,
};
*/
const InitialFieldTypes = {
  "Default": "10",
  "GermanDaisy": "20"
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
    "Default": [
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
    "GermanDaisy": [
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

export {
  InCommandCodes,
  OutCommandCodes,
  //GameParameters,
  InitialFieldTypes,
  FieldConfigs,
};

