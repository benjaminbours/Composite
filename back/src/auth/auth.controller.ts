// vendor
import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  Redirect,
  Logger,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
// project
import { Public, GetUser } from '@project-common/decorators';
import { JWTUserPayload } from '@project-common/types';
import { RefreshTokenGuard } from '@project-common/guards';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TokensDto } from './dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ENVIRONMENT } from '@project-common/environment';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOkResponse({
    description: 'Successfully logged in and receive role tokens',
    type: TokensDto,
  })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.signIn(dto);
  }

  @ApiOkResponse({
    description: 'Successfully registered and receive client tokens',
    type: TokensDto,
  })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOkResponse({
    description: 'Send a reset password email for a known user',
    type: Boolean,
  })
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOkResponse({
    description: 'Update password from a reset password flow',
    type: Boolean,
  })
  @Public()
  @Post('update-password/:resetPasswordToken')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('resetPasswordToken') resetPasswordToken: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(resetPasswordToken, dto);
  }

  @ApiOkResponse({
    description:
      'Redirect to NFT store, and update purchase in GHOST status if there are some',
  })
  @ApiParam({
    name: 'confirmationToken',
    description:
      'A token generated and send by email to the client to validate his email',
  })
  @Public()
  @Redirect()
  @Get('confirm/:confirmationToken')
  async confirm(@Param('confirmationToken') confirmationToken: string) {
    Logger.log(
      `Receive confirmation email request with token ${confirmationToken}`,
    );
    const user = await this.authService.confirm(confirmationToken);
    // TODO: Add some point, add translation
    const urlToRedirect = `${ENVIRONMENT.CLIENT_URL}/sign-up-email-activated?email=${user.email}`;
    Logger.log(`Redirect to: ${urlToRedirect}`);
    return {
      url: urlToRedirect,
    };
  }

  // TODO: add global guards to prevent non confirmed user to do anything on the API (except login, logout, refresh and resend)
  // TODO: add decorator to white list some route for non confirmed user
  @ApiOkResponse({
    description: 'Successfully resent validation email to client',
    type: Boolean,
  })
  @Public()
  @Post('confirm/resend')
  @HttpCode(HttpStatus.OK)
  async confirmResend(@Body() dto: ResetPasswordDto) {
    return this.authService.confirmResend(dto.email);
  }

  @ApiOkResponse({
    description: 'Successfully logged out',
    type: Boolean,
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: JWTUserPayload) {
    return this.authService.logout(user.sub);
  }

  @ApiOkResponse({
    description: 'Successfully refreshed tokens pair',
    type: TokensDto,
  })
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@GetUser() user: JWTUserPayload) {
    return this.authService.refreshToken(user.sub, (user as any).refreshToken);
  }
}
