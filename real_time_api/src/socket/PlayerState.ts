import type { Side } from '@benjaminbours/composite-core';

export enum PlayerStatus {
  IS_PLAYING,
  IS_IN_RANDOM_QUEUE,
  IS_READY_TO_PLAY,
  IS_WAITING_TEAMMATE,
}

export class RedisPlayerState {
  constructor(
    public status: string,
    public side: string,
    public selectedLevel: string,
    public inviteToken?: string,
    public userId?: string,
    /**
     * its also the name of the game instance room
     */
    public gameId?: string,
    /**
     * Team room name
     */
    public roomName?: string,
    public isSolo?: string,
    public averageRTT?: string,
  ) {}

  static parsePlayerState(state: PlayerState) {
    return new RedisPlayerState(
      String(state.status),
      state.side !== undefined ? String(state.side) : undefined,
      state.selectedLevel ? String(state.selectedLevel) : undefined,
      state.inviteToken,
      state.userId ? String(state.userId) : undefined,
      state.gameId ? String(state.gameId) : undefined,
      state.roomName,
      state.isSolo ? String(state.isSolo) : undefined,
      state.averageRtt ? String(state.averageRtt) : undefined,
    );
  }
}

export class PlayerState {
  constructor(
    public status: PlayerStatus,
    public side?: Side,
    public selectedLevel?: number,
    public inviteToken?: string,
    public userId?: number,
    /**
     * key use with redis to store game state (the name of the room with socket io)
     */
    public gameId?: number,
    public roomName?: string,
    public isSolo?: boolean,
    public averageRtt?: number,
  ) {}

  static parseRedisPlayerState(state: RedisPlayerState) {
    return new PlayerState(
      Number(state.status) as PlayerStatus,
      state.side !== undefined ? (Number(state.side) as Side) : undefined,
      state.selectedLevel ? Number(state.selectedLevel) : undefined,
      state.inviteToken,
      state.userId ? Number(state.userId) : undefined,
      state.gameId ? Number(state.gameId) : undefined,
      state.roomName,
      state.isSolo ? true : undefined,
      state.averageRTT ? Number(state.averageRTT) : undefined,
    );
  }
}
