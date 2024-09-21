import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '@project-common/services';
import { LevelStatus } from '@prisma/client';
import { JWTUserPayload } from '@project-common/types';
import { handlePrismaError } from '@project-common/utils/handlePrismaError';
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  async uploadThumbnail(
    id: number,
    user: JWTUserPayload,
    file: Express.Multer.File,
  ) {
    await this.checkUserHasAccessToLevel(+id, user);
    const thumbnailsDir = path.join(
      process.cwd(),
      'uploads',
      'level_thumbnails',
    );
    const fileName = `${id}.png`;
    const filePath = path.join(thumbnailsDir, fileName);
    const writeStream = fs.createWriteStream(filePath);

    writeStream.on('finish', () => {
      console.log(`File write completed for level ${id}.`);
    });

    writeStream.on('error', (err) => {
      console.error('Error writing file:', err);
    });

    writeStream.write(file.buffer);
    writeStream.end();

    return this.prisma.level.update({
      where: { id },
      data: { thumbnail: fileName.toString() },
    });
  }

  async upsertRating(
    levelId: number,
    user: JWTUserPayload,
    { rating, type }: UpsertRatingDto,
  ) {
    const userLevelId = `${user.sub}-${levelId}-${type}`;
    return this.prisma.rating
      .upsert({
        where: {
          userLevelId,
        },
        create: {
          userLevelId,
          levelId: levelId,
          userId: user.sub,
          value: rating,
          type,
        },
        update: {
          value: rating,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async findRatings(levelId: number, user: JWTUserPayload) {
    return this.prisma.rating
      .findMany({
        where: {
          userId: user.sub,
          levelId: levelId,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async create(user: JWTUserPayload, createLevelDto: CreateLevelDto) {
    return this.prisma.level
      .create({
        data: {
          name: createLevelDto.name,
          data: createLevelDto.data as any, // json
          status: LevelStatus.DRAFT,
          authorId: user.sub,
          lightStartPosition: createLevelDto.lightStartPosition,
          shadowStartPosition: createLevelDto.shadowStartPosition,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async findAll(
    authorId?: number | undefined,
    status?: string,
    stats?: boolean,
  ) {
    return this.prisma.level
      .findMany({
        where: {
          authorId: authorId,
          status: status ? (status as LevelStatus) : undefined,
        },
        select: {
          name: true,
          id: true,
          status: true,
          thumbnail: true,
          author: {
            select: {
              name: true,
            },
          },
          ...(stats
            ? { _count: { select: { games: true } }, ratings: true }
            : {}),
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async findOne(id: number, stats?: boolean) {
    return this.prisma.level
      .findUnique({
        where: { id },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          ...(stats
            ? {
                games: {
                  include: {
                    players: {
                      include: {
                        user: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
                ratings: true,
              }
            : {}),
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async update(
    id: number,
    updateLevelDto: UpdateLevelDto,
    user: JWTUserPayload,
  ) {
    await this.checkUserHasAccessToLevel(id, user);

    const level = await this.prisma.level
      .findUnique({
        where: { id },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });

    if (level.status === LevelStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot update a published level.');
    }

    return this.prisma.level
      .update({
        where: { id },
        data: {
          name: updateLevelDto.name,
          data: updateLevelDto.data as any,
          status: updateLevelDto.status,
          lightStartPosition: updateLevelDto.lightStartPosition,
          shadowStartPosition: updateLevelDto.shadowStartPosition,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async remove(id: number, user: JWTUserPayload) {
    await this.checkUserHasAccessToLevel(id, user);

    const level = await this.findOne(id).catch((err) => {
      throw handlePrismaError(err);
    });

    if (level.status === LevelStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot delete a published level.');
    }

    return this.prisma.level
      .delete({
        where: { id },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  // TODO: reduce number of queries
  async checkUserHasAccessToLevel(id: number, user: JWTUserPayload) {
    const level = await this.prisma.level
      .findUnique({
        where: { id },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });

    if (level.authorId !== user.sub) {
      throw new ForbiddenException(
        'Trying to access a resource without ownership on it.',
      );
    }
  }
}
