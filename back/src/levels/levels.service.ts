import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '@project-common/services';
import { LevelStatus } from '@prisma/client';
import { JWTUserPayload } from '@project-common/types';
import { handlePrismaError } from '@project-common/utils/handlePrismaError';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  async create(user: JWTUserPayload, createLevelDto: CreateLevelDto) {
    return this.prisma.level
      .create({
        data: {
          name: createLevelDto.name,
          data: createLevelDto.data as any, // json
          status: LevelStatus.DRAFT,
          authorId: user.sub,
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
    return this.prisma.level
      .update({
        where: { id },
        data: {
          name: updateLevelDto.name,
          data: updateLevelDto.data as any,
          status: updateLevelDto.status,
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
