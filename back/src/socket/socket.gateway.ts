import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
// import { ENVIRONMENT } from '../environment';

@WebSocketGateway({
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
  credentials: true,
  // transports: ['websocket'],
  // disable while cors is managed in load balancer
  // cors: {
  //   origin: [ENVIRONMENT.CLIENT_URL],
  // },
})
export class SocketGateway {
  @SubscribeMessage('connection')
  handleConnection(
    socket: Socket,
    // data: string,
    @MessageBody() data: string,
  ): string {
    console.log(data);
    if (socket.recovered) {
      console.log('Successful recovery');
      // recovery was successful: socket.id, socket.rooms and socket.data were restored
    } else {
      console.log('new or unrecoverable session');
      // new or unrecoverable session
    }
    return 'Hello world!';
  }

  @SubscribeMessage('message')
  handleMessage(
    // client: Socket,
    // data: string,
    @MessageBody() data: string,
  ): string {
    console.log(data);
    return 'Hello world!';
  }
}
