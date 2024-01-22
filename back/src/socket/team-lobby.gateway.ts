// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
// our libs
import {
  Levels,
  Side,
  SocketEventTeamLobby,
} from '@benjaminbours/composite-core';
// local
import { TemporaryStorageService } from '../temporary-storage.service';
import { RedisPlayerState } from 'src/PlayerState';
import { SocketGateway } from './socket.gateway';
import { UtilsService } from './utils.service';

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
export class TeamLobbyGateway {
  constructor(
    private temporaryStorage: TemporaryStorageService,
    private utils: UtilsService,
    private mainGateway: SocketGateway,
  ) {}

  @SubscribeMessage(SocketEventTeamLobby.SELECT_LEVEL)
  async handleSelectLevel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() level: Levels,
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);

    if (!player) {
      // TODO: error handling
      return;
    }
    player.selectedLevel = level;
    this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    socket.to(player.roomName).emit(SocketEventTeamLobby.SELECT_LEVEL, level);

    const players = await this.utils.detectIfGameCanStart(socket, player);

    if (!players) {
      return;
    }
    this.mainGateway.handlePlayerMatch(players);
  }

  @SubscribeMessage(SocketEventTeamLobby.SELECT_SIDE)
  async handleSelectSide(
    @ConnectedSocket() socket: Socket,
    @MessageBody() side: Side,
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);

    if (!player) {
      // TODO: error handling
      return;
    }
    player.side = side;
    this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    socket.to(player.roomName).emit(SocketEventTeamLobby.SELECT_SIDE, side);

    const players = await this.utils.detectIfGameCanStart(socket, player);

    if (!players) {
      return;
    }

    this.mainGateway.handlePlayerMatch(players);
  }
}
