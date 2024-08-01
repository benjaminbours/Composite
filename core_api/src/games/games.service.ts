import { Injectable } from '@nestjs/common';
import { PrismaService } from '@project-common/services';
import { JwtService } from '@nestjs/jwt';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { ENVIRONMENT } from '@project-common/environment';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';

const appId = 'app-07e72471-d9d1-4b1c-bf21-74e2ad6cb53a';
const hathoraCloud = new HathoraCloud({
  appId,
});

@Injectable()
export class GamesService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createSoloGame(region: string) {
    const appId = 'app-07e72471-d9d1-4b1c-bf21-74e2ad6cb53a';
    const roomConnectionData = await hathoraCloud.roomsV2.createRoom(
      {
        region: region as Region,
      },
      appId,
      // roomId, // (optional) use to set custom roomIds
      undefined,
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${ENVIRONMENT.HATHORA_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      },
    );
    console.log(roomConnectionData);
    return roomConnectionData;
  }

  // // use to create single player game so far
  // async create(createGameDto: CreateGameDto) {
  //   const user = await (async () => {
  //     if (!createGameDto.userId) {
  //       return undefined;
  //     }

  //     return this.prismaService.user
  //       .findUnique({
  //         where: {
  //           id: createGameDto.userId,
  //         },
  //       })
  //       .catch((err) => {
  //         throw handlePrismaError(err);
  //       });
  //   })();

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

  findAll() {
    return `This action returns all games`;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  // update(id: number, updateGameDto: UpdateGameDto) {
  //   return this.prismaService.game.update({
  //     data: {
  //       duration: updateGameDto.duration,
  //       status: updateGameDto.status,
  //     },
  //     where: {
  //       id,
  //     },
  //   });
  // }

  // async endGame(endGameToken: string) {
  //   try {
  //     this.jwtService.verify(endGameToken, {
  //       secret: jwtConstants.secret,
  //     });
  //   } catch (error) {
  //     Logger.error(
  //       'End game token received has not been generated with our JWT secret or is out dated',
  //     );
  //     throw new ForbiddenException('Access denied');
  //   }

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
