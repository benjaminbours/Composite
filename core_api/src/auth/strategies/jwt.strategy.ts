// vendor
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// project
import { JWTUserPayload } from '@project-common/types';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  /**
   * Basically, in express terms, this function does
   *
   * `req.user = payload;`
   */
  async validate(payload: JWTUserPayload) {
    return {
      ...payload,
    };
  }
}
