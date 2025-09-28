import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AsignarRolDto, RevocarRolDto, RolAsignadoResponseDto } from './dto/asignar-rol.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService,
  ) {}

async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const { password, codigoEmpleado, ...userData } = createUsuarioDto;

    // Asignar dni como codigoEmpleado si no se proporciona
    const finalCodigoEmpleado = codigoEmpleado || userData.dni;

    // Asignar dni como password si no se proporciona
    const finalPassword = password || userData.dni;

    // Verificar duplicados
    await this.checkForDuplicates({ ...userData, codigoEmpleado: finalCodigoEmpleado });

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    try {
      // Buscar el rol "USER" por defecto
      const defaultRole = await this.prisma.rol.findUnique({
        where: { nombre: process.env.DEFAULT_ROLE_NAME || 'USER' },
      });

      if (!defaultRole) {
        throw new NotFoundException('Rol por defecto "USER" no encontrado. Debe crear este rol primero.');
      }

      // Crear el usuario y asignar el rol en una transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear el usuario
        const usuario = await tx.usuario.create({
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
            createdAt: true,
            updatedAt: true,
          },
        });

        // Asignar el rol "USER" por defecto
        await tx.usuarioRol.create({
          data: {
            usuarioId: usuario.id,
            rolId: defaultRole.id,
            fechaAsignacion: new Date(),
            activo: true,
          },
        });

        return usuario;
      });

      return result;

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

  private async checkForDuplicates(userData: Partial<CreateUsuarioDto | UpdateUsuarioDto>, excludeId?: number): Promise<void> {
    const conditions = [];

    if (userData.email) {
      conditions.push({ email: userData.email });
    }
    if (userData.dni) {
      conditions.push({ dni: userData.dni });
      conditions.push({ codigoEmpleado: userData.dni }); // Verificar dni como codigoEmpleado
    }

    if (conditions.length === 0) return;

    const where = {
      OR: conditions,
      ...(excludeId && { NOT: { id: excludeId } }),
    };

    const existingUsuario = await this.prisma.usuario.findFirst({ where });

    if (existingUsuario) {
      if (existingUsuario.email === userData.email) {
        throw new ConflictException({
          message: 'Ya existe un usuario con este email',
          field: 'email',
        });
      }
      if (existingUsuario.dni === userData.dni || existingUsuario.codigoEmpleado === userData.dni) {
        throw new ConflictException({
          message: 'Ya existe un usuario con este DNI o código de empleado',
          field: 'dni',
        });
      }
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 50, offset = 0 } = paginationDto;
    return this.prisma.usuario.findMany({
      where: { activo: true },
      skip: offset,
      take: limit,
    });
  }

  // Método adicional para obtener usuario con sus roles
  async findOneWithRoles(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
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
        // createdAt: true,
        // updatedAt: true,
        roles: {
          where: { activo: true },
          select: {
            // id: true,
            fechaAsignacion: true,
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

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  /**
 * Asignar un rol adicional a un usuario existente
 */
async asignarRol(usuarioId: number, asignarRolDto: AsignarRolDto): Promise<RolAsignadoResponseDto> {
  const { rolId, asignadoPorId } = asignarRolDto;

  // Verificar que el usuario existe
  const usuario = await this.prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario) {
    throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
  }

  if (!usuario.activo) {
    throw new ConflictException('No se puede asignar roles a un usuario inactivo');
  }

  // Verificar que el rol existe y está activo
  const rol = await this.prisma.rol.findUnique({
    where: { id: rolId }
  });

  if (!rol) {
    throw new NotFoundException(`Rol con ID ${rolId} no encontrado`);
  }

  if (!rol.activo) {
    throw new ConflictException('No se puede asignar un rol inactivo');
  }

  // Verificar que el usuario no tenga ya este rol activo
  const rolExistente = await this.prisma.usuarioRol.findFirst({
    where: {
      usuarioId,
      rolId,
      activo: true
    }
  });

  if (rolExistente) {
    throw new ConflictException(`El usuario ya tiene el rol "${rol.nombre}" asignado`);
  }

  try {
    const rolAsignado = await this.prisma.usuarioRol.create({
      data: {
        usuarioId,
        rolId,
        fechaAsignacion: new Date(),
        activo: true,
        asignadoPorId,
      },
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          }
        }
      }
    });

    return {
      // id: rolAsignado.id,
      usuarioId: rolAsignado.usuarioId,
      // rolId: rolAsignado.rolId,
      fechaAsignacion: rolAsignado.fechaAsignacion,
      fechaRevocacion: rolAsignado.fechaRevocacion,
      activo: rolAsignado.activo,
      asignadoPorId: rolAsignado.asignadoPorId,
      rol: rolAsignado.rol
    };

  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Este usuario ya tiene este rol asignado');
    }
    throw error;
  }
}

/**
 * Revocar un rol específico de un usuario
 */
async revocarRol(usuarioId: number, rolId: number, revocarRolDto?: RevocarRolDto): Promise<RolAsignadoResponseDto> {
  // Verificar que el usuario existe
  const usuario = await this.prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario) {
    throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
  }

  // Buscar la asignación activa del rol
  const usuarioRol = await this.prisma.usuarioRol.findFirst({
    where: {
      usuarioId,
      rolId,
      activo: true
    },
    include: {
      rol: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        }
      }
    }
  });

  if (!usuarioRol) {
    throw new NotFoundException(`El usuario no tiene el rol con ID ${rolId} asignado o ya fue revocado`);
  }

  // Verificar que no se revoque el último rol (opcional - puedes comentar esta validación si no la necesitas)
  const rolesActivos = await this.prisma.usuarioRol.count({
    where: {
      usuarioId,
      activo: true
    }
  });

  if (rolesActivos <= 1) {
    throw new ConflictException('No se puede revocar el último rol del usuario. Debe tener al menos un rol asignado.');
  }

  try {
    const rolRevocado = await this.prisma.usuarioRol.update({
      where: { id: usuarioRol.id },
      data: {
        activo: false,
        fechaRevocacion: new Date(),
        // Nota: Si quieres trackear quién revocó, necesitarías agregar un campo revocadoPorId a tu schema
      },
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          }
        }
      }
    });

    return {
      // id: rolRevocado.id,
      usuarioId: rolRevocado.usuarioId,
      // rolId: rolRevocado.rolId,
      fechaAsignacion: rolRevocado.fechaAsignacion,
      fechaRevocacion: rolRevocado.fechaRevocacion,
      activo: rolRevocado.activo,
      asignadoPorId: rolRevocado.asignadoPorId,
      rol: rolRevocado.rol
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Obtener todos los roles de un usuario (activos e inactivos)
 */
async getRolesHistorial(usuarioId: number): Promise<RolAsignadoResponseDto[]> {
  const usuario = await this.prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario) {
    throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
  }

  const rolesHistorial = await this.prisma.usuarioRol.findMany({
    where: { usuarioId },
    include: {
      rol: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        }
      }
    },
    orderBy: [
      { activo: 'desc' }, // Roles activos primero
      { fechaAsignacion: 'desc' } // Más recientes primero
    ]
  });

  return rolesHistorial.map(usuarioRol => ({
    id: usuarioRol.id,
    usuarioId: usuarioRol.usuarioId,
    rolId: usuarioRol.rolId,
    fechaAsignacion: usuarioRol.fechaAsignacion,
    fechaRevocacion: usuarioRol.fechaRevocacion,
    activo: usuarioRol.activo,
    asignadoPorId: usuarioRol.asignadoPorId,
    rol: usuarioRol.rol
  }));
}
}