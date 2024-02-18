import { SetMetadata } from '@nestjs/common';

export enum Role {
  NftStore = 1,
  Admin = 2,
  ContentCreator = 3,
  Client = 4,
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
