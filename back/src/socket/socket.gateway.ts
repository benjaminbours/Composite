// vendors
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { GameStatus, Level } from '@prisma/client';
import { RedisStore } from 'cache-manager-redis-store';
import { RedisClientType } from 'redis';
// our libs
import {
  SocketEventType,
  MatchMakingPayload,
  Side,
  Levels,
  GamePositionPayload,
} from 'composite-core';
// local
import { PrismaService } from '../prisma.service';

const REDIS_MATCH_MAKING_LIST_KEY = 'matchMakingQueue';

enum PlayerStatus {
  IS_PLAYING,
  IS_PENDING,
}

class Player {
  /**
   * key use with redis to store game id (the name of the room with socket io)
   */
  public gameId?: string;
  constructor(
    public status: PlayerStatus,
    public side: Side,
    public selectedLevel: Levels,
  ) {}
}

interface PlayerFoundInQueue {
  socketId: string;
  player: Player;
  indexToClear: number;
}

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
  private redisClient: RedisClientType;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prismaService: PrismaService,
  ) {
    this.redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
  }

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
    const playerFound = await this.findMatch(data, 0);
    if (!playerFound) {
      console.log('no match, add to queue');
      this.addToQueue(socket.id, data);
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
    const player = await this.getPlayer(socket.id);
    // TODO: Investigate if in case of recovery session, I should better keep the data for a while
    const actions = [this.redisClient.DEL(socket.id)] as Promise<any>[];
    // try to remove from queue only if in the queue
    if (player.status === PlayerStatus.IS_PENDING) {
      actions.push(this.removeFromQueue(socket.id, 0));
    }
    await Promise.all(actions);
  }

  // utils

  async addToQueue(socketId: string, data: MatchMakingPayload) {
    const player = new Player(
      PlayerStatus.IS_PENDING,
      data.side,
      data.selectedLevel,
    );
    await Promise.all([
      this.redisClient.HSET(socketId, Object.entries(player).flat()),
      this.redisClient.RPUSH(REDIS_MATCH_MAKING_LIST_KEY, socketId),
    ]);
  }

  async removeFromQueue(socketId: string, indexToClear: number) {
    return this.redisClient.LREM(
      REDIS_MATCH_MAKING_LIST_KEY,
      indexToClear,
      socketId,
    );
  }

  async findMatch(
    data: MatchMakingPayload,
    index: number,
  ): Promise<PlayerFoundInQueue | undefined> {
    const increaseRangeFactor = 5;
    const ids: string[] = await this.redisClient
      .LRANGE(REDIS_MATCH_MAKING_LIST_KEY, index, index + increaseRangeFactor)
      .catch((err: any) => {
        console.log(err);
        return [];
      });
    console.log('list', ids);

    for (const id of ids) {
      const player = await this.getPlayer(id);
      console.log('id processing', id);
      console.log('data retrieved', player);
      console.log('data retrieved', player.selectedLevel);

      const isSameLevel = data.selectedLevel === Number(player.selectedLevel);
      const isOppositeSide = data.side !== Number(player.side);

      if (isSameLevel && isOppositeSide) {
        return {
          socketId: id,
          player,
          indexToClear: index,
        };
      }
    }

    if (ids.length < increaseRangeFactor) {
      return undefined;
    }

    return this.findMatch(data, index + increaseRangeFactor);
  }

  async getPlayer(socketId: string) {
    return this.redisClient.HGETALL(socketId) as unknown as Player;
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
      // remove player found in queue from queue
      this.removeFromQueue(
        playerFoundInQueue.socketId,
        playerFoundInQueue.indexToClear,
      ),
      // update player found in queue status and add partner
      this.redisClient.HSET(playerFoundInQueue.socketId, [
        'status',
        PlayerStatus.IS_PLAYING,
      ]),
      // store new player data
      this.redisClient.HSET(
        playerArriving.socketId,
        Object.entries(playerArriving.player).flat(),
      ),
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
