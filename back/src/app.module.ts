import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';

@Module({
  imports: [SocketGateway],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
