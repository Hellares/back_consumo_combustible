import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtRole } from './jwt-role';

@Injectable()
export class JwtRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<JwtRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      throw new UnauthorizedException('Usuario no tiene roles asignados');
    }
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.some((role) => 
      user.roles.some(userRole => userRole.nombre === role)
    );
    
    if (!hasRole) {
      throw new UnauthorizedException('No tienes permisos para acceder a este recurso');
    }
    
    return true;
  }
}