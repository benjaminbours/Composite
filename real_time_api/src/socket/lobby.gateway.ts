// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
// import * as uuid from 'uuid';
// our libs
import {
  // FriendJoinLobbyPayload,
  // InviteFriendTokenPayload,
  // CreateLobbyPayload,
  // Side,
  SocketEventLobby,
  // JoinRandomQueuePayload,
  // SocketEventType,
  CreateGamePayload,
  GamePlayerCount,
} from '@benjaminbours/composite-core';
import {
  Configuration,
  DefaultApi,
  Game,
  GameModeEnum,
} from '@benjaminbours/composite-core-api-client';
// local
import { TemporaryStorageService } from './temporary-storage.service';
import { PlayerState, PlayerStatus, RedisPlayerState } from './PlayerState';
import { SocketGateway } from './socket.gateway';
// import ShortUniqueId from 'short-unique-id';
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

  // @SubscribeMessage(SocketEventLobby.CREATE_LOBBY)
  // async handleCreateLobby(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() payload: CreateLobbyPayload,
  // ) {
  //   const inviteToken = new ShortUniqueId({ length: 6 }).rnd();
  //   const teamRoomName = uuid.v4();
  //   await this.temporaryStorage.storeInviteToken(inviteToken, socket.id);
  //   const player = new PlayerState(
  //     PlayerStatus.IS_WAITING_TEAMMATE,
  //     payload.side,
  //     payload.level,
  //     inviteToken,
  //     payload.userId,
  //     undefined,
  //     teamRoomName,
  //   );
  //   await this.temporaryStorage.setPlayer(
  //     socket.id,
  //     RedisPlayerState.parsePlayerState(player),
  //     undefined,
  //     true,
  //   );
  //   this.addSocketToRoom(socket.id, teamRoomName);
  //   this.mainGateway.server
  //     .to(socket.id)
  //     .emit(SocketEventLobby.INVITE_FRIEND_TOKEN, {
  //       token: inviteToken,
  //     } as InviteFriendTokenPayload);
  // }

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

  // @SubscribeMessage(SocketEventLobby.SELECT_LEVEL)
  // async handleSelectLevel(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() level: number | undefined,
  // ) {
  //   const player = await this.temporaryStorage.getPlayer(socket.id);

  //   if (!player) {
  //     // TODO: error handling
  //     return;
  //   }
  //   player.status = PlayerStatus.IS_WAITING_TEAMMATE;
  //   player.selectedLevel = level;
  //   this.temporaryStorage.setPlayer(
  //     socket.id,
  //     RedisPlayerState.parsePlayerState(player),
  //   );
  //   socket.to(player.roomName).emit(SocketEventLobby.SELECT_LEVEL, level);
  // }

  // @SubscribeMessage(SocketEventLobby.SELECT_SIDE)
  // async handleSelectSide(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() side: Side | undefined,
  // ) {
  //   const player = await this.temporaryStorage.getPlayer(socket.id);

  //   if (!player) {
  //     // TODO: error handling
  //     return;
  //   }
  //   player.status = PlayerStatus.IS_WAITING_TEAMMATE;
  //   player.side = side;
  //   this.temporaryStorage.setPlayer(
  //     socket.id,
  //     RedisPlayerState.parsePlayerState(player),
  //   );
  //   socket.to(player.roomName).emit(SocketEventLobby.SELECT_SIDE, side);
  // }

  // detectIfGameCanStart = async (socket: Socket, player: PlayerState) => {
  //   // find team mate socket id
  //   const teamMateSocketId = await this.mainGateway.server
  //     .in(String(player.roomName))
  //     .fetchSockets()
  //     .then((sockets) => {
  //       const teamMate = sockets.find(({ id }) => id !== socket.id);
  //       return teamMate?.id || undefined;
  //     });

  //   if (!teamMateSocketId) {
  //     return false;
  //   }

  //   // find team mate player state
  //   const teamMatePlayer =
  //     await this.temporaryStorage.getPlayer(teamMateSocketId);

  //   const isTeamReady =
  //     player.status === PlayerStatus.IS_READY_TO_PLAY &&
  //     teamMatePlayer.status === PlayerStatus.IS_READY_TO_PLAY &&
  //     !Number.isNaN(player.side) &&
  //     !Number.isNaN(teamMatePlayer.side) &&
  //     teamMatePlayer.side !== player.side &&
  //     teamMatePlayer.selectedLevel === player.selectedLevel;
  //   // !COMING_SOON_LEVELS.includes(player.selectedLevel);

  //   if (!isTeamReady) {
  //     return false;
  //   }

  //   const players = [
  //     { player, socketId: socket.id },
  //     { player: teamMatePlayer, socketId: teamMateSocketId },
  //   ];

  //   return players;
  // };

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

  // a game should be created in the database when the game is about to start
  // if it's a duo game, it has to wait for the second player to join the room
  private createGameInDB = async (data: CreateGamePayload) => {
    Logger.log('create game in DB');
    const configuration = new Configuration({
      basePath: ENVIRONMENT.CORE_API_URL,
      accessToken: ENVIRONMENT.CORE_API_ADMIN_TOKEN,
    });
    const coreApiClient = new DefaultApi(configuration);
    return coreApiClient
      .gamesControllerCreate({
        createGameDto: {
          userId: data.userId,
          region: data.region,
          levelId: data.level,
          mode:
            data.playerCount === GamePlayerCount.SOLO
              ? GameModeEnum.SinglePlayer
              : GameModeEnum.MultiPlayer,
          deviceType: data.device === 'desktop' ? 'DESKTOP' : 'MOBILE',
        },
      })
      .then((game) => {
        Logger.log(`GAME ID: ${game.id}`);
        return game;
      })
      .catch((error) => {
        Logger.error(error);
        throw Error("Couldn't create game in database");
      });
  };

  private createPlayer = async (
    socketId: string,
    data: CreateGamePayload,
    game?: Game,
  ) => {
    const player = new PlayerState(
      data.playerCount === GamePlayerCount.SOLO
        ? PlayerStatus.IS_PLAYING
        : PlayerStatus.IS_WAITING_TEAMMATE,
      data.side,
      data.level,
      undefined,
      data.userId,
      game?.id || undefined,
      data.roomId, // roomId is related to hathora roomId
      data.playerCount === GamePlayerCount.SOLO,
    );
    if (game) {
      const gameRoomName = String(game.id);
      this.addSocketToRoom(socketId, gameRoomName);
    }
    this.addSocketToRoom(socketId, data.roomId);
    await this.temporaryStorage.setPlayer(
      socketId,
      RedisPlayerState.parsePlayerState(player),
    );
    return { game, players: [{ player, socketId }] };
  };

  @SubscribeMessage(SocketEventLobby.CREATE_GAME)
  async handleCreateGame(
    @MessageBody() data: CreateGamePayload,
    @ConnectedSocket() socket: Socket,
  ) {
    Logger.log('create game');

    if (data.playerCount === GamePlayerCount.SOLO) {
      // sequence for solo
      this.createGameInDB(data)
        .then((game) => this.createPlayer(socket.id, data, game))
        .then(this.mainGateway.createGameLoop);
      return;
    }

    // sequence for duo
    this.createPlayer(socket.id, data);
  }

  @SubscribeMessage(SocketEventLobby.JOIN_GAME)
  async handleJoinGame(
    @MessageBody() data: CreateGamePayload,
    @ConnectedSocket() socket: Socket,
  ) {
    Logger.log('join game');

    const getCreatorPlayer = async (game: Game) => {
      const socketsInRoom = await this.mainGateway.server
        .in(data.roomId)
        .fetchSockets();

      // socketsInRoom
      console.log('socketsInRoom length', socketsInRoom.length);

      const socketIdsInRoom = socketsInRoom.map((socket) => socket.id);
      Logger.log(
        `Socket IDs in room ${data.roomId}: ${socketIdsInRoom.join(', ')}`,
      );

      const creatorSocketId = socketsInRoom[0].id;
      const creatorPlayer =
        await this.temporaryStorage.getPlayer(creatorSocketId);

      if (!creatorPlayer) {
        // Logger.error('Player not found');
        throw Error('Player no found');
      }

      return { creatorSocketId, game, creatorPlayer };
    };

    const updateCreatorPlayerState = async (data: {
      creatorSocketId: string;
      creatorPlayer: PlayerState;
      game: Game;
    }) => {
      const { creatorPlayer, game } = data;
      creatorPlayer.status = PlayerStatus.IS_PLAYING;
      creatorPlayer.gameId = game.id;
      const gameRoomName = String(game.id);
      this.addSocketToRoom(data.creatorSocketId, gameRoomName);
      await this.temporaryStorage.setPlayer(
        socket.id,
        RedisPlayerState.parsePlayerState(creatorPlayer),
      );
      return data;
    };

    this.createGameInDB(data)
      .then(getCreatorPlayer)
      .then(updateCreatorPlayerState)
      .then(async ({ game, creatorPlayer, creatorSocketId }) => {
        const { players } = await this.createPlayer(socket.id, data, game);
        players.push({ socketId: creatorSocketId, player: creatorPlayer });
        this.mainGateway.createGameLoop({ players, game });
      });
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
