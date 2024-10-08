import type { Group, Mesh, Object3D, Vector2 } from 'three';
import { GameState } from './GameState';

export enum Side {
    SHADOW,
    LIGHT,
}

export enum Layer {
    DEFAULT,
    BLOOM, // platforms, elements
    OCCLUSION_PLAYER, // only the player
    PLAYER_INSIDE,
    MINI_MAP,
}

export enum GameMode {
    PRACTICE = 'practice',
    RANKED = 'ranked',
}

export enum GamePlayerCount {
    SOLO = 1,
    DUO = 2,
}

export enum GameVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

export enum SocketEventType {
    // send automatically by socket io after successful connection with server
    CONNECT = 'connect',
    // send by client after receiving game start event
    TIME_SYNC = 'TIME_SYNC',
    // send by client after receiving all the time sync events back
    TIME_INFO = 'TIME_INFO',
    START_TIMER = 'START_TIMER',
    // receive automatically by the server after successful connection with a client
    CONNECTION = 'connection',
    // receive automatically by the server when losing connection with a client
    DISCONNECT = 'disconnect',
    // send by the server when 2 players connects and a game start
    GAME_START = 'GAME_START',
    // send by the 2 clients to the server and to each others during the game is on going
    GAME_PLAYER_INPUT = 'GAME_INPUT',
    GAME_ACTIVATE_ELEMENT = 'GAME_ACTIVATE_ELEMENT',
    GAME_DEACTIVATE_ELEMENT = 'GAME_DEACTIVATE_ELEMENT',
    // send by the server at a defined frequency to update the clients
    GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',
    // send by the server when the players reach the end level
    GAME_FINISHED = 'GAME_FINISHED',
    // send by the server to inform a team mate disconnected
    TEAMMATE_DISCONNECT = 'TEAMMATE_DISCONNECT',
}

export enum SocketEventLobby {
    SELECT_LEVEL = 'SELECT_LEVEL',
    SELECT_SIDE = 'SELECT_SIDE',
    /**
     * Create a lobby with a friend a not a random player would be more exact
     */
    // CREATE_LOBBY = 'CREATE_LOBBY',
    // FRIEND_JOIN_LOBBY = 'FRIEND_JOIN_LOBBY',
    // INVITE_FRIEND_TOKEN = 'INVITE_FRIEND_TOKEN',
    READY_TO_PLAY = 'READY_TO_PLAY',
    // JOIN_RANDOM_QUEUE = 'JOIN_RANDOM_QUEUE',
    CREATE_GAME = 'CREATE_GAME',
    JOIN_GAME = 'JOIN_GAME',
}

export interface InputsSync {
    left: boolean;
    right: boolean;
    jump: boolean;
    top: boolean;
    bottom: boolean;
    resetPosition: boolean;
}

export interface InputsClient {
    interact: boolean;
}

// payloads
export interface InviteFriendTokenPayload {
    token: string;
}

export interface JoinRandomQueuePayload {
    userId?: number;
    side?: Side;
    level?: number;
}

export interface CreateGamePayload {
    userId?: number;
    level: number;
    device: 'desktop' | 'mobile';
    region: string;
    roomId: string;
    playerCount: GamePlayerCount;
    side?: Side;
}

export interface JoinGamePayload {
    roomId: string;
}

export interface StartTimerPayload {
    startTime: number;
}

export interface FriendJoinLobbyPayload {
    token?: string;
    user?: any; // User type from database, not accessible here but should be casted to this type on the front
    side?: Side;
    level?: number;
}

export interface CreateLobbyPayload {
    userId?: number;
    side?: Side;
    level?: number;
}

export interface GamePlayerInputPayload {
    player: Side;
    inputs: InputsSync;
    // TODO: Implement protection against position hacking
    sequence: number;
    time: number;
}

export interface GameStateUpdatePayload {
    gameState: GameState;
    lastInputs: [
        GamePlayerInputPayload | undefined,
        GamePlayerInputPayload | undefined,
    ];
}

export interface GameActivateElementPayload {
    elementName: string;
}

export interface TimeSyncPayload {
    id: number;
    clientLocalTime: number;
    serverGameTime?: number;
}

export interface TimeInfoPayload {
    averageRtt: number;
}

