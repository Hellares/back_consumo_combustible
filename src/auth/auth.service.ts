import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { UpdateUsuarioDto } from 'src/usuarios/dto/update-usuario.dto';


@Injectable()
export class AuthService {

  private defaultRoleCache: { id: number; nombre: string } | null = null;
  private readonly DEFAULT_ROLE_NAME = process.env.DEFAULT_ROLE_NAME || 'USER';

  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) { }

async login(loginDto: LoginAuthDto) {
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

    // Crear el payload del token con roles y permisos
    const tokenPayload = {
      id: userFound.id,
      dni: userFound.dni,
      nombres: userFound.nombres,
      apellidos: userFound.apellidos,
      roles: userFound.roles.map(userRole => ({
        id: userRole.rol.id,
        nombre: userRole.rol.nombre,
        permisos: userRole.rol.permisos
      }))
    };

    const token = this.jwtService.sign(tokenPayload);

    // Preparar la respuesta del usuario (sin passwordHash)
    const { passwordHash, ...userResponse } = userFound;

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userResponse,
        token,
      },
    };
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
