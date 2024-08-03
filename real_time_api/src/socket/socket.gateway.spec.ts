import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { SocketService } from './socket.service';
import { LobbyGateway } from './lobby.gateway';
import { TemporaryStorageService } from './temporary-storage.service';

describe('SocketGateway', () => {
  let gateway: SocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          store: 'memory',
          max: 100,
          ttl: 0,
        }),
      ],
      providers: [
        SocketService,
        SocketGateway,
        LobbyGateway,
        TemporaryStorageService,
      ],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
