import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { TemporaryStorageService } from '../temporary-storage.service';
import { LobbyGateway } from './lobby.gateway';
import { UtilsService } from './utils.service';
import { SocketService } from './socket.service';
import { PrismaService } from '@project-common/services';

@Module({
  providers: [
    SocketService,
    SocketGateway,
    LobbyGateway,
    PrismaService,
    TemporaryStorageService,
    UtilsService,
  ],
})
export class SocketModule {}
