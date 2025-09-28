import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRolDto, PermisosDto, RolResponseDto } from './dto/create-role.dto';
import { UpdateRolDto } from './dto/update-role.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRolDto: CreateRolDto): Promise<RolResponseDto> {
    // Verificar si ya existe un rol con el mismo nombre
    await this.checkNameExists(createRolDto.nombre);

    try {
      // Convertir permisos a JSON plano si existen
      const permisosJson = createRolDto.permisos 
        ? JSON.parse(JSON.stringify(createRolDto.permisos)) 
        : {};

      const rol = await this.prisma.rol.create({
        data: {
          nombre: createRolDto.nombre,
          descripcion: createRolDto.descripcion,
          permisos: permisosJson,
          activo: createRolDto.activo ?? true,
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          permisos: true,
          activo: true,
          createdAt: true,
          _count: {
            select: {
              usuariosRoles: {
                where: { activo: true }
              }
            }
          }
        },
      });

      return {
        ...rol,
        usuariosCount: rol._count.usuariosRoles
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un rol con este nombre');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, activo?: boolean): Promise<{
    data: RolResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where = activo !== undefined ? { activo } : {};
    
    const [roles, total] = await Promise.all([
      this.prisma.rol.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          permisos: true,
          activo: true,
          createdAt: true,
          _count: {
            select: {
              usuariosRoles: {
                where: { activo: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.rol.count({ where }),
    ]);

    const rolesWithCount = roles.map(rol => ({
      ...rol,
      usuariosCount: rol._count.usuariosRoles
    }));

    return {
      data: rolesWithCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<RolResponseDto> {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        permisos: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            usuariosRoles: {
              where: { activo: true }
            }
          }
        }
      },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return {
      ...rol,
      usuariosCount: rol._count.usuariosRoles
    };
  }

  async findByName(nombre: string): Promise<RolResponseDto | null> {
    const rol = await this.prisma.rol.findUnique({
      where: { nombre },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        permisos: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            usuariosRoles: {
              where: { activo: true }
            }
          }
        }
      },
    });

    if (!rol) return null;

    return {
      ...rol,
      usuariosCount: rol._count.usuariosRoles
    };
  }
  

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
        createdAt: true,
        updatedAt: true,
        roles: {
          where: { activo: true },
          select: {
            id: true,
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


  async update(id: number, updateRolDto: UpdateRolDto): Promise<RolResponseDto> {
    const rol = await this.findOne(id);
    
    // Verificar nombre duplicado si se está cambiando
    if (updateRolDto.nombre && updateRolDto.nombre !== rol.nombre) {
      await this.checkNameExists(updateRolDto.nombre);
    }

    try {
      // Convertir permisos a JSON plano si se están actualizando
      const permisosJson = updateRolDto.permisos 
        ? JSON.parse(JSON.stringify(updateRolDto.permisos))
        : undefined;

      const updatedRol = await this.prisma.rol.update({
        where: { id },
        data: {
          nombre: updateRolDto.nombre,
          descripcion: updateRolDto.descripcion,
          permisos: permisosJson,
          activo: updateRolDto.activo,
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          permisos: true,
          activo: true,
          createdAt: true,
          _count: {
            select: {
              usuariosRoles: {
                where: { activo: true }
              }
            }
          }
        },
      });

      return {
        ...updatedRol,
        usuariosCount: updatedRol._count.usuariosRoles
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un rol con este nombre');
      }
      throw error;
    }
  }

  async deactivate(id: number): Promise<RolResponseDto> {
    const rol = await this.findOne(id);
    
    // Verificar si hay usuarios activos asignados a este rol
    const usuariosActivos = await this.prisma.usuarioRol.count({
      where: {
        rolId: id,
        activo: true
      }
    });

    if (usuariosActivos > 0) {
      throw new ConflictException(
        `No se puede desactivar el rol porque tiene ${usuariosActivos} usuario(s) asignado(s) actualmente`
      );
    }
    
    const updatedRol = await this.prisma.rol.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        permisos: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            usuariosRoles: {
              where: { activo: true }
            }
          }
        }
      },
    });

    return {
      ...updatedRol,
      usuariosCount: updatedRol._count.usuariosRoles
    };
  }

  async activate(id: number): Promise<RolResponseDto> {
    const rol = await this.findOne(id);
    
    const updatedRol = await this.prisma.rol.update({
      where: { id },
      data: { activo: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        permisos: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            usuariosRoles: {
              where: { activo: true }
            }
          }
        }
      },
    });

    return {
      ...updatedRol,
      usuariosCount: updatedRol._count.usuariosRoles
    };
  }

  async getPermissions(id: number): Promise<any> {
    const rol = await this.findOne(id);
    return rol.permisos || {};
  }

  async updatePermissions(id: number, permisos: PermisosDto): Promise<RolResponseDto> {
    const rol = await this.findOne(id);
    
    // Convertir el DTO a un objeto JSON plano para Prisma
    const permisosJson = JSON.parse(JSON.stringify(permisos));
    
    const updatedRol = await this.prisma.rol.update({
      where: { id },
      data: { permisos: permisosJson },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        permisos: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            usuariosRoles: {
              where: { activo: true }
            }
          }
        }
      },
    });

    return {
      ...updatedRol,
      usuariosCount: updatedRol._count.usuariosRoles
    };
  }

  async searchRoles(searchTerm: string, page: number = 1, limit: number = 10): Promise<{
    data: RolResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where = {
      AND: [
        { activo: true },
        {
          OR: [
            { nombre: { contains: searchTerm, mode: 'insensitive' as const } },
            { descripcion: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        },
      ],
    };

    const [roles, total] = await Promise.all([
      this.prisma.rol.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          permisos: true,
          activo: true,
          createdAt: true,
          _count: {
            select: {
              usuariosRoles: {
                where: { activo: true }
              }
            }
          }
        },
        orderBy: {
          nombre: 'asc',
        },
      }),
      this.prisma.rol.count({ where }),
    ]);

    const rolesWithCount = roles.map(rol => ({
      ...rol,
      usuariosCount: rol._count.usuariosRoles
    }));

    return {
      data: rolesWithCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRolesActivos(): Promise<RolResponseDto[]> {
    const roles = await this.prisma.rol.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        permisos: true,
        activo: true,
        createdAt: true,
        _count: {
          select: {
            usuariosRoles: {
              where: { activo: true }
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return roles.map(rol => ({
      ...rol,
      usuariosCount: rol._count.usuariosRoles
    }));
  }

  private async checkNameExists(nombre: string): Promise<void> {
    const existingRol = await this.prisma.rol.findUnique({
      where: { nombre }
    });

    if (existingRol) {
      throw new ConflictException('Ya existe un rol con este nombre');
    }
  }
}