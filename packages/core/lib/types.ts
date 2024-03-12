import type { Group, Mesh, Object3D, Vec2 } from 'three';
import { GameState } from './GameState';

export enum Side {
    SHADOW,
    LIGHT,
}

export enum Layer {
    DEFAULT,
    OCCLUSION, // platforms, elements
    OCCLUSION_PLAYER, // only the player
    PLAYER_INSIDE,
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
    // send only by the client after connect in random queue
    MATCHMAKING_INFO = 'MATCHMAKING_INFO',
    // send only by the client after arriving invite friend scene
    REQUEST_INVITE_FRIEND_TOKEN = 'REQUEST_INVITE_FRIEND_TOKEN',
    // send only by the server after receiving request from client
    INVITE_FRIEND_TOKEN = 'INVITE_FRIEND_TOKEN',
    // send by the client just after joining lobby and connecting
    FRIEND_JOIN_LOBBY = 'FRIEND_JOIN_LOBBY',
    // send by the server to the invite emitter after the friend joined the lobby
    JOIN_LOBBY = 'JOIN_LOBBY',
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
    // send by the server to inform a team mate made a choice
    TEAMMATE_INFO = 'TEAMMATE_INFO',
    // send by the server to inform a team mate disconnected
    TEAMMATE_DISCONNECT = 'TEAMMATE_DISCONNECT',
}

export enum SocketEventTeamLobby {
    SELECT_LEVEL = 'SELECT_LEVEL',
    SELECT_SIDE = 'SELECT_SIDE',
}

export interface Inputs {
    left: boolean;
    right: boolean;
    jump: boolean;
    top: boolean;
    bottom: boolean;
}

// payloads
export interface MatchMakingPayload {
    side: Side;
    selectedLevel: number;
}

export interface InviteFriendTokenPayload {
    token: string;
}

export interface TeammateInfoPayload {
    side: Side;
    selectedLevel: number;
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

// events

export type PingEvent = [
    type: SocketEventType.TIME_SYNC,
    payload: TimeSyncPayload,
];

export type MatchMakingEvent = [
    type: SocketEventType.MATCHMAKING_INFO,
    payload: MatchMakingPayload,
];

export type RequestInviteFriendTokenEvent = [
    type: SocketEventType.REQUEST_INVITE_FRIEND_TOKEN,
];

export type FriendJoinLobbyEvent = [
    type: SocketEventType.FRIEND_JOIN_LOBBY,
    payload: string,
];

export type JoinLobbyEvent = [type: SocketEventType.JOIN_LOBBY];

export type InviteFriendTokenEvent = [
    type: SocketEventType.INVITE_FRIEND_TOKEN,
    payload: InviteFriendTokenPayload,
];

export type TeammateInfoEvent = [
    type: SocketEventType.TEAMMATE_INFO,
    payload: TeammateInfoPayload,
];

export type GameStartEvent = [
    type: SocketEventType.GAME_START,
    payload: GameStateUpdatePayload,
];

export type GameFinishedEvent = [type: SocketEventType.GAME_FINISHED];

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

export type TeamSelectLevel = [
    type: SocketEventTeamLobby.SELECT_LEVEL,
    payload: number,
];

export type TeamSelectSide = [
    type: SocketEventTeamLobby.SELECT_SIDE,
    payload: Side,
];

export type SocketEvent =
    | MatchMakingEvent
    | TeammateInfoEvent
    | GameStartEvent
    | GameFinishedEvent
    | GameStateUpdateEvent
    | GamePlayerInputEvent
    | GameActivateElementEvent
    | GameDeactivateElementEvent
    | PingEvent
    | RequestInviteFriendTokenEvent
    | InviteFriendTokenEvent
    | FriendJoinLobbyEvent
    | JoinLobbyEvent
    | TeamSelectLevel
    | TeamSelectSide;

export class QueueInfo {
    constructor(public all = 0, public light = 0, public shadow = 0) {}
}

export class AllQueueInfo extends QueueInfo {
    constructor(
        public levels: Record<number, QueueInfo>,
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
    // collisionInsensitive,
    inAir,
    // ascend,
}

export interface MovableComponent {
    position: Vec2;
    velocity: Vec2;
}

export type CollidingElem = Mesh | Group | Object3D;

export interface InteractiveComponent {
    shouldActivate: boolean;
    isActive: boolean;
}

export const MOVEMENTS = ['left', 'right', 'top', 'bottom', 'jump'] as const;
type MovementTuple = typeof MOVEMENTS; // readonly ['hearts', 'diamonds', 'spades', 'clubs']
export type Movement = MovementTuple[number];

export class KeyBindings {
    [key: string]: Movement;
}

export type UIKeyBindings = [Movement, string[]][];
