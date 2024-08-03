// vendors
import { Controller, Get } from '@nestjs/common';
// import { ApiOkResponse } from '@nestjs/swagger';
// local
import { AppService } from './app.service';
import { Public } from '@project-common/decorators';
// import { Side } from '@benjaminbours/composite-core';

// class PlayerStateResponse extends PlayerState {
//   @ApiProperty({ enum: PlayerStatus })
//   public status: PlayerStatus;

//   @ApiProperty({ enum: Side, required: false })
//   public side?: Side;

//   @ApiProperty({ required: false })
//   public selectedLevel?: number;
// }

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getVersion(): string {
    return this.appService.getVersion();
  }

  // @ApiOkResponse({
  //   description: 'Server player info',
  //   type: [PlayerStateResponse],
  // })
  // @Public()
  // @Get('/server-info')
  // async getServerInfo(): Promise<PlayerState[]> {
  //   return this.temporaryStorage.getServerInfo();
  // }

  // @ApiOkResponse({
  //   description: 'Tell if the provided token is still valid',
  //   type: Boolean,
  // })
  // @Public()
  // @Post('/check-invite/:inviteToken')
  // async checkInviteValidity(
  //   @Param('inviteToken') inviteToken: string,
  // ): Promise<boolean> {
  //   const inviteEmitter =
  //     await this.temporaryStorage.getInviteHost(inviteToken);
  //   return Boolean(inviteEmitter);
  // }
}
