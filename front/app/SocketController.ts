// vendors
import { Socket, io } from 'socket.io-client';
// our libs
import {
    SocketEventType,
    SocketEvent,
    GameStateUpdatePayload,
    GameState,
    TimeSyncPayload,
} from '@benjaminbours/composite-core';

const TIME_SAMPLE_COUNT = 10;

export class SocketController {
    private socket: Socket;
    private timeSamplesSent: TimeSyncPayload[] = [];
    // Round-trip time or ping
    private timeSamples: { rtt: number; gameTimeDelta: number }[] = [];
    public getCurrentGameState?: () => GameState;
    public synchronizeGameTimeWithServer?: (time: number) => void;
    public onGameStateUpdate?: (gameState: GameState) => void;
    public onGameFinished?: () => void;
    private isTimeSynced = false;

    constructor(onGameStart: (initialGameState: GameState) => void) {
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
                    this.onGameStateUpdate(data.gameState);
                }
            },
        );

        this.socket.on(SocketEventType.GAME_FINISHED, () => {
            if (this.onGameFinished) {
                this.onGameFinished();
            }
        });
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
                const found = this.timeSamples
                    .sort((a, b) => {
                        // Only sort on rtt if not identical
                        if (a.rtt < b.rtt) return -1;
                        if (a.rtt > b.rtt) return 1;
                        // Sort on game time delta
                        if (a.gameTimeDelta < b.gameTimeDelta) return 1;
                        if (a.gameTimeDelta > b.gameTimeDelta) return -1;
                        // Both identical, return 0
                        return 0;
                    })
                    .find(({ gameTimeDelta }) => gameTimeDelta !== 0);
                console.log('finished gathering ping info', found);

                if (this.synchronizeGameTimeWithServer) {
                    const gameTimeDelta = Math.ceil(
                        (found?.gameTimeDelta || 0) / 2,
                    );
                    this.synchronizeGameTimeWithServer(
                        data.serverGameTime! + gameTimeDelta,
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
            // remove previous time samples in case of resynchronization
            this.timeSamples = [];
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
                }, i * 300);
            }
        });
    };

    public emit = (event: SocketEvent) => {
        this.socket.emit(event[0], event[1]);
    };

    public destroy = () => {
        console.log('disconnect');
        this.socket.disconnect();
    };
}
