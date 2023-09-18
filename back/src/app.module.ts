import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';
import { ENVIRONMENT } from './environment';

@Module({
  imports: [
    SocketGateway,
    CacheModule.registerAsync<any>({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          url: ENVIRONMENT.REDIS_URL,
        });
        return {
          store: () => store,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
