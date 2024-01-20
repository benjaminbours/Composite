// vendors
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
// our libs
import {
  AllQueueInfo,
  GamePlayerInputPayload,
  GameState,
  Levels,
  MatchMakingPayload,
  QueueInfo,
  RedisGameState,
  Side,
} from '@benjaminbours/composite-core';
// local
import { PlayerState, RedisPlayerState, PlayerStatus } from './PlayerState';

const REDIS_KEYS = {
  // List
  MATCH_MAKING_QUEUE: 'MATCH_MAKING_QUEUE',
  // Hash map
  INVITE_TOKEN_MAP: 'INVITE_TOKEN_MAP',
  // Hash map
  QUEUE_INFO: 'QUEUE_INFO',
  // Hash map
  QUEUE_LEVEL_INFO: (level: Levels | string) => `QUEUE_LEVEL_${level}_INFO`,
  // Hash map
  PLAYER: (socketId: string) => socketId,
  // Hash map
  GAME: (gameId: number | string) => `game_${gameId}`,
  // Sorted set
  GAME_INPUTS_QUEUE: (gameId: number | string) => `game_${gameId}:inputs`,
};

export interface PlayerFoundInQueue {
  socketId: string;
  player: PlayerState;
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

  // players
  async setPlayer(
    socketId: string,
    data: Partial<RedisPlayerState>,
    transaction?: any,
  ) {
    const client = transaction ? transaction : this.redisClient;
    return client.HSET(socketId, Object.entries(data).flat());
  }

  async getPlayer(socketId: string): Promise<PlayerState | undefined> {
    return this.redisClient.HGETALL(REDIS_KEYS.PLAYER(socketId)).then((res) => {
      const redisPlayerState = res as unknown as RedisPlayerState;
      if (!redisPlayerState.status) {
        return undefined;
      }
      return PlayerState.parseRedisPlayerState(redisPlayerState);
    });
  }

  async removePlayer(socketId: string, player: PlayerState) {
    const transaction = this.redisClient.MULTI();
    transaction.DEL(REDIS_KEYS.PLAYER(socketId));
    if (player.status === PlayerStatus.IS_IN_QUEUE) {
      this.removeFromQueue(socketId, 0, transaction);
      this.updateQueueInfo('subtract', player, transaction);
    }
    transaction.exec();
  }

  // match making queue
  async addToQueue(socketId: string, player: PlayerState) {
    const transaction = this.redisClient.MULTI();
    // TODO: Probably a bad idea to use the socketId. I should better use a session id => https://socket.io/docs/v4/client-socket-instance/
    console.log(socketId, player);

    transaction.HSET(
      socketId,
      Object.entries(RedisPlayerState.parsePlayerState(player))
        .filter(([, value]) => value !== undefined)
        .flat(),
    );
    transaction.RPUSH(REDIS_KEYS.MATCH_MAKING_QUEUE, socketId);
    this.updateQueueInfo('add', player, transaction);
    return transaction.exec();
  }

  async getQueueInfo(): Promise<AllQueueInfo> {
    return Promise.all([
      this.redisClient.HGETALL(REDIS_KEYS.QUEUE_INFO),
      ...Object.values(Levels)
        .filter((val) => typeof val === 'number')
        .map((level) =>
          this.redisClient.HGETALL(REDIS_KEYS.QUEUE_LEVEL_INFO(level)),
        ),
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
    player: PlayerState,
    transaction: any,
  ) {
    const incrementValue = operation === 'add' ? 1 : -1;
    const side = player.side === Side.LIGHT ? 'light' : 'shadow';
    transaction.HINCRBY(REDIS_KEYS.QUEUE_INFO, 'all', incrementValue);
    transaction.HINCRBY(REDIS_KEYS.QUEUE_INFO, side, incrementValue);
    transaction.HINCRBY(
      REDIS_KEYS.QUEUE_LEVEL_INFO(player.selectedLevel),
      'all',
      incrementValue,
    );
    transaction.HINCRBY(
      REDIS_KEYS.QUEUE_LEVEL_INFO(player.selectedLevel),
      side,
      incrementValue,
    );
    return transaction;
  }

  async removeFromQueue(
    socketId: string,
    indexToClear: number,
    transaction?: any,
  ) {
    const client = transaction ? transaction : this.redisClient;
    return client.LREM(REDIS_KEYS.MATCH_MAKING_QUEUE, indexToClear, socketId);
  }

  async findMatchInQueue(
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

    // TODO: Loop can be optimized
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

    return this.findMatchInQueue(data, index + increaseRangeFactor);
  }

  async storeInviteToken(token: string, socketId: string) {
    // store in the invite token map, the token is the key and the value is the emitter of the invite request
    return this.redisClient.HSET(REDIS_KEYS.INVITE_TOKEN_MAP, token, socketId);
  }

  async getInviteEmitter(token: string) {
    return this.redisClient.HGET(REDIS_KEYS.INVITE_TOKEN_MAP, token);
  }

  // games
  async createGame(
    players: { socketId: string; player: PlayerState; indexToClear?: number }[],
    gameId: number,
    gameState: GameState,
  ) {
    const transaction = this.redisClient.MULTI();
    players.forEach(({ socketId, player, indexToClear }) => {
      if (indexToClear !== undefined) {
        this.removeFromQueue(socketId, indexToClear, transaction);
        this.updateQueueInfo('subtract', player, transaction);
      }
      transaction.HSET(
        REDIS_KEYS.PLAYER(socketId),
        Object.entries(RedisPlayerState.parsePlayerState(player))
          .filter(([, value]) => value !== undefined)
          .flat(),
      );
    });
    // store initial game data
    transaction.HSET(
      REDIS_KEYS.GAME(gameId),
      Object.entries(RedisGameState.parseGameState(gameState))
        .filter(([, value]) => value !== undefined)
        .flat(),
    );
    return transaction.exec();
  }

  async getGameState(gameId: number): Promise<GameState> {
    return this.redisClient
      .HGETALL(REDIS_KEYS.GAME(gameId))
      .then((state) =>
        GameState.parseRedisGameState(state as unknown as RedisGameState),
      );
  }

  async updateGameStateAndInputsQueue(gameId: number, state: GameState) {
    const transaction = this.redisClient.MULTI();
    transaction.HSET(
      REDIS_KEYS.GAME(gameId),
      Object.entries(RedisGameState.parseGameState(state))
        .filter(([, value]) => value !== undefined)
        .flat(),
    );
    transaction.ZREMRANGEBYSCORE(
      REDIS_KEYS.GAME_INPUTS_QUEUE(gameId),
      -Infinity,
      state.lastValidatedInput,
    );
    return transaction.exec();
  }

  // game inputs queue

  async addToGameInputsQueue(gameId: number, data: GamePlayerInputPayload) {
    return this.redisClient.ZADD(REDIS_KEYS.GAME_INPUTS_QUEUE(gameId), {
      score: data.sequence,
      // input pattern is left,right,jump
      value: `${data.player}:${data.inputs.left},${data.inputs.right},${data.inputs.jump},${data.inputs.top},${data.inputs.bottom}:${data.sequence}:${data.time}`,
    });
  }

  async getGameInputsQueue(gameId: number) {
    return this.redisClient.ZRANGEBYSCORE(
      REDIS_KEYS.GAME_INPUTS_QUEUE(gameId),
      -Infinity,
      Infinity,
    );
  }
}
