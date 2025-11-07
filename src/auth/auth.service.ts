import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { UpdateUsuarioDto } from 'src/usuarios/dto/update-usuario.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';


@Injectable()
export class AuthService {

  private defaultRoleCache: { id: number; nombre: string } | null = null;
  private readonly DEFAULT_ROLE_NAME = process.env.DEFAULT_ROLE_NAME || 'USER';
  
  // Configuración de tokens
  private readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
  private readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
  private readonly MAX_ACTIVE_SESSIONS = 5; // Máximo de sesiones activas por usuario

  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) { }

  /**
   * Login con generación de access token y refresh token
   */
  async login(loginDto: LoginAuthDto, metadata?: {
    userAgent?: string;
    ipAddress?: string;
    dispositivoId?: string;
  }) {
    const { dni, password } = loginDto;

    const userFound = await this.prismaService.usuario.findUnique({
      where: {
        dni,
        activo: true
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
        dni: true,
        codigoEmpleado: true,
        fechaIngreso: true,
        activo: true,
        passwordHash: true,
        roles: {
          where: { activo: true },
          select: {
            rol: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                permisos: true,
              }
            }
          }
        }
      }
    });

    if (!userFound) {
      throw new HttpException('Usuario no encontrado o inactivo', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await compare(password, userFound.passwordHash);
    if (!isPasswordValid) {
      throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
    }

    // Generar ambos tokens
    const tokens = await this.generateTokenPair(userFound, metadata);

    // Preparar la respuesta del usuario (sin passwordHash)
    const { passwordHash, ...userResponse } = userFound;

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userResponse,
        ...tokens,
      },
    };
  }

  /**
   * Genera un par de tokens (access + refresh)
   */
  private async generateTokenPair(user: any, metadata?: {
    userAgent?: string;
    ipAddress?: string;
    dispositivoId?: string;
  }): Promise<TokensResponseDto> {
    const payload = {
      id: user.id,
      dni: user.dni,
      nombres: user.nombres,
      apellidos: user.apellidos,
      roles: user.roles.map(ur => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
        permisos: ur.rol.permisos
      }))
    };

    // Access Token (corta duración)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY as any
    });

    // Refresh Token (larga duración)
    const refreshToken = this.jwtService.sign(
      { id: user.id, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_EXPIRY as any }
    );

    // Guardar refresh token en BD
    await this.saveRefreshToken(user.id, refreshToken, metadata);

    // Calcular tiempo de expiración en segundos
    const expiresIn = this.parseExpiryToSeconds(this.ACCESS_TOKEN_EXPIRY);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  /**
   * Guarda el refresh token en la base de datos
   */
  private async saveRefreshToken(
    usuarioId: number,
    token: string,
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      dispositivoId?: string;
    }
  ): Promise<void> {
    // Calcular fecha de expiración
    const expiresAt = new Date();
    const days = this.parseExpiryToDays(this.REFRESH_TOKEN_EXPIRY);
    expiresAt.setDate(expiresAt.getDate() + days);

    // Verificar límite de sesiones activas
    const activeTokens = await this.prismaService.refreshToken.count({
      where: {
        usuarioId,
        revocado: false,
        expiresAt: { gt: new Date() }
      }
    });

    // Si se excede el límite, revocar el token más antiguo
    if (activeTokens >= this.MAX_ACTIVE_SESSIONS) {
      const oldestToken = await this.prismaService.refreshToken.findFirst({
        where: {
          usuarioId,
          revocado: false,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (oldestToken) {
        await this.prismaService.refreshToken.update({
          where: { id: oldestToken.id },
          data: {
            revocado: true,
            fechaRevocado: new Date(),
            motivoRevocado: 'Límite de sesiones excedido'
          }
        });
      }
    }

    // Crear nuevo refresh token
    await this.prismaService.refreshToken.create({
      data: {
        token,
        usuarioId,
        expiresAt,
        dispositivoId: metadata?.dispositivoId,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress
      }
    });
  }

  /**
   * Refresca los tokens usando un refresh token válido
   */
  async refreshTokens(refreshToken: string, metadata?: {
    userAgent?: string;
    ipAddress?: string;
    dispositivoId?: string;
  }): Promise<{ success: boolean; message: string; data: TokensResponseDto }> {
    // Verificar que el refresh token existe y es válido
    const storedToken = await this.prismaService.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        usuario: {
          include: {
            roles: {
              where: { activo: true },
              include: {
                rol: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    permisos: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (storedToken.revocado) {
      throw new UnauthorizedException('Refresh token revocado');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    if (!storedToken.usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar el token JWT
    try {
      const decoded = this.jwtService.verify(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Revocar el token actual (rotación de refresh token)
    await this.prismaService.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revocado: true,
        fechaRevocado: new Date(),
        motivoRevocado: 'Token rotado'
      }
    });

    // Generar nuevo par de tokens
    const tokens = await this.generateTokenPair(storedToken.usuario, metadata);

    return {
      success: true,
      message: 'Tokens renovados exitosamente',
      data: tokens
    };
  }

  /**
   * Cierra sesión revocando el refresh token
   */
  async logout(refreshToken: string): Promise<{ success: boolean; message: string }> {
    const result = await this.prismaService.refreshToken.updateMany({
      where: {
        token: refreshToken,
        revocado: false
      },
      data: {
        revocado: true,
        fechaRevocado: new Date(),
        motivoRevocado: 'Logout manual'
      }
    });

    if (result.count === 0) {
      throw new NotFoundException('Refresh token no encontrado o ya revocado');
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  /**
   * Revoca todas las sesiones activas de un usuario
   */
  async revokeAllUserTokens(usuarioId: number, motivo: string = 'Revocación masiva'): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: {
        usuarioId,
        revocado: false
      },
      data: {
        revocado: true,
        fechaRevocado: new Date(),
        motivoRevocado: motivo
      }
    });
  }

  /**
   * Convierte el formato de expiración a segundos
   */
  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900; // 15 minutos por defecto
    }
  }

  /**
   * Convierte el formato de expiración a días
   */
  private parseExpiryToDays(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 'd': return value;
      case 'h': return value / 24;
      case 'm': return value / (24 * 60);
      case 's': return value / (24 * 3600);
      default: return 7; // 7 días por defecto
    }
  }

async create(createUsuarioDto: CreateUsuarioDto) {
    const { password, codigoEmpleado, ...userData } = createUsuarioDto;

    // Asignar dni como codigoEmpleado si no se proporciona
    const finalCodigoEmpleado = codigoEmpleado || userData.dni;
    // Asignar dni como password si no se proporciona
    const finalPassword = password || userData.dni;

    // Verificar duplicados de manera optimizada
    await this.checkForDuplicatesOptimized({ ...userData, codigoEmpleado: finalCodigoEmpleado });

    // Obtener rol por defecto (con cache)
    const defaultRole = await this.getDefaultRole();

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    try {
      // Crear usuario y asignar rol en una sola transacción optimizada
      const usuarioCompleto = await this.prismaService.$transaction(async (tx) => {
        // Crear el usuario
        const nuevoUsuario = await tx.usuario.create({
          data: {
            ...userData,
            codigoEmpleado: finalCodigoEmpleado,
            passwordHash,
            fechaIngreso: userData.fechaIngreso ? new Date(userData.fechaIngreso) : null,
          },
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
            telefono: true,
            dni: true,
            codigoEmpleado: true,
            fechaIngreso: true,
            activo: true,
          },
        });

        // Asignar el rol por defecto
        await tx.usuarioRol.create({
          data: {
            usuarioId: nuevoUsuario.id,
            rolId: defaultRole.id,
            fechaAsignacion: new Date(),
            activo: true,
          },
        });

        // Obtener el usuario completo con roles en la misma transacción
        return await tx.usuario.findUnique({
          where: { id: nuevoUsuario.id },
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
            telefono: true,
            dni: true,
            codigoEmpleado: true,
            fechaIngreso: true,
            activo: true,
            roles: {
              where: { activo: true },
              select: {
                rol: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    permisos: true,
                  }
                }
              }
            }
          },
        });
      });

      // Generar el token JWT
      const tokenPayload = {
        id: usuarioCompleto.id,
        dni: usuarioCompleto.dni,
        nombres: usuarioCompleto.nombres,
        apellidos: usuarioCompleto.apellidos,
        roles: usuarioCompleto.roles.map(userRole => ({
          id: userRole.rol.id,
          nombre: userRole.rol.nombre,
          permisos: userRole.rol.permisos
        }))
      };

      const token = this.jwtService.sign(tokenPayload);

      return {
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          ...usuarioCompleto,
          token
        }
      };

    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new ConflictException({
          message: `Ya existe un usuario con este ${field}`,
          field,
        });
      }
      throw error;
    }
  }

  /**
   * Obtiene el rol por defecto con cache para optimizar performance
   */
  private async getDefaultRole(): Promise<{ id: number; nombre: string }> {
    if (!this.defaultRoleCache) {
      const rol = await this.prismaService.rol.findUnique({
        where: { nombre: this.DEFAULT_ROLE_NAME },
        select: { id: true, nombre: true },
      });

      if (!rol) {
        throw new NotFoundException(
          `Rol por defecto "${this.DEFAULT_ROLE_NAME}" no encontrado. Debe crear este rol primero.`
        );
      }

      this.defaultRoleCache = rol;
    }
    return this.defaultRoleCache;
  }

  /**
   * Verifica duplicados de manera optimizada con una sola consulta
   */
  private async checkForDuplicatesOptimized(
    userData: Partial<CreateUsuarioDto | UpdateUsuarioDto>,
    excludeId?: number
  ): Promise<void> {
    const conditions = [];

    if (userData.email) {
      conditions.push({ email: userData.email });
    }
    if (userData.dni) {
      conditions.push({ dni: userData.dni });
      conditions.push({ codigoEmpleado: userData.dni });
    }
    if (userData.codigoEmpleado && userData.codigoEmpleado !== userData.dni) {
      conditions.push({ codigoEmpleado: userData.codigoEmpleado });
    }

    if (conditions.length === 0) return;

    const where = {
      OR: conditions,
      ...(excludeId && { NOT: { id: excludeId } }),
    };

    // Una sola consulta que trae solo los campos necesarios para diagnóstico
    const duplicateUsers = await this.prismaService.usuario.findMany({
      where,
      select: {
        id: true,
        email: true,
        dni: true,
        codigoEmpleado: true,
      },
    });

    if (duplicateUsers.length > 0) {
      // Identificar el tipo específico de conflicto
      for (const duplicate of duplicateUsers) {
        if (userData.email && duplicate.email === userData.email) {
          throw new ConflictException({
            message: 'Ya existe un usuario con este email',
            field: 'email',
            conflictValue: userData.email,
          });
        }
        
        if (userData.dni && duplicate.dni === userData.dni) {
          throw new ConflictException({
            message: 'Ya existe un usuario con este DNI',
            field: 'dni',
            conflictValue: userData.dni,
          });
        }
        
        if (userData.dni && duplicate.codigoEmpleado === userData.dni) {
          throw new ConflictException({
            message: 'Ya existe un usuario con este DNI como código de empleado',
            field: 'dni',
            conflictValue: userData.dni,
          });
        }
        
        if (userData.codigoEmpleado && duplicate.codigoEmpleado === userData.codigoEmpleado) {
          throw new ConflictException({
            message: 'Ya existe un usuario con este código de empleado',
            field: 'codigoEmpleado',
            conflictValue: userData.codigoEmpleado,
          });
        }
      }
    }
  }

  /**
   * Método para limpiar el cache del rol por defecto si es necesario
   * Útil cuando se actualiza la configuración de roles
   */
  clearDefaultRoleCache(): void {
    this.defaultRoleCache = null;
  }

  /**
   * Método para pre-cargar el cache del rol por defecto
   * Útil para llamar en el inicio de la aplicación
   */
  async preloadDefaultRole(): Promise<void> {
    await this.getDefaultRole();
  }

}
