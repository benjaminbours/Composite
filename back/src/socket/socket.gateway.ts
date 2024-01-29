// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as uuid from 'uuid';
import ShortUniqueId from 'short-unique-id';
// our libs
import {
  SocketEventType,
  MatchMakingPayload,
  Levels,
  GamePlayerInputPayload,
  Side,
  SocketEvent,
  MovableComponentState,
  CrackTheDoorLevel,
  LearnToFlyLevel,
  FLOOR,
  TimeSyncPayload,
  PhysicSimulation,
  applyInputListToSimulation,
  Context,
  updateServerBounces,
  GameState,
  collectInputsForTick,
  InviteFriendTokenPayload,
  AbstractLevel,
} from '@benjaminbours/composite-core';
// local
import { TemporaryStorageService } from '../temporary-storage.service';
import { PlayerState, PlayerStatus, RedisPlayerState } from 'src/PlayerState';
import { GameStatus, Level } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UtilsService } from './utils.service';
import { SocketService } from './socket.service';

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
@Injectable()
export class SocketGateway {
  private gameLoopsRegistry: Record<string, NodeJS.Timeout> = {};
  @WebSocketServer() server: Server;

  constructor(
    private prismaService: PrismaService,
    private temporaryStorage: TemporaryStorageService,
    private socketService: SocketService,
    private utils: UtilsService,
  ) {}

  afterInit(server: Server) {
    this.socketService.socket = server;
  }

  emit = (roomName: string, event: SocketEvent) => {
    this.server.to(roomName).emit(event[0], event[1]);
  };

  @SubscribeMessage(SocketEventType.CONNECTION)
  async handleConnection(socket: Socket) {
    if (socket.recovered) {
      console.log('Successful recovery');
      // recovery was successful: socket.id, socket.rooms and socket.data were restored
    } else {
      console.log('new or unrecoverable session');
      // new or unrecoverable session
    }
  }

