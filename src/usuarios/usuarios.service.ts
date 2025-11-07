import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UsuarioResponseDto, PaginatedUsuarioResponseDto } from './dto/usuario-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AsignarRolDto, RevocarRolDto, RolAsignadoResponseDto } from './dto/asignar-rol.dto';
import { UsuarioWithRolesResponseDto } from '@/roles/dto/create-role.dto';

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

  async findAll(paginationDto: PaginationDto): Promise<PaginatedUsuarioResponseDto> {
  const { limit = 10, offset = 0 } = paginationDto;

  // Normalizar valores
  const pageSize = Math.max(1, limit);
  const safeOffset = Math.max(0, offset);

  // Calcular página actual
  const page = Math.floor(safeOffset / pageSize) + 1;

  // Total de usuarios activos
  const total = await this.prisma.usuario.count({
    where: { activo: true },
  });

  // Número total de páginas
  const totalPages = Math.ceil(total / pageSize);

  // Obtener los usuarios paginados CON ROLES ACTIVOS
  const data = await this.prisma.usuario.findMany({
    where: { activo: true },
    skip: safeOffset,
    take: pageSize,
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
      roles: {  // Nueva inclusión: solo roles activos, con id y nombre
        where: { activo: true },
        select: {
          rol: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Mapear roles para que coincida con el DTO
  const mappedData = data.map((usuario) => ({
    ...usuario,
    roles: usuario.roles?.map((ur) => ur.rol) || [],
  }));

  // Metadata de paginación
  const meta = {
    total,
    page,
    pageSize,
    totalPages,
    offset: safeOffset,
    limit: pageSize,
    nextOffset: page < totalPages ? safeOffset + pageSize : null,
    prevOffset: page > 1 ? safeOffset - pageSize : null,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };

  return { data: mappedData, meta };
}

  async search(paginationDto: PaginationDto, filters: { dni?: string; nombre?: string }): Promise<PaginatedUsuarioResponseDto> {
  const { limit = 10, offset = 0 } = paginationDto;

  // Normalizar valores
  const pageSize = Math.max(1, limit);
  const safeOffset = Math.max(0, offset);

  // Calcular página actual
  const page = Math.floor(safeOffset / pageSize) + 1;

  // Construir cláusula WHERE base (solo usuarios activos)
  let where: any = { activo: true };

  // Agregar filtros de búsqueda si se proporcionan
  if (filters.dni || filters.nombre) {
    where.OR = [];

    if (filters.dni) {
      where.OR.push({ dni: { contains: filters.dni, mode: 'insensitive' } });
      where.OR.push({ codigoEmpleado: { contains: filters.dni, mode: 'insensitive' } });
    }

    if (filters.nombre) {
      where.OR.push({ nombres: { contains: filters.nombre, mode: 'insensitive' } });
      where.OR.push({ apellidos: { contains: filters.nombre, mode: 'insensitive' } });
    }
  }

  // Total de usuarios que coinciden con los filtros
  const total = await this.prisma.usuario.count({
    where,
  });

  // Número total de páginas
  const totalPages = Math.ceil(total / pageSize);

  // Obtener los usuarios paginados CON ROLES ACTIVOS
  const data = await this.prisma.usuario.findMany({
    where,
    skip: safeOffset,
    take: pageSize,
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
      roles: {  // Nueva inclusión: solo roles activos, con id y nombre
        where: { activo: true },
        select: {
          rol: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Mapear roles para que coincida con el DTO (extraer rol del objeto roles)
  const mappedData = data.map((usuario) => ({
    ...usuario,
    roles: usuario.roles?.map((ur) => ur.rol) || [],  // Extrae { id, nombre } del rol
  }));

  // Metadata de paginación (igual que antes)
  const meta = {
    total,
    page,
    pageSize,
    totalPages,
    offset: safeOffset,
    limit: pageSize,
    nextOffset: page < totalPages ? safeOffset + pageSize : null,
    prevOffset: page > 1 ? safeOffset - pageSize : null,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };

  return { data: mappedData, meta };
}

  // Método adicional para obtener usuario con sus roles
//   async findOneWithRoles(id: number): Promise<UsuarioWithRolesResponseDto> {
//   const usuario = await this.prisma.usuario.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       nombres: true,
//       apellidos: true,
//       email: true,
//       telefono: true,
//       dni: true,
//       codigoEmpleado: true,
//       fechaIngreso: true,
//       activo: true,
//       createdAt: true,
//       updatedAt: true,
//       // Roles simples (activos) para el campo 'roles'
//       roles: {
//         where: { activo: true },
//         select: {
//           rol: {
//             select: {
//               id: true,
//               nombre: true,
//             },
//           },
//         },
//       },
//       // Roles detallados con fechas para 'assignedRoles'
//       usuarioRol: {  // Renombrado include para claridad
//         where: { activo: true },  // Solo activos, ajusta si quieres todos
//         select: {
//           fechaAsignacion: true,
//           rol: {
//             select: {
//               id: true,
//               nombre: true,
//               descripcion: true,
//               permisos: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!usuario) {
//     throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
//   }

//   return {
//     ...usuario,
//     roles: usuario.roles?.map((ur) => ur.rol) || [],  // Roles simples
//     assignedRoles: usuario.usuarioRol?.map((ur) => ({
//       fechaAsignacion: ur.fechaAsignacion,
//       rol: ur.rol,
//     })) || [],  // Roles detallados
//   };
// }

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

  // Validar que el usuario no se asigne un rol a sí mismo
  if (asignadoPorId && asignadoPorId === usuarioId) {
    throw new ConflictException('Un usuario no puede asignarse roles a sí mismo');
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