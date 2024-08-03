import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { TemporaryStorageService } from './temporary-storage.service';
import { LobbyGateway } from './lobby.gateway';
import { SocketService } from './socket.service';

@Module({
  providers: [
    SocketService,
    SocketGateway,
    LobbyGateway,
    TemporaryStorageService,
  ],
})
export class SocketModule {}
