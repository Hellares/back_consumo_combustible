import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from 'src/auth/jwt/permissions.type';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export const Permissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);