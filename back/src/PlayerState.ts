import { Levels, Side } from '@benjaminbours/composite-core';

export enum PlayerStatus {
  IS_PLAYING,
  IS_PENDING,
}

export class RedisPlayerState {
  constructor(
    public status: string,
    public side: string,
    public selectedLevel: string,
    public gameId?: string,
    public roomName?: string,
  ) {}

  static parsePlayerState(state: PlayerState) {
    return new RedisPlayerState(
      String(state.status),
      String(state.side),
      String(state.selectedLevel),
      state.gameId ? String(state.gameId) : undefined,
      state.roomName,
    );
  }
}

export class PlayerState {
  /**
   * key use with redis to store game state (the name of the room with socket io)
   */
  constructor(
    public status: PlayerStatus,
    public side: Side,
    public selectedLevel: Levels, // public gameId?: number,
    public gameId?: number,
    public roomName?: string,
  ) {}

  static parseRedisPlayerState(state: RedisPlayerState) {
    return new PlayerState(
      Number(state.status) as PlayerStatus,
      Number(state.side) as Side,
      Number(state.selectedLevel) as Levels,
      Number(state.gameId),
      state.roomName,
    );
  }
}
