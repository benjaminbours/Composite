import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.refresh_secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const authorization = req.get('authorization');
    if (!authorization) {
      throw new UnauthorizedException();
    }
    const refreshToken = authorization.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token malformed');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
