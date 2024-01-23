// vendors
import { Controller, Get, Param, Post } from '@nestjs/common';
// our libs
import type { AllQueueInfo } from '@benjaminbours/composite-core';
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
  getVersion(): string {
    return this.appService.getVersion();
  }

  @Get('/queue-info')
  getQueueInfo(): Promise<AllQueueInfo> {
    return this.temporaryStorage.getQueueInfo();
  }

  @Post('/check-invite/:inviteToken')
  async checkInviteValidity(
    @Param('inviteToken') inviteToken: string,
  ): Promise<boolean> {
    const inviteEmitter =
      await this.temporaryStorage.getInviteEmitter(inviteToken);
    return Boolean(inviteEmitter);
  }
}
