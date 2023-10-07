import type { Group, Mesh, Object3D, Vec2 } from 'three';
import { GameState, Levels } from './GameState';

export enum Side {
    SHADOW,
    LIGHT,
}

export enum SocketEventType {
    // send automatically by socket io after successful connection with server
    CONNECT = 'connect',
    // send by client after receiving connect event
    TIME_SYNC = 'TIME_SYNC',
    // receive automatically by the server after successful connection with a client
    CONNECTION = 'connection',
    // receive automatically by the server when losing connection with a client
    DISCONNECT = 'disconnect',
    // send only by the client after connect
    MATCHMAKING_INFO = 'MATCHMAKING_INFO',
    // send by the server when 2 players connects and a game start
    GAME_START = 'GAME_START',
    // send by the 2 clients to the server and to each others during the game is on going
    GAME_PLAYER_INPUT = 'GAME_INPUT',
    GAME_ACTIVATE_ELEMENT = 'GAME_ACTIVATE_ELEMENT',
    GAME_DEACTIVATE_ELEMENT = 'GAME_DEACTIVATE_ELEMENT',
    // send by the server at a defined frequency to update the clients
    GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',
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
    // TODO: Implement protection against position hacking
    sequence: number;
    time: number;
}

export interface GameStateUpdatePayload {
    gameState: GameState;
}

export interface GameActivateElementPayload {
    elementName: string;
}

export interface TimeSyncPayload {
    id: number;
    clientLocalTime: number;
    serverGameTime?: number;
}

// events

export type PingEvent = [
    type: SocketEventType.TIME_SYNC,
    payload: TimeSyncPayload,
];

export type MatchMakingEvent = [
    type: SocketEventType.MATCHMAKING_INFO,
    payload: MatchMakingPayload,
];

export type GameStartEvent = [
    type: SocketEventType.GAME_START,
    payload: GameStateUpdatePayload,
];

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
    | GameDeactivateElementEvent
    | PingEvent;

export type SocketInGameEvent =
    | GamePlayerInputEvent
    | GameActivateElementEvent
    | GameDeactivateElementEvent;

export class QueueInfo {
    constructor(public all = 0, public light = 0, public shadow = 0) {}
}

export class AllQueueInfo extends QueueInfo {
    constructor(
        public levels: QueueInfo[],
        public all = 0,
        public light = 0,
        public shadow = 0,
    ) {
        super(all, light, shadow);
    }
}

export enum MovableComponentState {
    onFloor,
    inside,
    inAir,
    projected,
    ascend,
}

export interface MovableComponent {
    position: Vec2;
    velocity: Vec2;
}

export type CollidingElem = Mesh | Group | Object3D;
