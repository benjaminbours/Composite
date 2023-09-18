// vendors
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
// our libs
import { SocketEventType, MatchMakingInfo, Side, Levels } from 'composite-core';
import { RedisStore } from 'cache-manager-redis-store';
import { RedisClientType } from 'redis';

const REDIS_MATCH_MAKING_LIST_KEY = 'matchMakingQueue';

interface QueueItem {
  side: Side;
  selectedLevel: Levels;
  socketId: string;
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
  private redisClient: RedisClientType;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
  }

  @SubscribeMessage('connection')
  async handleConnection(socket: Socket) {
    if (socket.recovered) {
      console.log('Successful recovery');
      // recovery was successful: socket.id, socket.rooms and socket.data were restored
    } else {
      console.log('new or unrecoverable session');
      // new or unrecoverable session
    }
  }

  async addToQueue(socketId: string, data: MatchMakingInfo) {
    await Promise.all([
      this.redisClient.HSET(socketId, Object.entries(data).flat()),
      this.redisClient.RPUSH(REDIS_MATCH_MAKING_LIST_KEY, socketId),
    ]);
  }

  async removeFromQueue(socketId: string, indexToClear: number) {
    await Promise.all([
      this.redisClient.DEL(socketId),
      this.redisClient.LREM(
        REDIS_MATCH_MAKING_LIST_KEY,
        indexToClear,
        socketId,
      ),
    ]);
  }

  async findMatch(
    data: MatchMakingInfo,
    index: number,
  ): Promise<{ player: QueueItem; indexToClear: number } | undefined> {
    const increaseRangeFactor = 5;
    const ids: string[] = await this.redisClient
      .LRANGE(REDIS_MATCH_MAKING_LIST_KEY, index, index + increaseRangeFactor)
      .catch((err: any) => {
        console.log(err);
        return [];
      });
    // console.log('list', ids);

    for (const id of ids) {
      const matchingInfo = (await this.redisClient.HGETALL(
        id,
      )) as unknown as MatchMakingInfo;
      // console.log('id processing', id);
      // console.log('data retrieved', matchingInfo);
      // console.log('data retrieved', matchingInfo.selectedLevel);

      const isSameLevel =
        data.selectedLevel === Number(matchingInfo.selectedLevel);
      const isOppositeSide = data.side !== Number(matchingInfo.side);

      if (isSameLevel && isOppositeSide) {
        return {
          player: {
            socketId: id,
            ...matchingInfo,
          },
          indexToClear: index,
        };
      }
    }

    if (ids.length < increaseRangeFactor) {
      return undefined;
    }

    return this.findMatch(data, index + increaseRangeFactor);
  }

  @SubscribeMessage(SocketEventType.MATCHMAKING_INFO)
  async handleMatchMakingInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MatchMakingInfo,
  ) {
    console.log('matchmaking info', socket.id, data);
    const match = await this.findMatch(data, 0);

    if (!match) {
      console.log('no match, add to queue');
      await this.addToQueue(socket.id, data);
    } else {
      // remove match from queue
      await this.removeFromQueue(match.player.socketId, match.indexToClear);
      console.log('match, remove from queue');
    }
  }

  @SubscribeMessage(SocketEventType.DISCONNECT)
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    // TODO: If socket disconnect but are actually playing, not in the queue, do not remove them from queue
    console.log('disconnect', socket.id);
    await this.removeFromQueue(socket.id, 0);
  }
}
