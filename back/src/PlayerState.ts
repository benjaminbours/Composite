import type { Side } from '@benjaminbours/composite-core';

export enum PlayerStatus {
  IS_PLAYING,
  IS_IN_QUEUE,
  IS_WAITING_TEAMMATE,
  IS_PENDING,
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
  ) {}

  static parsePlayerState(state: PlayerState) {
    return new RedisPlayerState(
      String(state.status),
      String(state.side),
      String(state.selectedLevel),
      state.inviteToken ? String(state.inviteToken) : undefined,
      state.userId ? String(state.userId) : undefined,
      state.gameId ? String(state.gameId) : undefined,
      state.roomName,
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
  ) {}

  static parseRedisPlayerState(state: RedisPlayerState) {
    return new PlayerState(
      Number(state.status) as PlayerStatus,
      Number(state.side) as Side,
      Number(state.selectedLevel),
      state.inviteToken,
      Number(state.userId),
      Number(state.gameId),
      state.roomName,
    );
  }
}
