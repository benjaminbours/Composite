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
  selectedLevel: Levels;
}

export enum SocketEventType {
  // send automatically by socket io after successful connection with server
  CONNECT = "connect",
  // send only by the client after connect
  MATCHMAKING_INFO = "MATCHMAKING_INFO",
}

export type MatchMakingEvent = [
  type: SocketEventType.MATCHMAKING_INFO,
  payload: MatchMakingInfo,
];

export type SocketEvent = MatchMakingEvent;
