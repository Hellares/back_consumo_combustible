// =============================================
// Guard para autenticación JWT en WebSocket
// =============================================

import { PrismaService } from '@/database/prisma.service';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';// 🆕 Importar Prisma

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService, // 🆕 Inyectar Prisma
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      
      this.logger.log(`🔐 [WS Guard] Autenticando cliente: ${client.id}`);
      
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn(`⚠️ [WS Guard] No se proporcionó token JWT`);
        throw new WsException('No se proporcionó token de autenticación');
      }

      this.logger.debug(`🔑 [WS Guard] Token encontrado: ${token.substring(0, 20)}...`);

      // Verificar y decodificar el token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      this.logger.log(`✅ [WS Guard] Token válido - User ID: ${payload.sub}`);
      this.logger.debug(`🔐 [WS Guard] Payload:`, payload);

      // 🆕 Obtener usuario completo de la BD
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              rol: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.error(`❌ [WS Guard] Usuario no encontrado: ${payload.sub}`);
        throw new WsException('Usuario no encontrado');
      }

      this.logger.log(
        `✅ [WS Guard] Usuario encontrado: ${user.dni} (${user.nombres})`
      );

      // 🆕 Adjuntar usuario completo al socket
      client.data.user = {
        id: user.id,
        dni: user.dni,
        nombres: user.nombres,
        apellidoPaterno: user.apellidos,
        // apellidoMaterno: user.apellidoMaterno,
        email: user.email,
        roles: user.roles.map(ur => ({
          id: ur.rol.id,
          nombre: ur.rol.nombre,
        })),
        // unidadAsignada: user,
      };

      this.logger.log(
        `✅ [WS Guard] Cliente autenticado: ${client.id} | Usuario: ${user.dni}`
      );

      return true;
    } catch (error) {
      this.logger.error(`❌ [WS Guard] Error de autenticación: ${error.message}`);
      
      if (error.name === 'TokenExpiredError') {
        throw new WsException('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new WsException('Token inválido');
      }
      
      throw new WsException('Error de autenticación');
    }
  }

  /**
   * Extraer token JWT del handshake del socket
   * Soporta: 
   * - Query params: ?token=xxx
   * - Auth header: Authorization: Bearer xxx
   * - Handshake auth: { auth: { token: 'xxx' } }
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    this.logger.debug(`🔍 [WS Guard] Buscando token en handshake...`);
    
    // 1. Intentar desde handshake auth (PRIORIDAD - usado por Flutter)
    const tokenFromAuth = client.handshake.auth?.token;
    if (tokenFromAuth) {
      this.logger.debug(`✅ [WS Guard] Token encontrado en handshake.auth`);
      return tokenFromAuth;
    }

    // 2. Intentar desde headers Authorization
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      this.logger.debug(`✅ [WS Guard] Token encontrado en headers`);
      return authHeader.substring(7);
    }

    // 3. Intentar desde query params
    const tokenFromQuery = client.handshake.query?.token as string;
    if (tokenFromQuery) {
      this.logger.debug(`✅ [WS Guard] Token encontrado en query`);
      return tokenFromQuery;
    }

    this.logger.warn(`❌ [WS Guard] Token no encontrado en ningún lugar`);
    this.logger.debug(`🔍 [WS Guard] handshake.auth:`, client.handshake.auth);
    this.logger.debug(`🔍 [WS Guard] handshake.headers.authorization:`, authHeader);
    this.logger.debug(`🔍 [WS Guard] handshake.query.token:`, tokenFromQuery);

    return null;
  }
}