// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { GameStatus, Level } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { Scene } from 'three';
// our libs
import {
  SocketEventType,
  MatchMakingPayload,
  Levels,
  GamePlayerInputPayload,
  Side,
  SocketEvent,
  GameState,
  PositionLevel,
  FLOOR,
  RedisGameState,
  TimeSyncPayload,
  PhysicLoop,
  applyInputList,
} from '@benjaminbours/composite-core';
// local
import { PrismaService } from '../prisma.service';
import {
  Player,
  PlayerFoundInQueue,
  PlayerStatus,
  TemporaryStorageService,
} from '../temporary-storage.service';

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
    console.log('matchmaking info', socket.id, data);
    const playerFound = await this.temporaryStorage.findMatchInQueue(data, 0);
    if (!playerFound) {
      console.log('no match, add to queue');
      const player = new Player(
        PlayerStatus.IS_PENDING,
        data.side,
        data.selectedLevel,
      );
      this.temporaryStorage.addToQueue(socket.id, player);
      return;
    } else {
      this.createGame(playerFound, {
        socketId: socket.id,
        player: new Player(
          PlayerStatus.IS_PLAYING,
          data.side,
          data.selectedLevel,
        ),
      });
    }
  }

  @SubscribeMessage(SocketEventType.GAME_PLAYER_INPUT)
  async handleGamePlayerInput(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: GamePlayerInputPayload,
  ) {
    const player = await this.temporaryStorage.getPlayer(socket.id);
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
    const gameState = await this.temporaryStorage
      .getGameState(player.gameId)
      .then((redisState) => GameState.parseRedisGameState(redisState));
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
    if (player.gameId) {
      try {
        clearTimeout(this.gameLoopsRegistry[`game:${player.gameId}`]);
      } catch (error) {
        Logger.error(error);
      }
    }
    this.temporaryStorage.removePlayer(socket.id, player);
  }

  /**
   * Change the status of the player found in queue to playing
   * and remove him from the queue
   *
   * Store data for the new player arriving
   *
   * Store persistent game data and use the game id as room id
   *
   * Emit game start to the room
   */
  async createGame(
    playerFoundInQueue: PlayerFoundInQueue,
    playerArriving: { socketId: string; player: Player },
  ) {
    const dbLevel = (() => {
      switch (Number(playerFoundInQueue.player.selectedLevel)) {
        case Levels.CRACK_THE_DOOR:
          return Level.CRACK_THE_DOOR;
        case Levels.LEARN_TO_FLY:
          return Level.LEARN_TO_FLY;
        case Levels.THE_HIGH_SPHERES:
          return Level.THE_HIGH_SPHERES;
      }
    })();

    // store persistent game data
    const game = await this.prismaService.game.create({
      data: {
        level: dbLevel,
        status: GameStatus.STARTED,
      },
    });

    const level = (() => {
      switch (playerFoundInQueue.player.selectedLevel) {
        case Levels.CRACK_THE_DOOR:
          return new PositionLevel();
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
        },
      ],
      level.state,
      0,
      0,
    );

    // store game state and update queue in temporary storage
    await this.temporaryStorage.createGame(
      playerFoundInQueue,
      playerArriving,
      game.id,
      RedisGameState.parseGameState(initialGameState),
    );
    const roomName = String(game.id);
    this.addSocketToRoom(playerFoundInQueue.socketId, roomName);
    this.addSocketToRoom(playerArriving.socketId, roomName);
    this.emit(roomName, [
      SocketEventType.GAME_START,
      { gameState: initialGameState },
    ]);
    this.registerGameLoop(game.id, level);
  }

  registerGameLoop = (gameId: number, level: PositionLevel) => {
    // TODO: The following variable declared here and accessible in the process
    // input queue closure are potential memory leaks.
    // Let's try to declare them only once somewhere else, or to update
    // the game state if it should be stored per game and between iteration
    const lastPlayersInput: (GamePlayerInputPayload | undefined)[] = [
      undefined,
      undefined,
    ];

    const collidingScene = new Scene();
    collidingScene.add(FLOOR, ...level.collidingElements);
    collidingScene.updateMatrixWorld();

    const TICK_RATE = 10;
    // let tick = 0;
    // let previous = hrtimeMs();
    const tickLengthMs = 1000 / TICK_RATE;
    const physicLoop = new PhysicLoop();

    const networkUpdateLoop = () => {
      const timerId = setTimeout(networkUpdateLoop, tickLengthMs);
      this.gameLoopsRegistry[`game:${gameId}`] = timerId;
      // const now = hrtimeMs();
      // const delta = (now - previous) / 1000;
      // console.log('delta', delta);
      Promise.all([
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
              inputs: { left: inputs[0], right: inputs[1], jump: inputs[2] },
              sequence,
              player,
            };
            return parsedInput;
          }),
        ),
        this.temporaryStorage
          .getGameState(gameId)
          .then((redisState) => GameState.parseRedisGameState(redisState)),
      ]).then(([inputsQueue, gameState]) => {
        // console.log('inputs queue before', inputsQueue.length);
        physicLoop.run((delta) => {
          gameState.game_time++;
          const inputsForTick: GamePlayerInputPayload[][] = [[], []];
          for (let i = 0; i < inputsQueue.length; i++) {
            const input = inputsQueue[i];
            if (input.sequence !== gameState.game_time) {
              continue;
            }
            if (input.player === Side.SHADOW) {
              inputsForTick[0].push(input);
            }
            if (input.player === Side.LIGHT) {
              inputsForTick[1].push(input);
            }
          }
          for (let i = 0; i < inputsForTick.length; i++) {
            const inputs = inputsForTick[i];
            lastPlayersInput[i] = applyInputList(
              delta,
              lastPlayersInput[i],
              inputs,
              collidingScene.children,
              gameState,
              'server',
            );
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
          { gameState },
        ]);

        // console.log('inputs queue after', inputsQueue.length);

        // update state and inputs queue
        this.temporaryStorage.updateGameStateAndInputsQueue(
          gameId,
          RedisGameState.parseGameState(gameState),
        );

        if (gameState.level.end_level.length === 2) {
          clearTimeout(this.gameLoopsRegistry[`game:${gameId}`]);
          console.log('game finished on the server');
          this.emit(String(gameId), [SocketEventType.GAME_FINISHED]);
        }

        // previous = now;
      });
    };

    networkUpdateLoop();
  };

  // TODO: As a room is equivalent to a game, lets make a proper
  // room rotation (leave the last one and add to next one) while finishing
  // a game and going into another one
  addSocketToRoom(socketId: string, room: string) {
    const socket = this.server.sockets.sockets.get(socketId);
    socket.join(room);
  }
}
