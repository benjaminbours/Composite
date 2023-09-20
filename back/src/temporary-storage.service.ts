// vendors
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
// our libs
import {
  AllQueueInfo,
  Levels,
  MatchMakingPayload,
  QueueInfo,
  Side,
} from 'composite-core';
// local

export enum PlayerStatus {
  IS_PLAYING,
  IS_PENDING,
}

export class Player {
  // /**
  //  * key use with redis to store game id (the name of the room with socket io)
  //  */
  // public gameId?: string;
  constructor(
    public status: PlayerStatus,
    public side: Side,
    public selectedLevel: Levels,
  ) {}
}

enum REDIS_KEYS {
  MATCH_MAKING_QUEUE = 'MATCH_MAKING_QUEUE',
  QUEUE_INFO = 'QUEUE_INFO',
}

export interface PlayerFoundInQueue {
  socketId: string;
  player: Player;
  indexToClear: number;
}

@Injectable()
export class TemporaryStorageService {
  private redisClient: RedisClientType;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.redisClient = (
      this.cacheManager.store as unknown as RedisStore
    ).getClient();
  }

  async setPlayer(socketId: string, data: Partial<Player>, transaction?: any) {
    const client = transaction ? transaction : this.redisClient;
    return client.HSET(socketId, Object.entries(data).flat());
  }

  async getPlayer(socketId: string) {
    return this.redisClient
      .HGETALL(socketId)
      .then(
        (res) =>
          new Player(
            Number(res.status),
            Number(res.side),
            Number(res.selectedLevel),
          ),
      );
  }

  async removePlayer(socketId: string) {
    const player = await this.getPlayer(socketId);
    const transaction = this.redisClient.MULTI();

    transaction.DEL(socketId);
    if (player.status === PlayerStatus.IS_PENDING) {
      this.removeFromQueue(socketId, 0, transaction);
      this.updateQueueInfo('subtract', player, transaction);
    }
    transaction.exec();
  }

  async getQueueInfo(): Promise<AllQueueInfo> {
    return Promise.all([
      this.redisClient.HGETALL(REDIS_KEYS.QUEUE_INFO),
      ...Object.values(Levels)
        .filter((val) => typeof val === 'number')
        .map((level) => this.redisClient.HGETALL(`QUEUE_LEVEL_${level}_INFO`)),
    ]).then(([allQueueInfo, ...levelsQueueInfo]) => {
      const unwrapValue = (val: string | undefined): number =>
        val ? Number(val) : 0;
      return new AllQueueInfo(
        levelsQueueInfo.map(
          (data) =>
            new QueueInfo(
              unwrapValue(data.all),
              unwrapValue(data.light),
              unwrapValue(data.shadow),
            ),
        ),
        unwrapValue(allQueueInfo.all),
        unwrapValue(allQueueInfo.light),
        unwrapValue(allQueueInfo.shadow),
      );
    });
  }

  private updateQueueInfo(
    operation: 'add' | 'subtract',
    player: Player,
    transaction: any,
  ) {
    const incrementValue = operation === 'add' ? 1 : -1;
    const side = player.side === Side.LIGHT ? 'light' : 'shadow';
    transaction.HINCRBY(REDIS_KEYS.QUEUE_INFO, 'all', incrementValue);
    transaction.HINCRBY(REDIS_KEYS.QUEUE_INFO, side, incrementValue);
    transaction.HINCRBY(
      `QUEUE_LEVEL_${player.selectedLevel}_INFO`,
      'all',
      incrementValue,
    );
    transaction.HINCRBY(
      `QUEUE_LEVEL_${player.selectedLevel}_INFO`,
      side,
      incrementValue,
    );
    return transaction;
  }

  async addToQueue(socketId: string, player: Player) {
    const transaction = this.redisClient.MULTI();
    // TODO: Probably a bad idea to use the socketId. I should better use a session id => https://socket.io/docs/v4/client-socket-instance/
    transaction.HSET(socketId, Object.entries(player).flat());
    transaction.RPUSH(REDIS_KEYS.MATCH_MAKING_QUEUE, socketId);
    this.updateQueueInfo('add', player, transaction);
    return transaction.exec();
  }

  async removeFromQueue(
    socketId: string,
    indexToClear: number,
    transaction?: any,
  ) {
    const client = transaction ? transaction : this.redisClient;
    return client.LREM(REDIS_KEYS.MATCH_MAKING_QUEUE, indexToClear, socketId);
  }

  async createGame(
    playerFoundInQueue: PlayerFoundInQueue,
    playerArriving: { socketId: string; player: Player },
  ) {
    const transaction = this.redisClient.MULTI();
    this.removeFromQueue(
      playerFoundInQueue.socketId,
      playerFoundInQueue.indexToClear,
      transaction,
    );
    this.updateQueueInfo('subtract', playerFoundInQueue.player, transaction);
    transaction.HSET(playerFoundInQueue.socketId, [
      'status',
      PlayerStatus.IS_PLAYING,
    ]);
    // store new player data
    transaction.HSET(
      playerArriving.socketId,
      Object.entries(playerArriving.player).flat(),
    );
    return transaction.exec();
  }

  async findMatch(
    data: MatchMakingPayload,
    index: number,
  ): Promise<PlayerFoundInQueue | undefined> {
    const increaseRangeFactor = 5;
    const ids: string[] = await this.redisClient
      .LRANGE(REDIS_KEYS.MATCH_MAKING_QUEUE, index, index + increaseRangeFactor)
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
}
