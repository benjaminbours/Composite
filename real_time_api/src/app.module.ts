import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ENVIRONMENT } from './environment';
import { redisStore } from 'cache-manager-redis-store';
import { SocketModule } from './socket/socket.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    SocketModule,
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
