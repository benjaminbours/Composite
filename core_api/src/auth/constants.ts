import { ENVIRONMENT } from '@project-common/environment';

export const jwtConstants = {
  secret: ENVIRONMENT.JWT_SECRET,
  refresh_secret: ENVIRONMENT.JWT_REFRESH_SECRET,
};
