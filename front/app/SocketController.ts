import { Socket, io } from 'socket.io-client';

enum SocketEvents {
    CONNECT = 'connect',
}

export class SocketController {
    constructor() {
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!);
        this.subscribeToMenuEvents(socket);
    }

    subscribeToMenuEvents = (socket: Socket) => {
        socket.on(SocketEvents.CONNECT, () => {
            console.log('connected', socket.id);
        });
    };
}
