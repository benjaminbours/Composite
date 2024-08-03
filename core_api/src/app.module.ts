import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard, RolesGuard } from '@project-common/guards';
import { LevelsModule } from './levels/levels.module';
import { PrismaService } from '@project-common/services';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // provide path to the folder with images
      serveRoot: '/images', // provide route to access images
      serveStaticOptions: {
        index: false,
        redirect: false,
        fallthrough: false,
      },
    }),
    AuthModule,
    UsersModule,
    LevelsModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // TODO: REstore ThrottlerGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // },
  ],
})
export class AppModule {}
