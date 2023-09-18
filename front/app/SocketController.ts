// vendors
import { Socket, io } from 'socket.io-client';
// our libs
import { SocketEventType, SocketEvent } from 'composite-core';

export class SocketController {
    private socket: Socket;

    constructor() {
        this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            withCredentials: true,
        });

        this.socket.on(SocketEventType.CONNECT, () => {
            console.log('connected', this.socket.id);
        });
    }

    emit = (event: SocketEvent) => {
        this.socket.emit(...event);
    };
}
