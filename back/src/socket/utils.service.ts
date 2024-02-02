import type { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
// our libs
// local
import { TemporaryStorageService } from '../temporary-storage.service';
import { PlayerState, PlayerStatus } from 'src/PlayerState';
import { SocketService } from './socket.service';
import { Levels } from '@benjaminbours/composite-core';

const COMING_SOON_LEVELS = [Levels.THE_HIGH_SPHERES];

@Injectable()
export class UtilsService {
  constructor(
    private temporaryStorage: TemporaryStorageService,
    private socketService: SocketService,
  ) {}

  detectIfGameCanStart = async (socket: Socket, player: PlayerState) => {
    // find team mate socket id
    const teamMateSocketId = await this.socketService.socket
      .in(String(player.roomName))
      .fetchSockets()
      .then((sockets) => {
        const teamMate = sockets.find(({ id }) => id !== socket.id);
        return teamMate?.id || undefined;
      });

    if (!teamMateSocketId) {
      return false;
    }

    // find team mate player state
    const teamMatePlayer =
      await this.temporaryStorage.getPlayer(teamMateSocketId);

    const isTeamReady =
      teamMatePlayer.status === PlayerStatus.IS_WAITING_TEAMMATE &&
      !Number.isNaN(player.side) &&
      !Number.isNaN(teamMatePlayer.side) &&
      teamMatePlayer.side !== player.side &&
      teamMatePlayer.selectedLevel === player.selectedLevel &&
      !COMING_SOON_LEVELS.includes(player.selectedLevel);

    if (!isTeamReady) {
      return false;
    }

    const players = [
      { player, socketId: socket.id },
      { player: teamMatePlayer, socketId: teamMateSocketId },
    ];

    return players;
  };
}
