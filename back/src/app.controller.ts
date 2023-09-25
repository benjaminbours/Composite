// vendors
import { Controller, Get } from '@nestjs/common';
// our libs
import { AllQueueInfo } from '@benjaminbours/composite-core';
// local
import { AppService } from './app.service';
import { TemporaryStorageService } from './temporary-storage.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly temporaryStorage: TemporaryStorageService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/queue-info')
  getQueueInfo(): Promise<AllQueueInfo> {
    return this.temporaryStorage.getQueueInfo();
  }
}