export interface GameFinishedPayload {
    duration: number;
    rank: number;
}
// events

export type PingEvent = [
    type: SocketEventType.TIME_SYNC,
    payload: TimeSyncPayload,
];

export type TimeInfoEvent = [
    type: SocketEventType.TIME_INFO,
    payload: TimeInfoPayload,
];

export type GameStartEvent = [
    type: SocketEventType.GAME_START,
    payload: GameStateUpdatePayload,
];

export type GameFinishedEvent = [
    type: SocketEventType.GAME_FINISHED,
    payload: GameFinishedPayload,
];

export type GameStateUpdateEvent = [
    type: SocketEventType.GAME_STATE_UPDATE,
    payload: GameStateUpdatePayload,
];

export type GamePlayerInputEvent = [
    type: SocketEventType.GAME_PLAYER_INPUT,
    payload: GamePlayerInputPayload[],
];

export type GameActivateElementEvent = [
    type: SocketEventType.GAME_ACTIVATE_ELEMENT,
    payload: GameActivateElementPayload,
];

export type GameDeactivateElementEvent = [
    type: SocketEventType.GAME_DEACTIVATE_ELEMENT,
    payload: GameActivateElementPayload,
];

export type StartTimerEvent = [
    type: SocketEventType.START_TIMER,
    payload: StartTimerPayload,
];

///////////////// LOBBY EVENTS

export type TeamSelectLevel = [
    type: SocketEventLobby.SELECT_LEVEL,
    payload: number | undefined,
];

export type TeamSelectSide = [
    type: SocketEventLobby.SELECT_SIDE,
    payload: Side | undefined,
];

// export type CreateLobbyEvent = [
//     type: SocketEventLobby.CREATE_LOBBY,
//     payload: CreateLobbyPayload,
// ];

// export type FriendJoinLobbyEvent = [
//     type: SocketEventLobby.FRIEND_JOIN_LOBBY,
//     payload: FriendJoinLobbyPayload,
// ];

// export type InviteFriendTokenEvent = [
//     type: SocketEventLobby.INVITE_FRIEND_TOKEN,
//     payload: InviteFriendTokenPayload,
// ];

export type ReadyToStartEvent = [
    type: SocketEventLobby.READY_TO_PLAY,
    payload: boolean,
];

// export type JoinRandomQueueEvent = [
//     type: SocketEventLobby.JOIN_RANDOM_QUEUE,
//     payload: JoinRandomQueuePayload,
// ];

export type CreateGameEvent = [
    type: SocketEventLobby.CREATE_GAME,
    payload: CreateGamePayload,
];

export type JoinGameEvent = [
    type: SocketEventLobby.JOIN_GAME,
    // TODO: Should be updated. The server already received the creation params before,
    // it should be avoided to be sent twice
    payload: CreateGamePayload,
];

export type SocketEvent =
    | GameStartEvent
    | GameFinishedEvent
    | GameStateUpdateEvent
    | GamePlayerInputEvent
    | GameActivateElementEvent
    | GameDeactivateElementEvent
    | PingEvent
    | TimeInfoEvent
    | StartTimerEvent
    // | CreateLobbyEvent
    // | InviteFriendTokenEvent
    // | FriendJoinLobbyEvent
    | TeamSelectLevel
    | TeamSelectSide
    | ReadyToStartEvent
    | JoinGameEvent
    // | JoinRandomQueueEvent
    | CreateGameEvent;

export enum MovableComponentState {
    onFloor,
    inside,
    // collisionInsensitive,
    inAir,
    // ascend,
}

export interface MovableComponent {
    position: Vector2;
    velocity: Vector2;
}

export type CollidingElem = Mesh | Group | Object3D;

export interface InteractiveComponent {
    shouldActivate: boolean;
    isActive: boolean;
}

export const ACTIONS = [
    'left',
    'right',
    'top',
    'bottom',
    'jump',
    'interact',
    'resetPosition',
] as const;
type ActionTuple = typeof ACTIONS;
export type Action = ActionTuple[number];

export class KeyBindings {
    [key: string]: Action;
}

export type UIKeyBindings = [
    Action,
    [string | undefined, string | undefined],
][];
