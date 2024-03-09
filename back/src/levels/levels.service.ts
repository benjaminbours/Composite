import { Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { PrismaService } from '@project-common/services';
import { LevelStatus } from '@prisma/client';
import { JWTUserPayload } from '@project-common/types';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  create(user: JWTUserPayload, createLevelDto: CreateLevelDto) {
    return this.prisma.level.create({
      data: {
        name: createLevelDto.name,
        data: createLevelDto.data,
        status: LevelStatus.DRAFT,
        authorId: user.sub,
      },
    });
  }

  findAll() {
    return `This action returns all levels`;
  }

  findOne(id: number) {
    return this.prisma.level.findUnique({
      where: { id },
    });
  }

  update(id: number, updateLevelDto: UpdateLevelDto) {
    return this.prisma.level.update({
      where: { id },
      data: {
        name: updateLevelDto.name,
        data: updateLevelDto.data,
        status: updateLevelDto.status,
      },
    });
  }

  remove(id: number) {
    return this.prisma.level.delete({
      where: { id },
    });
  }
}
