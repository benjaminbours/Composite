// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import * as uuid from 'uuid';
// our libs
import {
  FriendJoinLobbyPayload,
  InviteFriendTokenPayload,
  CreateLobbyPayload,
  Side,
  SocketEventTeamLobby,
} from '@benjaminbours/composite-core';
// local
import { TemporaryStorageService } from '../temporary-storage.service';
import { PlayerState, PlayerStatus, RedisPlayerState } from '../PlayerState';
import { SocketGateway } from './socket.gateway';
import { UtilsService } from './utils.service';
import ShortUniqueId from 'short-unique-id';
import { PrismaService } from '@project-common/services';
import { User } from '@prisma/client';

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
    private prismaService: PrismaService,
    private temporaryStorage: TemporaryStorageService,
    private utils: UtilsService,
    private mainGateway: SocketGateway,
  ) {}

  @SubscribeMessage(SocketEventTeamLobby.CREATE_LOBBY)
  async handleCreateLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CreateLobbyPayload,
  ) {
    const inviteToken = new ShortUniqueId({ length: 6 }).rnd();
    const teamRoomName = uuid.v4();
    await this.temporaryStorage.storeInviteToken(inviteToken, socket.id);
    const player = new PlayerState(
      PlayerStatus.IS_WAITING_TEAMMATE,
      payload.side,
      payload.level,
      inviteToken,
      payload.userId,
      undefined,
      teamRoomName,
    );
    await this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    this.mainGateway.addSocketToRoom(socket.id, teamRoomName);
    this.mainGateway.server
      .to(socket.id)
      .emit(SocketEventTeamLobby.INVITE_FRIEND_TOKEN, {
        token: inviteToken,
      } as InviteFriendTokenPayload);
  }

  @SubscribeMessage(SocketEventTeamLobby.FRIEND_JOIN_LOBBY)
  async handleFriendJoinLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: FriendJoinLobbyPayload,
  ) {
    const socketIdHost = await this.temporaryStorage.getInviteHost(
      payload.token,
    );
    const playerHost = await this.temporaryStorage.getPlayer(socketIdHost);
    const hostUser = await (() => {
      if (playerHost.userId === undefined) {
        return undefined;
      }
      return this.prismaService.user.findUnique({
        where: { id: playerHost.userId },
      });
    })();
    const player = new PlayerState(
      PlayerStatus.IS_WAITING_TEAMMATE,
      undefined,
      undefined,
      undefined,
      (payload.user as User)?.id || undefined,
      undefined,
      playerHost.roomName,
    );
    this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    this.mainGateway.addSocketToRoom(socket.id, playerHost.roomName!);
    this.mainGateway.emit(socketIdHost, [
      SocketEventTeamLobby.FRIEND_JOIN_LOBBY,
      payload,
    ]);
    this.mainGateway.emit(socket.id, [
      SocketEventTeamLobby.FRIEND_JOIN_LOBBY,
      {
        token: payload.token,
        user: hostUser,
        side: playerHost.side,
        level: playerHost.selectedLevel,
      },
    ]);
  }

  @SubscribeMessage(SocketEventTeamLobby.SELECT_LEVEL)
  async handleSelectLevel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() level: number,
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);

    if (!player) {
      // TODO: error handling
      return;
    }
    player.status = PlayerStatus.IS_WAITING_TEAMMATE;
    player.selectedLevel = level;
    this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    socket.to(player.roomName).emit(SocketEventTeamLobby.SELECT_LEVEL, level);
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
    player.status = PlayerStatus.IS_WAITING_TEAMMATE;
    player.side = side;
    this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    socket.to(player.roomName).emit(SocketEventTeamLobby.SELECT_SIDE, side);
  }

  @SubscribeMessage(SocketEventTeamLobby.READY_TO_PLAY)
  async handleReadyToStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() isReady: boolean,
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);

    if (!player) {
      // TODO: error handling
      return;
    }
    player.status = isReady
      ? PlayerStatus.IS_READY_TO_PLAY
      : PlayerStatus.IS_WAITING_TEAMMATE;
    const players = await this.utils.detectIfGameCanStart(socket, player);
    // if the game can't start, store state and send to the room you are ready
    if (!players) {
      this.temporaryStorage.setPlayer(
        socket.id,
        RedisPlayerState.parsePlayerState(player),
      );
      socket
        .to(player.roomName)
        .emit(SocketEventTeamLobby.READY_TO_PLAY, isReady);
      return;
    }
    this.mainGateway.handlePlayerMatch(players);
  }
}
