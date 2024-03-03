import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { TemporaryStorageService } from './temporary-storage.service';
import { ENVIRONMENT } from '@project-common/environment';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
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
    SocketModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, TemporaryStorageService],
})
export class AppModule {}
