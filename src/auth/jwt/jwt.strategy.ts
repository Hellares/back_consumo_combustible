import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

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
    return { userId: payload.id, userDni: payload.dni, userName: payload.nombres, userIsActive: payload.activo, roles: payload.roles };
  }
}