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
import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
// our libs
import {
  SocketEventType,
  MatchMakingPayload,
  Levels,
  GamePlayerInputPayload,
  Side,
  SocketEvent,
  GameState,
  applyInputsUntilNow,
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
  @WebSocketServer() server: Server;

  constructor(
    private prismaService: PrismaService,
    private temporaryStorage: TemporaryStorageService,
    private schedulerRegistry: SchedulerRegistry,
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
  async handleMatchMakingPayload(
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

  @SubscribeMessage(SocketEventType.DISCONNECT)
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnect', socket.id);
    // TODO: Investigate if in case of recovery session, I should better keep the data for a while
    const player = await this.temporaryStorage.getPlayer(socket.id);
    if (player.gameId) {
      try {
        this.schedulerRegistry.deleteInterval(`game:${player.gameId}`);
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

    // create initial game data
    // TODO: Load start position depending of level
    const initialGameState = new GameState(
      playerFoundInQueue.player.selectedLevel,
      10,
      20,
      0,
      0,
      200,
      20,
      0,
      0,
      Date.now(),
    );
    // store game state and update queue in temporary storage
    await this.temporaryStorage.createGame(
      playerFoundInQueue,
      playerArriving,
      game.id,
      initialGameState,
    );
    const roomName = String(game.id);
    this.addSocketToRoom(playerFoundInQueue.socketId, roomName);
    this.addSocketToRoom(playerArriving.socketId, roomName);
    this.emit(roomName, [SocketEventType.GAME_START]);
    this.registerGameLoop(game.id);
  }

  registerGameLoop = (gameId: number) => {
    const updateFrequency = 100;
    const lastPlayersInput: {
      light?: GamePlayerInputPayload;
      shadow?: GamePlayerInputPayload;
    } = {
      light: undefined,
      shadow: undefined,
    };

    const processInputsQueue = async () => {
      // const startTime = performance.now();
      const data = await Promise.all([
        this.temporaryStorage.getGameInputsQueue(gameId).then((inputs) =>
          inputs.map((input) => {
            const parts = input.split(':');
            const player: Side = Number(parts[0]);
            const inputs = parts[1]
              .split(',')
              .map((val) => (val === 'true' ? true : false));
            const delta = Number(parts[2]);
            const time = Number(parts[3]);

            const parsedInput: GamePlayerInputPayload = {
              time,
              delta,
              inputs: { left: inputs[0], right: inputs[1], jump: inputs[2] },
              player,
            };
            return parsedInput;
          }),
        ),
        this.temporaryStorage.getGameState(gameId),
      ]);

      const [inputsQueue, gameState] = data;
      // Logger.log('INPUTS QUEUE', inputsQueue);
      // Logger.log('INPUTS QUEUE length', inputsQueue.length);

      applyInputsUntilNow(lastPlayersInput, inputsQueue, gameState);

      // emit updated game state to room
      this.emit(String(gameId), [
        SocketEventType.GAME_STATE_UPDATE,
        { gameState },
      ]);

      // TODO: Use transaction to update game state and clean inputs queue
      // save updated game state
      this.temporaryStorage.updateGameState(gameId, gameState);

      // clean inputs queue
      await this.temporaryStorage.removeFromGameInputsQueue(
        gameId,
        gameState.lastValidatedInput,
      );
      // Logger.log('delete items from queue', deleted);
      // const endTime = performance.now();
      // const elapsedTime = endTime - startTime;
      // Logger.log('execution time in ms', elapsedTime);
    };

    const gameUpdateInterval = setInterval(processInputsQueue, updateFrequency);
    this.schedulerRegistry.addInterval(`game:${gameId}`, gameUpdateInterval);
    // setTimeout(() => {
    //   this.schedulerRegistry.deleteInterval(`game:${gameId}`);
    // }, 3000);
  };

  // TODO: As a room is equivalent to a game, lets make a proper
  // room rotation (leave the last one and add to next one) while finishing
  // a game and going into another one
  addSocketToRoom(socketId: string, room: string) {
    const socket = this.server.sockets.sockets.get(socketId);
    socket.join(room);
  }
}