  @SubscribeMessage(SocketEventType.MATCHMAKING_INFO)
  async handleMatchMakingInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MatchMakingPayload,
  ) {
    Logger.log('matchmaking info', socket.id, data);
    const player = await this.temporaryStorage.getPlayer(socket.id);
    Logger.log('player', player);
    // if the player is already in a team room
    if (player && player.roomName) {
      Logger.log('player already in a team room');
      this.handleTeamMatchMakingInfo(player, data, socket);
      return;
    }

    const playerFound = await this.temporaryStorage.findMatchInQueue(data, 0);
    if (!playerFound) {
      Logger.log('no match, add to queue');
      const player = new PlayerState(
        PlayerStatus.IS_IN_QUEUE,
        data.side,
        data.selectedLevel,
      );
      this.temporaryStorage.addToQueue(socket.id, player);
      return;
    }

    const players = [
      playerFound,
      {
        socketId: socket.id,
        player: new PlayerState(
          PlayerStatus.IS_PLAYING,
          data.side,
          data.selectedLevel,
        ),
      },
    ];
    this.handlePlayerMatch(players);
  }

  @SubscribeMessage(SocketEventType.REQUEST_INVITE_FRIEND_TOKEN)
  async handleRequestInviteFriendToken(@ConnectedSocket() socket: Socket) {
    const inviteToken = new ShortUniqueId({ length: 6 }).rnd();
    await this.temporaryStorage.storeInviteToken(inviteToken, socket.id);
    this.server.to(socket.id).emit(SocketEventType.INVITE_FRIEND_TOKEN, {
      token: inviteToken,
    } as InviteFriendTokenPayload);
  }

  @SubscribeMessage(SocketEventType.FRIEND_JOIN_LOBBY)
  async handleFriendJoinLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody() inviteToken: string,
  ) {
    // TODO: When emitter disconnect, clear token
    const socketIdEmitter =
      await this.temporaryStorage.getInviteEmitter(inviteToken);
    const teamRoomName = uuid.v4();

    const players = [socket.id, socketIdEmitter];
    for (let i = 0; i < players.length; i++) {
      const player = new PlayerState(
        PlayerStatus.IS_WAITING_TEAMMATE,
        undefined,
        undefined,
        undefined,
        teamRoomName,
      );
      // TODO: Should be a transaction
      this.temporaryStorage.setPlayer(
        players[i],
        RedisPlayerState.parsePlayerState(player),
      );
    }

    this.addSocketToRoom(socket.id, teamRoomName);
    this.addSocketToRoom(socketIdEmitter, teamRoomName);
    this.emit(socketIdEmitter, [SocketEventType.JOIN_LOBBY]);
  }

  @SubscribeMessage(SocketEventType.GAME_PLAYER_INPUT)
  async handleGamePlayerInput(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: GamePlayerInputPayload[],
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);
    if (!player) {
      return;
    }

    Promise.all(
      data.map((input) =>
        this.temporaryStorage.addToGameInputsQueue(player.gameId, input),
      ),
    );
  }

  // @SubscribeMessage(SocketEventType.GAME_ACTIVATE_ELEMENT)
  // async handleGameActivateElement(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: GameActivateElementPayload,
  // ) {
  //   const gameRoom = Array.from(socket.rooms)[1];
  //   socket.to(gameRoom).emit(SocketEventType.GAME_ACTIVATE_ELEMENT, data);
  // }

  // @SubscribeMessage(SocketEventType.GAME_DEACTIVATE_ELEMENT)
  // async handleGameDeactivateElement(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: GameActivateElementPayload,
  // ) {
  //   const gameRoom = Array.from(socket.rooms)[1];
  //   socket.to(gameRoom).emit(SocketEventType.GAME_DEACTIVATE_ELEMENT, data);
  // }

  @SubscribeMessage(SocketEventType.TIME_SYNC)
  async handleTimeSync(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TimeSyncPayload,
  ) {
    console.log('received time sync event', data);
    const player = await this.temporaryStorage.getPlayer(socket.id);
    if (!player) {
      return;
    }

    const gameState = await this.temporaryStorage.getGameState(player.gameId);
    this.emit(socket.id, [
      SocketEventType.TIME_SYNC,
      {
        ...data,
        serverGameTime: gameState.game_time,
      },
    ]);
  }

  @SubscribeMessage(SocketEventType.DISCONNECT)
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnect', socket.id);
    // TODO: Investigate if in case of recovery session, I should better keep the data for a while
    const player = await this.temporaryStorage.getPlayer(socket.id);
    if (!player) {
      return;
    }

    // room name is equivalent to team name
    // if the player disconnected were in a room, notify the room
    if (player.roomName) {
      this.server
        .to(String(player.roomName))
        .emit(SocketEventType.TEAMMATE_DISCONNECT);
    }

    // if the player were playing, stop the game loop on the server
    if (player.gameId) {
      clearTimeout(this.gameLoopsRegistry[`game:${player.gameId}`]);
    }

    this.temporaryStorage.removePlayer(socket.id, player);
  }

  //////////// UTILS ////////////

  // TODO: As a room is equivalent to a game, lets make a proper
  // room rotation (leave the last one and add to next one) while finishing
  // a game and going into another one
  addSocketToRoom(socketId: string, room: string) {
    const socket = this.server.sockets.sockets.get(socketId);
    socket.join(room);
  }

  handlePlayerMatch = async (
    players: { socketId: string; player: PlayerState; indexToClear?: number }[],
  ) => {
    Logger.log('match found, create game');
    const dbGame = await this.createPersistentGameData(
      players[0].player.selectedLevel,
    );
    const teamRoomName = uuid.v4();
    const gameRoomName = String(dbGame.id);
    players.forEach(({ player, socketId }) => {
      // mutations
      player.status = PlayerStatus.IS_PLAYING;
      player.gameId = dbGame.id;
      player.roomName = teamRoomName;
      this.addSocketToRoom(socketId, teamRoomName);
      this.addSocketToRoom(socketId, gameRoomName);
    });
    const initialGameState = await this.createGame(players, dbGame.id);
    this.emit(gameRoomName, [
      SocketEventType.GAME_START,
      { gameState: initialGameState, lastInputs: [undefined, undefined] },
    ]);
  };

  handleTeamMatchMakingInfo = async (
    player: PlayerState,
    data: MatchMakingPayload,
    socket: Socket,
  ) => {
    // update local instance of fetched player with new data
    player.selectedLevel = data.selectedLevel;
    player.side = data.side;
    // update player store in storage
    await this.temporaryStorage.setPlayer(socket.id, {
      selectedLevel: String(data.selectedLevel),
      side: String(data.side),
      status: String(PlayerStatus.IS_WAITING_TEAMMATE),
    });

    const players = await this.utils.detectIfGameCanStart(socket, player);

    if (!players) {
      return;
    }

    this.handlePlayerMatch(players);
  };

  async createPersistentGameData(level: Levels) {
    const dbLevel = (() => {
      switch (level) {
        case Levels.CRACK_THE_DOOR:
          return Level.CRACK_THE_DOOR;
        case Levels.LEARN_TO_FLY:
          return Level.LEARN_TO_FLY;
        case Levels.THE_HIGH_SPHERES:
          return Level.THE_HIGH_SPHERES;
      }
    })();
    return this.prismaService.game.create({
      data: {
        level: dbLevel,
        status: GameStatus.STARTED,
      },
    });
  }

  async createGame(
    players: { socketId: string; player: PlayerState; indexToClear?: number }[],
    gameId: number,
  ) {
    const level = (() => {
      switch (players[0].player.selectedLevel) {
        case Levels.CRACK_THE_DOOR:
          return new CrackTheDoorLevel();
        case Levels.LEARN_TO_FLY:
          return new LearnToFlyLevel();
      }
    })();

    if (!level) {
      throw new Error(
        `Level doesn't exist or is not ready yet: ${players[0].player.selectedLevel}`,
      );
    }

    // create initial game data
    const initialGameState = new GameState(
      [
        {
          position: {
            x: level.startPosition.shadow.x,
            y: level.startPosition.shadow.y,
          },
          velocity: {
            x: 0,
            y: 0,
          },
          state: MovableComponentState.onFloor,
          insideElementID: undefined,
        },
        {
          position: {
            x: level.startPosition.light.x,
            y: level.startPosition.light.y,
          },
          velocity: {
            x: 0,
            y: 0,
          },
          state: MovableComponentState.onFloor,
          insideElementID: undefined,
        },
      ],
      level.state,
      0,
      0,
    );
    // store game state and update queue in temporary storage
    await this.temporaryStorage.createGame(players, gameId, initialGameState);
    this.registerGameLoop(gameId, level);
    return initialGameState;
  }

  fetchGameData = async (gameId: number) => {
    return Promise.all([
      this.temporaryStorage.getGameInputsQueue(gameId).then((inputs) =>
        inputs.map((input) => {
          const parts = input.split(':');
          const player: Side = Number(parts[0]);
          const inputs = parts[1]
            .split(',')
            .map((val) => (val === 'true' ? true : false));
          const sequence = Number(parts[2]);
          const time = Number(parts[3]);

          const parsedInput: GamePlayerInputPayload = {
            time,
            inputs: {
              left: inputs[0],
              right: inputs[1],
              jump: inputs[2],
              top: inputs[3],
              bottom: inputs[4],
            },
            sequence,
            player,
          };
          return parsedInput;
        }),
      ),
      this.temporaryStorage.getGameState(gameId),
    ]);
  };

  registerGameLoop = (gameId: number, level: AbstractLevel) => {
    // TODO: The following variable declared here and accessible in the process
    // input queue closure are potential memory leaks.
    // Let's try to declare them only once somewhere else, or to update
    // the game state if it should be stored per game and between iteration
    const lastPlayersInput: (GamePlayerInputPayload | undefined)[] = [
      undefined,
      undefined,
    ];

    const collidingElements = [FLOOR, ...level.collidingElements];
    FLOOR.updateMatrixWorld(true);
    level.updateMatrixWorld(true);

    const TICK_RATE = 20;
    // let tick = 0;
    // let previous = hrtimeMs();
    const tickLengthMs = 1000 / TICK_RATE;
    const physicSimulation = new PhysicSimulation();

    const networkUpdateLoop = () => {
      const timerId = setTimeout(networkUpdateLoop, tickLengthMs);
      this.gameLoopsRegistry[`game:${gameId}`] = timerId;
      this.fetchGameData(gameId).then(([inputsQueue, gameState]) => {
        physicSimulation.run((delta) => {
          gameState.game_time++;
          // 2 buffers, one for each player
          const inputsForTick = collectInputsForTick(
            inputsQueue,
            gameState.game_time,
          );
          // Logger.log(`Inputs for tick ${inputsForTick[1].length}`);
          // each player after another
          for (let i = 0; i < inputsForTick.length; i++) {
            const inputs = inputsForTick[i];
            lastPlayersInput[i] = applyInputListToSimulation(
              delta,
              lastPlayersInput[i],
              inputs,
              collidingElements,
              gameState,
              Context.server,
            );
            updateServerBounces(level.bounces, gameState.level.bounces);
            // then we remove it from the list
            for (let i = 0; i < inputs.length; i++) {
              const input = inputs[i];
              inputsQueue.splice(inputsQueue.indexOf(input), 1);
            }
          }
        });

        // emit updated game state to room
        this.emit(String(gameId), [
          SocketEventType.GAME_STATE_UPDATE,
          { gameState, lastInputs: [lastPlayersInput[0], lastPlayersInput[1]] },
        ]);

        // console.log('inputs queue after', inputsQueue.length);

        gameState.lastValidatedInput = gameState.game_time;
        // update state and inputs queue
        this.temporaryStorage.updateGameStateAndInputsQueue(gameId, gameState);
        this.handleEndLevelTimeOut(gameState, gameId);
      });
    };

    networkUpdateLoop();
  };

  handleEndLevelTimeOut = (gameState: GameState, gameId: number) => {
    if (gameState.level.end_level.length === 2) {
      if (process.env.STAGE === 'development') {
        this.finishGame(gameId);
        return;
      }

      // if there is already an ongoing timeout, do not create another one
      if (this.gameLoopsRegistry[`game:${gameId}:endGame`]) {
        return;
      }

      // if there is not, create one
      this.gameLoopsRegistry[`game:${gameId}:endGame`] = setTimeout(() => {
        this.finishGame(gameId);
      }, 5000);
    } else {
      clearTimeout(this.gameLoopsRegistry[`game:${gameId}:endGame`]);
      delete this.gameLoopsRegistry[`game:${gameId}:endGame`];
    }
  };

  finishGame = (gameId: number) => {
    const gameRoomName = String(gameId);
    clearTimeout(this.gameLoopsRegistry[`game:${gameId}`]);
    delete this.gameLoopsRegistry[`game:${gameId}`];
    console.log('game finished on the server');
    this.emit(gameRoomName, [SocketEventType.GAME_FINISHED]);
    this.server
      .in(gameRoomName)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach(({ id }) => {
          const state = RedisPlayerState.parsePlayerState(
            new PlayerState(PlayerStatus.IS_WAITING_TEAMMATE),
          );
          // console.log('parsed state', parsedState);
          this.temporaryStorage.setPlayer(id, state);
        });
      });
  };
}
