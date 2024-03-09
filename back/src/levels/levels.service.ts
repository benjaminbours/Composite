import { Injectable } from '@nestjs/common';
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
          data: createLevelDto.data,
          status: LevelStatus.DRAFT,
          authorId: user.sub,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  findAll() {
    return `This action returns all levels`;
  }

  async findOne(id: number) {
    return this.prisma.level
      .findUnique({
        where: { id },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async update(id: number, updateLevelDto: UpdateLevelDto) {
    return this.prisma.level
      .update({
        where: { id },
        data: {
          name: updateLevelDto.name,
          data: updateLevelDto.data,
          status: updateLevelDto.status,
        },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }

  async remove(id: number) {
    return this.prisma.level
      .delete({
        where: { id },
      })
      .catch((err) => {
        throw handlePrismaError(err);
      });
  }
}
