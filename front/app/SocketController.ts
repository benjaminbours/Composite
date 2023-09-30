// vendors
import { Socket, io } from 'socket.io-client';
// our libs
import {
    SocketEventType,
    SocketEvent,
    GameStateUpdatePayload,
    GameState,
} from '@benjaminbours/composite-core';

export class SocketController {
    private socket: Socket;
    // public secondPlayer?: Player;
    // public collidingElements?: CollidingElem[];
    // public inputsSended: GamePlayerInputPayload[] = [];
    public onGameStateUpdate?: (gameState: GameState) => void;

    constructor(onGameStart: () => void) {
        this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            withCredentials: true,
        });

        this.socket.on(SocketEventType.CONNECT, () => {
            console.log('connected', this.socket.id);
        });

        this.socket.on(SocketEventType.GAME_START, () => {
            console.log('received game start event');
            onGameStart();
        });

        this.socket.on(
            SocketEventType.GAME_STATE_UPDATE,
            (data: GameStateUpdatePayload) => {
                if (this.onGameStateUpdate) {
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
