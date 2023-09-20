import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from '../prisma.service';
import { TemporaryStorageService } from '../temporary-storage.service';

@Module({
  providers: [SocketGateway, PrismaService, TemporaryStorageService],
})
export class SocketModule {}
