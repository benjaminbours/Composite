// vendors
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// project
import { AuthService } from './auth.service';
import { JwtStrategy, JwtRefreshStrategy } from './strategies';
import { AuthController } from './auth.controller';
import { MailService, PrismaService } from '@project-common/services';

@Module({
  imports: [PassportModule, JwtModule.register({})],
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
