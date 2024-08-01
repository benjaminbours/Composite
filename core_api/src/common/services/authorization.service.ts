import { Injectable } from '@nestjs/common';
import { JWTUserPayload } from '../types';
import { Role } from '@prisma/client';

@Injectable()
export class AuthorizationService {
  async hasAccess(
    user: JWTUserPayload,
    // resourceTryingToAccess: any,
  ): Promise<boolean> {
    if (user.role === Role.ADMIN) {
      return true;
    }

    // if (user.clientId !== resourceTryingToAccess) {
    //   throw new ForbiddenException(
    //     'Trying to access a resource without ownership on it',
    //   );
    // }

    return false;
  }
}
