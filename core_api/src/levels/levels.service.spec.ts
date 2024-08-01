import { Test, TestingModule } from '@nestjs/testing';
import { LevelsService } from './levels.service';
import { PrismaService } from '@project-common/services';

describe('LevelsService', () => {
  let service: LevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LevelsService, PrismaService],
    }).compile();

    service = module.get<LevelsService>(LevelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
