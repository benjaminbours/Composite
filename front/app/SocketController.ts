// vendors
import { Socket, io } from 'socket.io-client';
// our libs
import {
    SocketEventType,
    SocketEvent,
    GamePositionPayload,
} from '@benjaminbours/composite-core';
import { Player } from './Game/Player';

export class SocketController {
    private socket: Socket;
    public secondPlayer?: Player;

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
            SocketEventType.GAME_POSITION,
            (data: GamePositionPayload) => {
                if (this.secondPlayer) {
                    this.secondPlayer.position.set(data.x, data.y, 0);
                }
            },
        );
    }

    emit = (event: SocketEvent) => {
        this.socket.emit(event[0], event[1]);
    };
}
