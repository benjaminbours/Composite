// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as uuid from 'uuid';
// our libs
import {
  SocketEventType,
  MatchMakingPayload,
  Levels,
  GamePlayerInputPayload,
  Side,
  SocketEvent,
  MovableComponentState,
  PositionLevel,
  ProjectionLevel,
  FLOOR,
  TimeSyncPayload,
  PhysicSimulation,
  applyInputListToSimulation,
  Context,
  updateServerBounces,
  ProjectionLevelState,
  GameState,
} from '@benjaminbours/composite-core';
// local
import { TemporaryStorageService } from '../temporary-storage.service';
import { PlayerState, PlayerStatus } from 'src/PlayerState';
import { GameStatus, Level } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

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
export class SocketGateway {
  private gameLoopsRegistry: Record<string, NodeJS.Timeout> = {};
  @WebSocketServer() server: Server;

  constructor(
    private prismaService: PrismaService,
    private temporaryStorage: TemporaryStorageService,
  ) {}

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

  @SubscribeMessage(SocketEventType.GAME_PLAYER_INPUT)
  async handleGamePlayerInput(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: GamePlayerInputPayload,
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);
    if (!player) {
      return;
    }

    await this.temporaryStorage.addToGameInputsQueue(player.gameId, data);
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

    if (player.gameId) {
      try {
        clearTimeout(this.gameLoopsRegistry[`game:${player.gameId}`]);
        this.server
          .to(String(player.roomName))
          .emit(SocketEventType.TEAMMATE_DISCONNECT);
      } catch (error) {
        Logger.error(error);
      }
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

    // find team mate socket id
    const teamMateSocketId = await this.server
      .in(String(player.roomName))
      .fetchSockets()
      .then((sockets) => sockets.find(({ id }) => id !== socket.id).id);

    // find team mate player state
    const teamMatePlayer =
      await this.temporaryStorage.getPlayer(teamMateSocketId);

    const isTeamReady =
      teamMatePlayer.status === PlayerStatus.IS_WAITING_TEAMMATE &&
      teamMatePlayer.side !== player.side &&
      teamMatePlayer.selectedLevel === player.selectedLevel;

    if (!isTeamReady) {
      Logger.log('no match, teammate info');
      socket.to(player.roomName).emit(SocketEventType.TEAMMATE_INFO, data);
      return;
    }

    const players = [
      { player, socketId: socket.id },
      { player: teamMatePlayer, socketId: teamMateSocketId },
    ];
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
          return new PositionLevel();
        case Levels.LEARN_TO_FLY:
          return new ProjectionLevel();
      }
    })();

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

  collectInputsForTick(
    inputsQueue: GamePlayerInputPayload[],
    gameTime: number,
  ) {
    // 2 buffers, one for each player
    const inputsForTick: GamePlayerInputPayload[][] = [[], []];
    for (let i = 0; i < inputsQueue.length; i++) {
      const input = inputsQueue[i];
      if (input.sequence !== gameTime) {
        continue;
      }
      // filter by player
      if (input.player === Side.SHADOW) {
        inputsForTick[0].push(input);
      }
      if (input.player === Side.LIGHT) {
        inputsForTick[1].push(input);
      }
    }
    return inputsForTick;
  }

  registerGameLoop = (
    gameId: number,
    level: PositionLevel | ProjectionLevel,
  ) => {
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

    const TICK_RATE = 10;
    // let tick = 0;
    // let previous = hrtimeMs();
    const tickLengthMs = 1000 / TICK_RATE;
    const physicSimulation = new PhysicSimulation();

    const networkUpdateLoop = () => {
      const timerId = setTimeout(networkUpdateLoop, tickLengthMs);
      this.gameLoopsRegistry[`game:${gameId}`] = timerId;
      this.fetchGameData(gameId).then(([inputsQueue, gameState]) => {
        // console.log('inputs queue before', inputsQueue.length);
        physicSimulation.run((delta) => {
          gameState.game_time++;
          // 2 buffers, one for each player
          const inputsForTick = this.collectInputsForTick(
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
            if (gameState.level.id === Levels.LEARN_TO_FLY) {
              updateServerBounces(
                (level as ProjectionLevel).bounces,
                (gameState.level as ProjectionLevelState).bounces,
              );
            }
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
          this.temporaryStorage.setPlayer(id, {
            status: String(PlayerStatus.IS_PENDING),
          });
        });
      });
  };
}
