import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import * as pjson from '../package.json';
import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { PrismaService } from '@project-common/services';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          store: 'memory',
          max: 100,
          ttl: 0,
        }),
      ],
      controllers: [AppController],
      providers: [AppService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the current version', () => {
      expect(appController.getVersion()).toBe(
        `API version is ${pjson.version}`,
      );
    });
  });
});
