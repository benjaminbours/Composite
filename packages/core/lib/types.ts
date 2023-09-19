export enum Side {
  SHADOW,
  LIGHT,
}

export enum Levels {
  CRACK_THE_DOOR,
  LEARN_TO_FLY,
  THE_HIGH_SPHERES,
}

export interface MatchMakingInfo {
  side: Side;
  currentLevel: Levels;
}

export enum SocketEventType {
  // send automatically by socket io after successful connection with server
  CONNECT = "connect",
  // receive automatically by the server after successful connection with a client
  CONNECTION = "connection",
  // receive automatically by the server when losing connection with a client
  DISCONNECT = "disconnect",
  // send only by the client after connect
  MATCHMAKING_INFO = "MATCHMAKING_INFO",
  // send by the server when 2 players connects and a game start
  GAME_START = "GAME_START",
}

export type MatchMakingEvent = [
  type: SocketEventType.MATCHMAKING_INFO,
  payload: MatchMakingInfo,
];

export type SocketEvent = MatchMakingEvent;
