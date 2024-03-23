// vendors
import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
// our libs
import { AllQueueInfo } from '@benjaminbours/composite-core';
// local
import { AppService } from './app.service';
import { TemporaryStorageService } from './temporary-storage.service';
import { Public } from '@project-common/decorators';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly temporaryStorage: TemporaryStorageService,
  ) {}

  @Public()
  @Get()
  getVersion(): string {
    return this.appService.getVersion();
  }

  @ApiOkResponse({
    description: 'Match making queue info',
    type: AllQueueInfo,
  })
  @Public()
  @Get('/queue-info')
  getQueueInfo(): Promise<AllQueueInfo> {
    return this.temporaryStorage.getQueueInfo();
  }

  @ApiOkResponse({
    description: 'Tell if the provided token is still valid',
    type: Boolean,
  })
  @Public()
  @Post('/check-invite/:inviteToken')
  async checkInviteValidity(
    @Param('inviteToken') inviteToken: string,
  ): Promise<boolean> {
    const inviteEmitter =
      await this.temporaryStorage.getInviteHost(inviteToken);
    return Boolean(inviteEmitter);
  }
}
