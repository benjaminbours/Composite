import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../decorators/roles.decorator';
import { JWTUserPayload } from '../types';

@Injectable()
export class AuthorizationService {
  async hasAccess(
    user: JWTUserPayload,
    resourceTryingToAccess: any,
  ): Promise<boolean> {
    if (user.role === Role.Admin) {
      return true;
    }

    if (user.clientId !== resourceTryingToAccess) {
      throw new ForbiddenException(
        'Trying to access a resource without ownership on it',
      );
    }

    return false;
  }
}
