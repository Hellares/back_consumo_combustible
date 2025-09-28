import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.id) {
      return false;
    }

    const userWithRoles = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          where: { activo: true },
          include: { rol: true },
        },
      },
    });

    if (!userWithRoles) {
      return false;
    }

    const userRoles = userWithRoles.roles.map(ur => ur.rol.nombre);
    return requiredRoles.some(role => userRoles.includes(role));
  }
}