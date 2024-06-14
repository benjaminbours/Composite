import { Injectable } from '@nestjs/common';
// import { CreateGameDto } from './dto/create-game.dto';
// import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '@project-common/services';
// import { GameStatus, PlayerSide } from '@prisma/client';
// import { handlePrismaError } from '@project-common/utils/handlePrismaError';
import { JwtService } from '@nestjs/jwt';
// import { jwtConstants } from 'src/auth/constants';

@Injectable()
export class GamesService {
  constructor(
    private prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
