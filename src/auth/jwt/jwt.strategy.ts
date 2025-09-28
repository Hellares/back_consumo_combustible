import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserPermissions } from './permissions.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const dni =   payload.dni;
    const user = await this.prisma.usuario.findUnique({
      where: { dni: dni },
    });
    if(!user)
      throw new UnauthorizedException('Token no valido');
    if(!user.activo)
      throw new UnauthorizedException('Usuario inactivo, comuniquese con el administrador');

    // Extraer permisos consolidados de todos los roles
    const permissions = this.extractPermissions(payload.roles);

    return {
      userId: payload.id,
      userDni: payload.dni,
      userName: payload.nombres,
      userIsActive: payload.activo,
      roles: payload.roles,
      permissions
    };
  }

  /**
   * Extrae y consolida permisos de todos los roles del usuario
   */
  private extractPermissions(roles: any[]): UserPermissions {
    const permissions: UserPermissions = {};

    if (!roles || !Array.isArray(roles)) {
      return permissions;
    }

    roles.forEach(role => {
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