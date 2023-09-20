export enum Side {
  SHADOW,
  LIGHT,
}

export enum Levels {
  CRACK_THE_DOOR,
  LEARN_TO_FLY,
  THE_HIGH_SPHERES,
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
  // send by the 2 clients to the server and to each others during the game is on going
  GAME_POSITION = "GAME_POSITION",
}

export interface MatchMakingPayload {
  side: Side;
  selectedLevel: Levels;
}

export type MatchMakingEvent = [
  type: SocketEventType.MATCHMAKING_INFO,
  payload: MatchMakingPayload,
];

export interface GamePositionPayload {
  x: number;
  y: number;
}

export type GamePositionEvent = [
  type: SocketEventType.GAME_POSITION,
  payload: GamePositionPayload,
];

export type SocketEvent = MatchMakingEvent | GamePositionEvent;

export class QueueInfo {
  constructor(
    public all = 0,
    public light = 0,
    public shadow = 0
  ) {}
}

export class AllQueueInfo extends QueueInfo {
  constructor(
    public levels: QueueInfo[],
    public all = 0,
    public light = 0,
    public shadow = 0
  ) {
    super(all, light, shadow);
  }
}
