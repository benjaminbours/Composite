// vendors
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MailgunModule } from 'nestjs-mailgun';
// project
import { AuthService } from './auth.service';
import { JwtStrategy, JwtRefreshStrategy } from './strategies';
import { AuthController } from './auth.controller';
import { mailgunConstants } from '../common/constants';
import { MailService, PrismaService } from '@project-common/services';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MailgunModule.forRoot(mailgunConstants),
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtRefreshStrategy,
    MailService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
