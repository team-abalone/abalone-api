const InCommandCodes = {
  "MakeMove": "10",
  "CreateRoom": "20",
  "JoinRoom": "30",
  "CloseRoom": "40",
  "SendChatMessage": "50",
};

function InvalidCommandException(message) {
    this.message = message;
    this.name = "InvalidCommandException";
}

function InvalidActionException(message) {
    this.message = message;
    this.name = "InvalidActionException";
}

export { InCommandCodes, InvalidCommandException, InvalidActionException };
