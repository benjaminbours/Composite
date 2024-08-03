import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../common/services/prisma.service';
import { UsersController } from './users.controller';
import {
  AuthorizationService,
  SerializeService,
} from '@project-common/services';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    AuthorizationService,
    SerializeService,
  ],
})
export class UsersModule {}
