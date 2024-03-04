import { Role } from '@prisma/client';

// the shape is respecting JWT spec
export interface JWTUserPayload {
  username: string;
  sub: number; // user id
  role: Role;
}
