// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { GameStatus, Level } from '@prisma/client';
// our libs
import {
  SocketEventType,
  MatchMakingPayload,
  Levels,
  GamePositionPayload,
} from 'composite-core';
// local
import { PrismaService } from '../prisma.service';
import {
  Player,
  PlayerFoundInQueue,
  PlayerStatus,
  TemporaryStorageService,
} from '../temporary-storage.service';

@WebSocketGateway({
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
  credentials: true,
  // disable while cors is managed in load balancer
  // cors: {
  //   origin: [ENVIRONMENT.CLIENT_URL],
  // },
})
export class SocketGateway {
  @WebSocketServer() server: Server;

  constructor(
    private prismaService: PrismaService,
    private temporaryStorage: TemporaryStorageService,
  ) {}

  @SubscribeMessage(SocketEventType.CONNECTION)
  async handleConnection(socket: Socket) {
    if (socket.recovered) {
      console.log('Successful recovery');
      // recovery was successful: socket.id, socket.rooms and socket.data were restored
    } else {
      console.log('new or unrecoverable session');
      // new or unrecoverable session
    }
  }

  @SubscribeMessage(SocketEventType.MATCHMAKING_INFO)
  async handleMatchMakingPayload(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MatchMakingPayload,
  ) {
    console.log('matchmaking info', socket.id, data);
    const playerFound = await this.temporaryStorage.findMatch(data, 0);
    if (!playerFound) {
      console.log('no match, add to queue');
      const player = new Player(
        PlayerStatus.IS_PENDING,
        data.side,
        data.selectedLevel,
      );
      this.temporaryStorage.addToQueue(socket.id, player);
      return;
    } else {
      this.createGame(playerFound, {
        socketId: socket.id,
        player: new Player(
          PlayerStatus.IS_PLAYING,
          data.side,
          data.selectedLevel,
        ),
      });
    }
  }

  @SubscribeMessage(SocketEventType.GAME_POSITION)
  async handleGamePosition(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: GamePositionPayload,
  ) {
    const gameRoom = Array.from(socket.rooms)[1];
    socket.to(gameRoom).emit(SocketEventType.GAME_POSITION, data);
  }

  @SubscribeMessage(SocketEventType.DISCONNECT)
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnect', socket.id);
    // TODO: Investigate if in case of recovery session, I should better keep the data for a while
    this.temporaryStorage.removePlayer(socket.id);
  }

  /**
   * Change the status of the player found in queue to playing
   * and remove him from the queue
   *
   * Store data for the new player arriving
   *
   * Store persistent game data and use the game id as room id
   *
   * Emit game start to the room
   */
  async createGame(
    playerFoundInQueue: PlayerFoundInQueue,
    playerArriving: { socketId: string; player: Player },
  ) {
    const dbLevel = (() => {
      switch (Number(playerFoundInQueue.player.selectedLevel)) {
        case Levels.CRACK_THE_DOOR:
          return Level.CRACK_THE_DOOR;
        case Levels.LEARN_TO_FLY:
          return Level.LEARN_TO_FLY;
        case Levels.THE_HIGH_SPHERES:
          return Level.THE_HIGH_SPHERES;
      }
    })();

    const [game] = await Promise.all([
      // store persistent game data
      this.prismaService.game.create({
        data: {
          level: dbLevel,
          status: GameStatus.STARTED,
        },
      }),
      // update queue in temporary storage
      this.temporaryStorage.createGame(playerFoundInQueue, playerArriving),
    ]);
    const roomName = String(game.id);
    this.addSocketToRoom(playerFoundInQueue.socketId, roomName);
    this.addSocketToRoom(playerArriving.socketId, roomName);
    this.server.to(roomName).emit(SocketEventType.GAME_START);
  }

  // TODO: As a room is equivalent to a game, lets make a proper
  // room rotation (leave the last one and add to next one) while finishing
  // a game and going into another one
  addSocketToRoom(socketId: string, room: string) {
    const socket = this.server.sockets.sockets.get(socketId);
    socket.join(room);
  }
}
