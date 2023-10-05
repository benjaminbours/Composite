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

const TIME_SAMPLE = 10;

export class SocketController {
    private socket: Socket;
    private timeSamplesSent: TimeSyncPayload[] = [];
    // Round-trip time or ping
    private timeSamples: { rtt: number; gameTimeDelta: number }[] = [];
    public getCurrentGameState?: () => GameState;
    public synchronizeGameTimeWithServer?: (time: number) => void;
    public onGameStateUpdate?: (gameState: GameState) => void;
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
                for (let i = 0; i < TIME_SAMPLE; i++) {
                    setTimeout(() => {
                        const payload = {
                            id: i + 1,
                            clientLocalTime: Date.now(),
                        };
                        this.timeSamplesSent.push(payload);
                        this.emit([SocketEventType.TIME_SYNC, payload]);
                    }, i * 300);
                }
                onGameStart(data.gameState);
            },
        );

        this.socket.on(SocketEventType.TIME_SYNC, (data: TimeSyncPayload) => {
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
            if (this.timeSamples.length === TIME_SAMPLE) {
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
                    this.synchronizeGameTimeWithServer(
                        data.serverGameTime! + (found?.gameTimeDelta || 0),
                    );
                    this.isTimeSynced = true;
                }
            }
        });

        this.socket.on(
            SocketEventType.GAME_STATE_UPDATE,
            (data: GameStateUpdatePayload) => {
                if (this.onGameStateUpdate && this.isTimeSynced) {
                    this.onGameStateUpdate(data.gameState);
                }
            },
        );

        // this.socket.on(
        //     SocketEventType.GAME_ACTIVATE_ELEMENT,
        //     (data: GameActivateElementPayload) => {
        //         console.log('HERE activate', data);

        //         if (this.collidingElements) {
        //             const elementToActivate = this.collidingElements.find(
        //                 (elem) => elem.name === data.elementName,
        //             );
        //             if (!elementToActivate) {
        //                 console.error(
        //                     'Not found element to activate',
        //                     data.elementName,
        //                 );
        //             }
        //             (elementToActivate as InteractiveComponent).shouldActivate =
        //                 true;
        //             // this.secondPlayer.position.set(data.x, data.y, 0);
        //         }
        //     },
        // );

        // this.socket.on(
        //     SocketEventType.GAME_DEACTIVATE_ELEMENT,
        //     (data: GameActivateElementPayload) => {
        //         console.log('HERE deactivate', data);

        //         if (this.collidingElements) {
        //             const elementToDeactivate = this.collidingElements.find(
        //                 (elem) => elem.name === data.elementName,
        //             );
        //             if (!elementToDeactivate) {
        //                 console.error(
        //                     'Not found element to deactivate',
        //                     data.elementName,
        //                 );
        //             }
        //             (
        //                 elementToDeactivate as InteractiveComponent
        //             ).shouldActivate = false;
        //             // this.secondPlayer.position.set(data.x, data.y, 0);
        //         }
        //     },
        // );
    }

    emit = (event: SocketEvent) => {
        this.socket.emit(event[0], event[1]);
    };
}
