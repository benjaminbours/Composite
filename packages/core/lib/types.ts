import type { BoxGeometry, Group, Mesh, Object3D, Vector2 } from "three";

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
  GAME_PLAYER_INPUT = "GAME_INPUT",
  GAME_ACTIVATE_ELEMENT = "GAME_ACTIVATE_ELEMENT",
  GAME_DEACTIVATE_ELEMENT = "GAME_DEACTIVATE_ELEMENT",
  // send by the server at a defined frequency to update the clients
  GAME_STATE_UPDATE = "GAME_STATE_UPDATE",
}

export interface Inputs {
  left: boolean;
  right: boolean;
  jump: boolean;
}

// payloads
export interface MatchMakingPayload {
  side: Side;
  selectedLevel: Levels;
}

export interface GamePlayerInputPayload {
  player: Side;
  inputs: Inputs;
  delta: number;
  time: number;
}

export interface GameStateUpdatePayload {
  gameState: GameState;
  time: number;
}

export interface GameActivateElementPayload {
  elementName: string;
}

// events

export type MatchMakingEvent = [
  type: SocketEventType.MATCHMAKING_INFO,
  payload: MatchMakingPayload,
];

export type GameStartEvent = [type: SocketEventType.GAME_START];

export type GameStateUpdateEvent = [
  type: SocketEventType.GAME_STATE_UPDATE,
  payload: GameStateUpdatePayload,
];

export type GamePlayerInputEvent = [
  type: SocketEventType.GAME_PLAYER_INPUT,
  payload: GamePlayerInputPayload,
];

export type GameActivateElementEvent = [
  type: SocketEventType.GAME_ACTIVATE_ELEMENT,
  payload: GameActivateElementPayload,
];

export type GameDeactivateElementEvent = [
  type: SocketEventType.GAME_DEACTIVATE_ELEMENT,
  payload: GameActivateElementPayload,
];

export type SocketEvent =
  | MatchMakingEvent
  | GameStartEvent
  | GameStateUpdateEvent
  | GamePlayerInputEvent
  | GameActivateElementEvent
  | GameDeactivateElementEvent;

export type SocketInGameEvent =
  | GamePlayerInputEvent
  | GameActivateElementEvent
  | GameDeactivateElementEvent;

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

export type Geometries = "border" | "platform" | "wall" | "mountain";

export type GeometriesRegistry = {
  [key: string]: unknown | BoxGeometry;
  // [key in Geometries]?: unknown | BoxGeometry;
};
export interface AssetInfo {
  type: "jsonObj" | "texture";
  url: string;
  name: Geometries;
  /**
   * Raw object loaded
   */
  raw?: unknown;
}

export enum MovableComponentState {
  onFloor,
  inside,
  inAir,
  projected,
  ascend,
}

export interface MovableComponent {
  position: Vector2;
  velocity: Vector2;
  // state: MovableComponentState;
}

export type CollidingElem = Mesh | Group | Object3D;

export class GameState {
  constructor(
    public level: Levels,
    // public light_state: MovableComponentState,
    public light_x: number,
    public light_y: number,
    public light_velocity_x: number,
    public light_velocity_y: number,
    // public shadow_state: MovableComponentState,
    public shadow_x: number,
    public shadow_y: number,
    public shadow_velocity_x: number,
    public shadow_velocity_y: number
  ) {}
}
