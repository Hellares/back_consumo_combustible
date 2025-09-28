import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionRequirement } from 'src/common/decorators/permissions.decorator';
import { PermissionAction, PermissionResource, UserPermissions } from './permissions.type';

@Injectable()
export class JwtPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene permisos
    const userPermissions = this.extractUserPermissions(user);

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some(required => {
      const userResourcePermissions = userPermissions[required.resource] || [];
      return required.actions.some(action => userResourcePermissions.includes(action));
    });

    if (!hasPermission) {
      throw new UnauthorizedException('No tienes permisos suficientes para acceder a este recurso');
    }

    return true;
  }

  /**
   * Extrae los permisos del usuario desde el token JWT
   */
  private extractUserPermissions(user: any): UserPermissions {
    const permissions: UserPermissions = {};

    if (!user.roles || !Array.isArray(user.roles)) {
      return permissions;
    }

    // Combinar permisos de todos los roles del usuario
    user.roles.forEach(role => {
      if (role.permisos && typeof role.permisos === 'object') {
        Object.entries(role.permisos).forEach(([resource, actions]) => {
          if (!permissions[resource]) {
            permissions[resource] = [];
          }

          if (Array.isArray(actions)) {
            actions.forEach(action => {
              if (!permissions[resource].includes(action)) {
                permissions[resource].push(action);
              }
            });
          }
        });
      }
    });

    return permissions;
  }
}