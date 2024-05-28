import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '@project-common/services';
import { LevelStatus } from '@prisma/client';
import { JWTUserPayload } from '@project-common/types';
import { handlePrismaError } from '@project-common/utils/handlePrismaError';
import { UpsertRatingDto } from './dto/upsert-rating.dto';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

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

  async findAll(authorId?: number | undefined, status?: string) {
    return this.prisma.level
      .findMany({
        where: {
          authorId: authorId,
          status: status ? (status as LevelStatus) : undefined,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async findOne(id: number) {
    return this.prisma.level
      .findUnique({
        where: { id },
        include: {
          author: {
            select: {
              name: true,
            },
          },
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
    return this.prisma.level
      .delete({
        where: { id },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

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
