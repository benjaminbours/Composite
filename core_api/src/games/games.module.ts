import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaService } from '@project-common/services';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [GamesController],
  providers: [GamesService, PrismaService, JwtService],
})
export class GamesModule {}
