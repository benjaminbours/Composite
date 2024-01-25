import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from '../prisma.service';
import { TemporaryStorageService } from '../temporary-storage.service';
import { TeamLobbyGateway } from './team-lobby.gateway';
import { UtilsService } from './utils.service';
import { SocketService } from './socket.service';

@Module({
  providers: [
    SocketService,
    SocketGateway,
    TeamLobbyGateway,
    PrismaService,
    TemporaryStorageService,
    UtilsService,
  ],
})
export class SocketModule {}
