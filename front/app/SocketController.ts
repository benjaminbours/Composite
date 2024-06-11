// vendors
import { Socket, io } from 'socket.io-client';
// our libs
import {
    SocketEventType,
    SocketEvent,
    GameStateUpdatePayload,
    GameState,
    TimeSyncPayload,
    GamePlayerInputPayload,
    SocketEventLobby,
    Side,
    FriendJoinLobbyPayload,
    GameFinishedPayload,
} from '@benjaminbours/composite-core';

const TIME_SAMPLE_COUNT = 20;
const TIME_SAMPLE_INTERVAL = 150;

export class SocketController {
    public socket: Socket;
    private timeSamplesSent: TimeSyncPayload[] = [];
    // Round-trip time or ping
    private timeSamples: { rtt: number }[] = [];
    private isTimeSynced = false;
    public isConnected = false;

    constructor(
        onGameStart: (initialGameState: GameState) => void,
        onGameFinish: (data: GameFinishedPayload) => void,
        onTeamMateDisconnect: () => void,
        onFriendJoinLobby: (data: FriendJoinLobbyPayload) => void,
        handleReceiveLevelOnLobby: (levelId: number) => void,
        handleReceiveSideOnLobby: (side: Side) => void,
        handleReceiveReadyToPlay: (isReady: boolean) => void,
    ) {
        this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            withCredentials: true,
        });

        // menu listeners
        this.socket.on(SocketEventType.CONNECT, () => {
            console.log('connected', this.socket.id);
            this.isConnected = true;
        });
        this.socket.on(
            SocketEventType.GAME_START,
            (data: GameStateUpdatePayload) => {
                console.log('received game start event', data.gameState);
                onGameStart(data.gameState);
            },
        );
        this.socket.on(SocketEventType.GAME_FINISHED, onGameFinish);
        this.socket.on(SocketEventLobby.FRIEND_JOIN_LOBBY, onFriendJoinLobby);
        this.socket.on(
            SocketEventType.TEAMMATE_DISCONNECT,
            onTeamMateDisconnect,
        );

        // team lobby event
        this.socket.on(
            SocketEventLobby.SELECT_LEVEL,
            handleReceiveLevelOnLobby,
        );
        this.socket.on(SocketEventLobby.SELECT_SIDE, handleReceiveSideOnLobby);
        this.socket.on(
            SocketEventLobby.READY_TO_PLAY,
            handleReceiveReadyToPlay,
        );
    }

    public registerGameStateUpdateListener = (
        onGameStateUpdate: (data: GameStateUpdatePayload) => void,
    ) => {
        this.socket.on(
            SocketEventType.GAME_STATE_UPDATE,
            (data: GameStateUpdatePayload) => {
                if (this.isTimeSynced) {
                    onGameStateUpdate(data);
                }
            },
        );
    };

    public unregisterGameStateUpdateListener = () => {
        this.socket.removeAllListeners(SocketEventType.GAME_STATE_UPDATE);
    };

    public onTimeSyncReceived =
        (
            onStartTimer: () => void,
            resolve: (value: [serverTime: number, rtt: number]) => void,
        ) =>
        (data: TimeSyncPayload) => {
            console.log('received time sync event', data);
            const sample = this.timeSamplesSent.find(
                ({ id }) => data.id === id,
            )!;
            this.timeSamples.push({
                rtt: Date.now() - sample.clientLocalTime,
            });
            if (this.timeSamples.length === TIME_SAMPLE_COUNT) {
                console.log('finished gathering ping info', this.timeSamples);
                const totalRtt = this.timeSamples.reduce(
                    (a, b) => a + b.rtt,
                    0,
                );
                let averageRtt = Math.floor(totalRtt / TIME_SAMPLE_COUNT);
                this.isTimeSynced = true;

                this.socket.on(SocketEventType.START_TIMER, () => {
                    console.log('Receive start timer');
                    this.socket.removeAllListeners(SocketEventType.TIME_SYNC);
                    this.socket.removeAllListeners(SocketEventType.START_TIMER);
                    onStartTimer();
                });
                resolve([data.serverGameTime!, averageRtt]);
                this.emit([SocketEventType.TIME_INFO, { averageRtt }]);
            }
        };

    public synchronizeTime = (
        onStartTimer: () => void,
    ): Promise<[serverTime: number, rtt: number]> => {
        return new Promise((resolve) => {
            this.isTimeSynced = false;
            // remove previous time samples in case of resynchronization
            this.timeSamples = [];
            this.timeSamplesSent = [];
            // register listener for time sync event
            this.socket.on(
                SocketEventType.TIME_SYNC,
                this.onTimeSyncReceived(onStartTimer, resolve),
            );
            // send time samples
            for (let i = 0; i < TIME_SAMPLE_COUNT; i++) {
                setTimeout(() => {
                    const payload = {
                        id: i + 1,
                        clientLocalTime: Date.now(),
                    };
                    this.timeSamplesSent.push(payload);
                    this.emit([SocketEventType.TIME_SYNC, payload]);
                }, i * TIME_SAMPLE_INTERVAL);
            }
        });
    };

    public sendInputs = (inputs: GamePlayerInputPayload[]) => {
        this.emit([SocketEventType.GAME_PLAYER_INPUT, inputs]);
    };

    public emit = (event: SocketEvent) => {
        this.socket.emit(event[0], event[1]);
    };

    public destroy = () => {
        console.log('disconnect');
        this.socket.disconnect();
        this.isConnected = false;
    };
}
