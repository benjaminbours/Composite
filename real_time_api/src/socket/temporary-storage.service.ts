// vendors
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
// our libs
import {
  GamePlayerInputPayload,
  GameState,
  JoinRandomQueuePayload,
  RedisGameState,
  Side,
} from '@benjaminbours/composite-core';
// local
import { PlayerState, RedisPlayerState, PlayerStatus } from './PlayerState';

const REDIS_KEYS = {
  // List
  MATCH_MAKING_QUEUE: 'MATCH_MAKING_QUEUE',
  // List
  PLAYER_LIST: 'PLAYER_LIST',
  // Hash map
  INVITE_TOKEN_MAP: 'INVITE_TOKEN_MAP',
  // Hash map
  QUEUE_INFO: 'QUEUE_INFO',
  // Hash map
  QUEUE_LEVEL_INFO: (level: number | string) => `QUEUE_LEVEL_${level}_INFO`,
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
  public redisClient: RedisClientType;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    if ((this.cacheManager.store as unknown as RedisStore).getClient) {
      this.redisClient = (
        this.cacheManager.store as unknown as RedisStore
      ).getClient();
    }
  }

  // players
  async setPlayer(
    socketId: string,
    data: Partial<RedisPlayerState>,
    transaction?: any,
    isCreate = false,
  ) {
    if (transaction) {
      if (isCreate) {
        transaction.RPUSH(REDIS_KEYS.PLAYER_LIST, socketId);
      }
      transaction.HSET(
        REDIS_KEYS.PLAYER(socketId),
        Object.entries(data)
          .filter(([, value]) => value !== undefined)
          .flat(),
      );
    } else {
      const transac = this.redisClient.MULTI();
      if (isCreate) {
        transac.RPUSH(REDIS_KEYS.PLAYER_LIST, socketId);
      }
      transac.HSET(
        REDIS_KEYS.PLAYER(socketId),
        Object.entries(data)
          .filter(([, value]) => value !== undefined)
          .flat(),
      );
      return transac.exec();
    }
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
    transaction.LREM(REDIS_KEYS.PLAYER_LIST, 1, socketId);
    if (player.status === PlayerStatus.IS_IN_RANDOM_QUEUE) {
      this.removeFromQueue(socketId, 0, transaction);
      this.updateQueueInfo('subtract', player, transaction);
    }
    transaction.exec();
  }

  async checkIfExistInQueue(socketId: string) {
    const res = await this.redisClient.LPOS(
      REDIS_KEYS.MATCH_MAKING_QUEUE,
      socketId,
    );
    return res === null ? false : true;
  }

  // match making queue
  async addToQueue(socketId: string, player: PlayerState) {
    const transaction = this.redisClient.MULTI();
    // TODO: Probably a bad idea to use the socketId. I should better use a session id => https://socket.io/docs/v4/client-socket-instance/
    console.log(socketId, player);
    this.setPlayer(
      socketId,
      RedisPlayerState.parsePlayerState(player),
      transaction,
      true,
    );
    transaction.RPUSH(REDIS_KEYS.MATCH_MAKING_QUEUE, socketId);
    this.updateQueueInfo('add', player, transaction);
    return transaction.exec();
  }

  async getServerInfo(): Promise<any> {
    return this.redisClient
      .LRANGE(REDIS_KEYS.PLAYER_LIST, 0, -1)
      .then((playerList) => {
        return Promise.all(playerList.map((id) => this.getPlayer(id)));
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
    data: JoinRandomQueuePayload,
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
      if (!player) {
        continue;
      }
      console.log('id processing', id);
      console.log('data retrieved', player);
      console.log('data retrieved', player.selectedLevel);

      const isSameLevel = data.level === Number(player.selectedLevel);
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

  async getInviteHost(token: string) {
    return this.redisClient.HGET(REDIS_KEYS.INVITE_TOKEN_MAP, token);
  }

  async deleteInviteToken(token: string) {
    return this.redisClient.HDEL(REDIS_KEYS.INVITE_TOKEN_MAP, token);
  }

  async createLobbyFromRandomQueue(
    players: { socketId: string; player: PlayerState; indexToClear?: number }[],
  ) {
    const transaction = this.redisClient.MULTI();
    players.forEach(({ socketId, player, indexToClear }) => {
      if (indexToClear !== undefined) {
        this.removeFromQueue(socketId, indexToClear, transaction);
        this.updateQueueInfo('subtract', player, transaction);
      }
      this.setPlayer(
        socketId,
        RedisPlayerState.parsePlayerState(player),
        transaction,
        indexToClear === undefined,
      );
    });
    return transaction.exec();
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
      this.setPlayer(
        socketId,
        RedisPlayerState.parsePlayerState(player),
        transaction,
      );
    });
    // store initial game data
    transaction.HSET(
      REDIS_KEYS.GAME(gameId),
      Object.entries(GameState.parseToRedisGameState(gameState))
        .filter(([, value]) => value !== undefined)
        .flat(),
    );
    return transaction.exec();
  }

  async getGameState(gameId: number): Promise<GameState> {
    return this.redisClient
      .HGETALL(REDIS_KEYS.GAME(gameId))
      .then((state) =>
        GameState.parseFromRedisGameState(state as unknown as RedisGameState),
      );
  }

  async updateGameStateAndInputsQueue(gameId: number, state: GameState) {
    const transaction = this.redisClient.MULTI();
    transaction.HSET(
      REDIS_KEYS.GAME(gameId),
      Object.entries(GameState.parseToRedisGameState(state))
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
      value: `${data.player}:${data.inputs.left},${data.inputs.right},${data.inputs.jump},${data.inputs.top},${data.inputs.bottom},${data.inputs.resetPosition}:${data.sequence}:${data.time}`,
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
