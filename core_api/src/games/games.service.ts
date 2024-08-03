import { Injectable } from '@nestjs/common';
import { PrismaService } from '@project-common/services';
import { JwtService } from '@nestjs/jwt';
// import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
// import { ENVIRONMENT } from '@project-common/environment';
// import { Region } from '@hathora/cloud-sdk-typescript/models/components';
import { CreateGameDto } from './dto/create-game.dto';
import { GameStatus } from '@prisma/client';
import { UpdateGameDto } from './dto/update-game.dto';

// const hathoraCloud = new HathoraCloud({
//   appId: ENVIRONMENT.HATHORA_APP_ID,
// });

@Injectable()
export class GamesService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // async createSoloGame(region: string) {
  //   const roomConnectionData = await hathoraCloud.roomsV2.createRoom(
  //     {
  //       region: region as Region,
  //     },
  //     ENVIRONMENT.HATHORA_APP_ID,
  //     // roomId, // (optional) use to set custom roomIds
  //     undefined,
  //     {
  //       fetchOptions: {
  //         headers: {
  //           Authorization: `Bearer ${ENVIRONMENT.HATHORA_TOKEN}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     },
  //   );
  //   console.log(roomConnectionData);
  //   return roomConnectionData;
  // }

  async create({ region, mode, levelId, deviceType }: CreateGameDto) {
    return this.prismaService.game.create({
      data: {
        levelId,
        region,
        status: GameStatus.STARTED,
        mode,
        device: deviceType,
        duration: 0,
        startTime: 0,
        // ...(userId
        //   ? {
        //       players: {
        //         create: [
        //           { userId: data.userId, side: PlayerSide.LIGHT },
        //           { userId: data.userId, side: PlayerSide.SHADOW },
        //         ],
        //       },
        //     }
        //   : {}),
      },
      include: {
        level: true,
      },
    });
  }

  //   const token = this.jwtService.sign(
  //     {
  //       startTime: performance.now(),
  //     },
  //     {
  //       secret: jwtConstants.secret,
  //       expiresIn: 60 * 15, // 15 mins
  //     },
  //   );

  //   return this.prismaService.game
  //     .create({
  //       data: {
  //         status: GameStatus.STARTED,
  //         duration: 0,
  //         mode: createGameDto.mode,
  //         device: createGameDto.deviceType,
  //         levelId: createGameDto.levelId,
  //         endLevelToken: token,
  //         ...(user
  //           ? {
  //               players: {
  //                 create: [
  //                   { userId: user.id, side: PlayerSide.LIGHT },
  //                   { userId: user.id, side: PlayerSide.SHADOW },
  //                 ],
  //               },
  //             }
  //           : {}),
  //       },
  //     })
  //     .catch((err) => {
  //       throw handlePrismaError(err);
  //     });
  // }

  // async create(user: JWTUserPayload, createLevelDto: CreateLevelDto) {
  //   return this.prisma.level
  //     .create({
  //       data: {
  //         name: createLevelDto.name,
  //         data: createLevelDto.data as any, // json
  //         status: LevelStatus.DRAFT,
  //         authorId: user.sub,
  //         lightStartPosition: createLevelDto.lightStartPosition,
  //         shadowStartPosition: createLevelDto.shadowStartPosition,
  //       },
  //     })
  //     .catch((err) => {
  //       throw handlePrismaError(err);
  //     });
  // }

  findAll() {
    return `This action returns all games`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return this.prismaService.game.update({
      data: {
        ...updateGameDto,
      },
      where: {
        id,
      },
    });
  }

  async finishGame(id: number, endTime: number) {
    const game = await this.prismaService.game.findUnique({ where: { id } });
    const duration = (endTime - game.startTime) / 1_000_000_000;
    return this.prismaService
      .$transaction([
        this.prismaService.game.update({
          where: { id },
          data: {
            status: GameStatus.FINISHED,
            duration,
          },
        }),
        this.prismaService.game.findMany({
          where: { levelId: game.levelId },
          select: { id: true, duration: true },
        }),
      ])
      .then(([updatedGame, games]) => {
        // calculate rank
        const sortedGames = games
          .filter((game) => game.duration !== 0)
          .sort((a, b) => a.duration - b.duration);
        const index = sortedGames.findIndex((g) => g.id === id);
        return { updatedGame, rank: index };
      });
  }

  //   const game = await this.prismaService.game
  //     .findFirst({
  //       where: {
  //         endLevelToken: endGameToken,
  //       },
  //     })
  //     .catch((err) => {
  //       Logger.error(err);
  //       throw handlePrismaError(err);
  //     });

  //   if (!game) {
  //     Logger.error("No game found with this 'endGameToken'");
  //     throw new ForbiddenException('Access denied');
  //   }

  //   const { startTime } = this.jwtService.decode(endGameToken) as {
  //     startTime: number;
  //   };

  //   const duration = performance.now() - startTime;
  //   return this.prismaService.game.update({
  //     data: {
  //       duration,
  //       status: GameStatus.FINISHED,
  //     },
  //     where: {
  //       id: game.id,
  //     },
  //   });
  // }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
