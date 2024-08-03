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
  // FriendJoinLobbyPayload,
  InviteFriendTokenPayload,
  CreateLobbyPayload,
  Side,
  SocketEventLobby,
  // JoinRandomQueuePayload,
  SocketEventType,
  StartSoloGamePayload,
} from '@benjaminbours/composite-core';
import {
  Configuration,
  DefaultApi,
  GameModeEnum,
} from '@benjaminbours/composite-core-api-client';
// local
import { TemporaryStorageService } from './temporary-storage.service';
import { PlayerState, PlayerStatus, RedisPlayerState } from './PlayerState';
import { SocketGateway } from './socket.gateway';
import ShortUniqueId from 'short-unique-id';
// import {
//   GameDevice,
//   GameMode,
//   GameStatus,
//   PlayerSide,
//   // User,
// } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { ENVIRONMENT } from 'src/environment';

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
export class LobbyGateway {
  constructor(
    private temporaryStorage: TemporaryStorageService,
    private mainGateway: SocketGateway,
  ) {}

  @SubscribeMessage(SocketEventLobby.CREATE_LOBBY)
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
      undefined,
      true,
    );
    this.addSocketToRoom(socket.id, teamRoomName);
    this.mainGateway.server
      .to(socket.id)
      .emit(SocketEventLobby.INVITE_FRIEND_TOKEN, {
        token: inviteToken,
      } as InviteFriendTokenPayload);
  }

  // @SubscribeMessage(SocketEventLobby.FRIEND_JOIN_LOBBY)
  // async handleFriendJoinLobby(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() payload: FriendJoinLobbyPayload,
  // ) {
  //   const socketIdHost = await this.temporaryStorage.getInviteHost(
  //     payload.token,
  //   );
  //   const playerHost = await this.temporaryStorage.getPlayer(socketIdHost);
  //   const hostUser = await (() => {
  //     if (playerHost.userId === undefined) {
  //       return undefined;
  //     }
  //     return this.prismaService.user.findUnique({
  //       where: { id: playerHost.userId },
  //     });
  //   })();
  //   const player = new PlayerState(
  //     PlayerStatus.IS_WAITING_TEAMMATE,
  //     undefined,
  //     undefined,
  //     undefined,
  //     (payload.user as User)?.id || undefined,
  //     undefined,
  //     playerHost.roomName,
  //   );
  //   this.temporaryStorage.setPlayer(
  //     socket.id,
  //     RedisPlayerState.parsePlayerState(player),
  //     undefined,
  //     true,
  //   );
  //   this.addSocketToRoom(socket.id, playerHost.roomName!);
  //   this.mainGateway.emit(socketIdHost, [
  //     SocketEventLobby.FRIEND_JOIN_LOBBY,
  //     payload,
  //   ]);
  //   this.mainGateway.emit(socket.id, [
  //     SocketEventLobby.FRIEND_JOIN_LOBBY,
  //     {
  //       token: payload.token,
  //       user: hostUser,
  //       side: playerHost.side,
  //       level: playerHost.selectedLevel,
  //     },
  //   ]);
  // }

  @SubscribeMessage(SocketEventLobby.SELECT_LEVEL)
  async handleSelectLevel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() level: number | undefined,
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
    socket.to(player.roomName).emit(SocketEventLobby.SELECT_LEVEL, level);
  }

  @SubscribeMessage(SocketEventLobby.SELECT_SIDE)
  async handleSelectSide(
    @ConnectedSocket() socket: Socket,
    @MessageBody() side: Side | undefined,
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
    socket.to(player.roomName).emit(SocketEventLobby.SELECT_SIDE, side);
  }

  detectIfGameCanStart = async (socket: Socket, player: PlayerState) => {
    // find team mate socket id
    const teamMateSocketId = await this.mainGateway.server
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
      player.status === PlayerStatus.IS_READY_TO_PLAY &&
      teamMatePlayer.status === PlayerStatus.IS_READY_TO_PLAY &&
      !Number.isNaN(player.side) &&
      !Number.isNaN(teamMatePlayer.side) &&
      teamMatePlayer.side !== player.side &&
      teamMatePlayer.selectedLevel === player.selectedLevel;
    // !COMING_SOON_LEVELS.includes(player.selectedLevel);

    if (!isTeamReady) {
      return false;
    }

    const players = [
      { player, socketId: socket.id },
      { player: teamMatePlayer, socketId: teamMateSocketId },
    ];

    return players;
  };

  // @SubscribeMessage(SocketEventLobby.READY_TO_PLAY)
  // async handleReadyToStart(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() isReady: boolean,
  // ) {
  //   const player = await this.temporaryStorage.getPlayer(socket.id);

  //   if (!player) {
  //     // TODO: error handling
  //     return;
  //   }
  //   player.status = isReady
  //     ? PlayerStatus.IS_READY_TO_PLAY
  //     : PlayerStatus.IS_WAITING_TEAMMATE;
  //   const players = await this.detectIfGameCanStart(socket, player);
  //   // if the game can't start, store state and send to the room you are ready
  //   if (!players) {
  //     this.temporaryStorage.setPlayer(
  //       socket.id,
  //       RedisPlayerState.parsePlayerState(player),
  //     );
  //     socket.to(player.roomName).emit(SocketEventLobby.READY_TO_PLAY, isReady);
  //     return;
  //   }
  //   this.handlePlayerMatch(players);
  // }

  // @SubscribeMessage(SocketEventLobby.JOIN_RANDOM_QUEUE)
  // async handleJoinRandomQueue(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: JoinRandomQueuePayload,
  // ) {
  //   Logger.log('matchmaking info', socket.id, data);
  //   const playerFound = await this.temporaryStorage.findMatchInQueue(data, 0);
  //   // if no player found, add to queue is not already in queue
  //   if (!playerFound) {
  //     Logger.log('no match');
  //     const isPlayerAlreadyInQueue =
  //       await this.temporaryStorage.checkIfExistInQueue(socket.id);
  //     if (!isPlayerAlreadyInQueue) {
  //       Logger.log('add to queue');
  //       const player = new PlayerState(
  //         PlayerStatus.IS_IN_RANDOM_QUEUE,
  //         data.side,
  //         data.level,
  //         undefined,
  //         data.userId,
  //       );
  //       this.temporaryStorage.addToQueue(socket.id, player);
  //     } else {
  //       Logger.log('already in queue');
  //     }
  //     return;
  //   }

  //   // if player found, remove from queue and create lobby with the 2 players
  //   const teamRoomName = uuid.v4();
  //   playerFound.player.roomName = teamRoomName;
  //   playerFound.player.status = PlayerStatus.IS_WAITING_TEAMMATE;
  //   const players = [
  //     playerFound,
  //     {
  //       socketId: socket.id,
  //       player: new PlayerState(
  //         PlayerStatus.IS_WAITING_TEAMMATE,
  //         data.side,
  //         data.level,
  //         undefined,
  //         data.userId,
  //         undefined,
  //         teamRoomName,
  //       ),
  //     },
  //   ];
  //   await this.temporaryStorage.createLobbyFromRandomQueue(players);
  //   const dbPlayers = await this.prismaService.user.findMany({
  //     where: {
  //       id: {
  //         in: players
  //           .filter((p) => p.player.userId !== undefined)
  //           .map((p) => p.player.userId),
  //       },
  //     },
  //   });
  //   players.forEach(({ socketId }) => {
  //     this.addSocketToRoom(socketId, teamRoomName);
  //   });
  //   this.mainGateway.emit(players[0].socketId, [
  //     SocketEventLobby.FRIEND_JOIN_LOBBY,
  //     {
  //       token: undefined,
  //       user: dbPlayers[1],
  //       side: players[1].player.side,
  //       level: players[1].player.selectedLevel,
  //     },
  //   ]);
  //   this.mainGateway.emit(players[1].socketId, [
  //     SocketEventLobby.FRIEND_JOIN_LOBBY,
  //     {
  //       token: undefined,
  //       user: dbPlayers[0],
  //       side: players[0].player.side,
  //       level: players[0].player.selectedLevel,
  //     },
  //   ]);
  // }

  @SubscribeMessage(SocketEventLobby.START_SOLO_GAME)
  async handleStartSoloGame(
    @MessageBody() data: StartSoloGamePayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const player = new PlayerState(
      PlayerStatus.IS_PLAYING,
      undefined,
      data.level,
      undefined,
      data.userId,
      undefined,
      undefined,
      true,
    );
    Logger.log('create solo game');
    Logger.log('CORE API URL');
    Logger.log(ENVIRONMENT.CORE_API_URL);
    const configuration = new Configuration({
      basePath: ENVIRONMENT.CORE_API_URL,
      accessToken: ENVIRONMENT.CORE_API_ADMIN_TOKEN,
    });
    const coreApiClient = new DefaultApi(configuration);
    const dbGame = await coreApiClient.gamesControllerCreate({
      createGameDto: {
        userId: data.userId,
        region: 'LOCAL', // TODO: Get dynamic value
        levelId: data.level,
        mode: GameModeEnum.SinglePlayer,
        deviceType: 'DESKTOP', // TODO: Get dynamic value
      },
    });
    // TODO: Add error handler

    Logger.log(`GAME ID: ${dbGame.id}`);
    const gameRoomName = String(dbGame.id);
    player.gameId = dbGame.id;
    this.addSocketToRoom(socket.id, gameRoomName);
    this.temporaryStorage.setPlayer(
      socket.id,
      RedisPlayerState.parsePlayerState(player),
    );
    const initialGameState = await this.mainGateway.createGame(
      [{ socketId: socket.id, player }],
      dbGame.id,
      dbGame.level!,
    );
    this.mainGateway.emit(gameRoomName, [
      SocketEventType.GAME_START,
      {
        gameState: initialGameState,
        lastInputs: [undefined, undefined],
      },
    ]);
  }

  // handlePlayerMatch = async (
  //   players: { socketId: string; player: PlayerState; indexToClear?: number }[],
  // ) => {
  //   Logger.log('create game');
  //   const dbGame = await this.prismaService.game.create({
  //     data: {
  //       levelId: players[0].player.selectedLevel,
  //       status: GameStatus.STARTED,
  //       mode: GameMode.MULTI_PLAYER,
  //       startTime: 0,
  //       // TODO: detect device for multiplayer game
  //       device: GameDevice.DESKTOP,
  //       duration: 0,
  //       players: {
  //         create: players
  //           .filter((p) => p.player.userId !== undefined)
  //           .map((p) => ({
  //             side:
  //               p.player.side === Side.LIGHT
  //                 ? PlayerSide.LIGHT
  //                 : PlayerSide.SHADOW,
  //             userId: p.player.userId,
  //           })),
  //       },
  //     },
  //   });
  //   Logger.log(`GAME ID: ${dbGame.id}`);
  //   const gameRoomName = String(dbGame.id);
  //   players.forEach(({ player, socketId }) => {
  //     // mutations
  //     player.status = PlayerStatus.IS_PLAYING;
  //     player.gameId = dbGame.id;
  //     this.addSocketToRoom(socketId, gameRoomName);
  //   });
  //   const initialGameState = await this.mainGateway.createGame(
  //     players,
  //     dbGame.id,
  //   );
  //   this.mainGateway.emit(gameRoomName, [
  //     SocketEventType.GAME_START,
  //     {
  //       gameState: initialGameState,
  //       lastInputs: [undefined, undefined],
  //     },
  //   ]);
  // };

  addSocketToRoom(socketId: string, room: string) {
    const socket = this.mainGateway.server.sockets.sockets.get(socketId);
    // deepcode ignore PureMethodReturnValueIgnored: it's not join from array, it's join from socket
    socket.join(room);
  }
}
