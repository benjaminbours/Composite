import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SocketGateway, PrismaService],
})
export class SocketModule {}
