// vendors
import { Socket, io } from 'socket.io-client';
// our libs
import {
    SocketEventType,
    SocketEvent,
    GameStateUpdatePayload,
    GameState,
    TimeSyncPayload,
    TeammateInfoPayload,
    GamePlayerInputPayload,
} from '@benjaminbours/composite-core';

const TIME_SAMPLE_COUNT = 20;
const TIME_SAMPLE_INTERVAL = 150;

export class SocketController {
    private socket: Socket;
    private timeSamplesSent: TimeSyncPayload[] = [];
    // Round-trip time or ping
    private timeSamples: { rtt: number; gameTimeDelta: number }[] = [];
    public getCurrentGameState?: () => GameState;
    public synchronizeGameTimeWithServer?: (
        serverTime: number,
        rtt: number,
    ) => void;
    public onGameStateUpdate?: (data: GameStateUpdatePayload) => void;
    private isTimeSynced = false;

    constructor(
        onGameStart: (initialGameState: GameState) => void,
        onGameFinish: () => void,
        onTeamMateDisconnect: () => void,
        onTeamMateInfo: (data: TeammateInfoPayload) => void,
    ) {
        this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            withCredentials: true,
        });

        this.socket.on(SocketEventType.CONNECT, () => {
            console.log('connected', this.socket.id);
        });

        this.socket.on(
            SocketEventType.GAME_START,
            (data: GameStateUpdatePayload) => {
                console.log('received game start event');
                onGameStart(data.gameState);
            },
        );

        this.socket.on(
            SocketEventType.GAME_STATE_UPDATE,
            (data: GameStateUpdatePayload) => {
                if (this.onGameStateUpdate && this.isTimeSynced) {
                    this.onGameStateUpdate(data);
                }
            },
        );

        this.socket.on(SocketEventType.GAME_FINISHED, onGameFinish);
        this.socket.on(SocketEventType.TEAMMATE_INFO, onTeamMateInfo);
        this.socket.on(
            SocketEventType.TEAMMATE_DISCONNECT,
            onTeamMateDisconnect,
        );
    }

    public onTimeSyncReceived =
        (resolve: (value: unknown) => void) => (data: TimeSyncPayload) => {
            console.log('received time sync event', data);
            const sample = this.timeSamplesSent.find(
                ({ id }) => data.id === id,
            )!;
            const currentGameTime = this.getCurrentGameState
                ? this.getCurrentGameState().game_time
                : 0;
            this.timeSamples.push({
                rtt: Date.now() - sample.clientLocalTime,
                gameTimeDelta: data.serverGameTime! - currentGameTime,
            });
            if (this.timeSamples.length === TIME_SAMPLE_COUNT) {
                console.log('finished gathering ping info', this.timeSamples);
                const totalRtt = this.timeSamples.reduce(
                    (a, b) => a + b.rtt,
                    0,
                );
                let averageRtt = Math.floor(totalRtt / TIME_SAMPLE_COUNT);
                averageRtt = 1000;
                if (this.synchronizeGameTimeWithServer) {
                    this.synchronizeGameTimeWithServer(
                        data.serverGameTime!,
                        averageRtt,
                    );
                    this.isTimeSynced = true;

                    // unregister all listener for time sync
                    this.socket.removeAllListeners(SocketEventType.TIME_SYNC);
                    resolve(true);
                }
            }
        };

    public synchronizeTime = () => {
        return new Promise((resolve) => {
            this.isTimeSynced = false;
            // remove previous time samples in case of resynchronization
            this.timeSamples = [];
            this.timeSamplesSent = [];
            // register listener for time sync event
            this.socket.on(
                SocketEventType.TIME_SYNC,
                this.onTimeSyncReceived(resolve),
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

    sendInputs = (inputs: GamePlayerInputPayload[]) => {
        this.emit([SocketEventType.GAME_PLAYER_INPUT, inputs]);
    };

    public emit = (event: SocketEvent) => {
        this.socket.emit(event[0], event[1]);
    };

    public destroy = () => {
        console.log('disconnect');
        this.socket.disconnect();
    };
}
