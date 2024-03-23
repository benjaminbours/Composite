// vendors
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
// our libs
import {
  SocketEventType,
  GamePlayerInputPayload,
  Side,
  SocketEvent,
  MovableComponentState,
  FLOOR,
  TimeSyncPayload,
  PhysicSimulation,
  applyInputListToSimulation,
  Context,
  updateServerBounces,
  GameState,
  collectInputsForTick,
  AbstractLevel,
  LevelMapping,
} from '@benjaminbours/composite-core';
// local
import { TemporaryStorageService } from '../temporary-storage.service';
import { PlayerState, PlayerStatus, RedisPlayerState } from '../PlayerState';
import { SocketService } from './socket.service';
import { PrismaService } from '@project-common/services';
import { handlePrismaError } from '@project-common/utils/handlePrismaError';

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

    if (player.inviteToken) {
      // clean invite token created by the user
      this.temporaryStorage.deleteInviteToken(player.inviteToken);
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

  async createGame(
    players: { socketId: string; player: PlayerState; indexToClear?: number }[],
    gameId: number,
  ) {
    const level = await this.prismaService.level
      .findUnique({
        where: { id: players[0].player.selectedLevel },
      })
      .then((l) => new LevelMapping(l.id, l.data as any[]))
      .catch((err) => {
        throw handlePrismaError(err);
      });

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
