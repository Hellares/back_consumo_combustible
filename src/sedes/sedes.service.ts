// =============================================
// src/sedes/sedes.service.ts
// =============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { QuerySedeDto } from './dto/query-sede.dto';
import { SedeResponseDto } from './dto/sede-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  async create(createSedeDto: CreateSedeDto): Promise<SedeResponseDto> {
    try {
      // Verificar si la zona existe
      const zona = await this.prisma.zona.findUnique({
        where: { id: createSedeDto.zonaId }
      });

      if (!zona) {
        throw new NotFoundException(`Zona con ID ${createSedeDto.zonaId} no encontrada`);
      }

      if (!zona.activo) {
        throw new BadRequestException(`No se puede crear una sede en una zona inactiva`);
      }

      // Verificar si el código ya existe (si se proporciona)
      if (createSedeDto.codigo) {
        const existingSede = await this.prisma.sede.findUnique({
          where: { codigo: createSedeDto.codigo }
        });

        if (existingSede) {
          throw new ConflictException(`Ya existe una sede con el código: ${createSedeDto.codigo}`);
        }
      }

      // Verificar si el nombre ya existe en la misma zona
      const existingSedeByName = await this.prisma.sede.findFirst({
        where: { 
          nombre: {
            equals: createSedeDto.nombre,
            mode: 'insensitive'
          },
          zonaId: createSedeDto.zonaId
        }
      });

      if (existingSedeByName) {
        throw new ConflictException(`Ya existe una sede con el nombre "${createSedeDto.nombre}" en esta zona`);
      }

      const sede = await this.prisma.sede.create({
        data: createSedeDto,
        include: {
          zona: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          _count: {
            select: {
              grifos: true
            }
          }
        }
      });

      return this.transformToResponseDto(sede);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la sede');
    }
  }

  async findAll(queryDto: QuerySedeDto) {
    const { page, limit, search, zonaId, activo, orderBy, orderDirection } = queryDto;
    const offset = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {};

    if (search) {
      where.OR = [
        {
          nombre: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          codigo: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          direccion: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (zonaId) {
      where.zonaId = zonaId;
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Contar total de registros
    const total = await this.prisma.sede.count({ where });

    // Obtener sedes con paginación
    const sedes = await this.prisma.sede.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        zona: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            grifos: true
          }
        }
      }
    });

    const sedesTransformadas = sedes.map(sede => this.transformToResponseDto(sede));

    // Calcular metadata avanzada
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const nextOffset = hasNext ? offset + limit : null;
    const prevOffset = hasPrevious ? Math.max(0, offset - limit) : null;

    return {
      data: sedesTransformadas,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages,
        offset,
        limit,
        nextOffset,
        prevOffset,
        hasNext,
        hasPrevious
      }
    };
  }

  async findOne(id: number): Promise<SedeResponseDto> {
    const sede = await this.prisma.sede.findUnique({
      where: { id },
      include: {
        zona: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            grifos: true
          }
        },
        grifos: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            activo: true
          }
        }
      }
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }

    return this.transformToResponseDto(sede);
  }

  async update(id: number, updateSedeDto: UpdateSedeDto): Promise<SedeResponseDto> {
    try {
      // Verificar si la sede existe
      const existingSede = await this.prisma.sede.findUnique({
        where: { id }
      });

      if (!existingSede) {
        throw new NotFoundException(`Sede con ID ${id} no encontrada`);
      }

      // Verificar si se está cambiando de zona
      if (updateSedeDto.zonaId && updateSedeDto.zonaId !== existingSede.zonaId) {
        const zona = await this.prisma.zona.findUnique({
          where: { id: updateSedeDto.zonaId }
        });

        if (!zona) {
          throw new NotFoundException(`Zona con ID ${updateSedeDto.zonaId} no encontrada`);
        }

        if (!zona.activo) {
          throw new BadRequestException(`No se puede mover la sede a una zona inactiva`);
        }
      }

      // Verificar conflictos de código (si se está actualizando)
      if (updateSedeDto.codigo && updateSedeDto.codigo !== existingSede.codigo) {
        const conflictingSede = await this.prisma.sede.findUnique({
          where: { codigo: updateSedeDto.codigo }
        });

        if (conflictingSede) {
          throw new ConflictException(`Ya existe una sede con el código: ${updateSedeDto.codigo}`);
        }
      }

      // Verificar conflictos de nombre en la zona (si se está actualizando)
      if (updateSedeDto.nombre && updateSedeDto.nombre !== existingSede.nombre) {
        const targetZonaId = updateSedeDto.zonaId || existingSede.zonaId;
        const conflictingSede = await this.prisma.sede.findFirst({
          where: { 
            nombre: {
              equals: updateSedeDto.nombre,
              mode: 'insensitive'
            },
            zonaId: targetZonaId,
            NOT: { id }
          }
        });

        if (conflictingSede) {
          throw new ConflictException(`Ya existe una sede con el nombre "${updateSedeDto.nombre}" en esta zona`);
        }
      }

      const sede = await this.prisma.sede.update({
        where: { id },
        data: updateSedeDto,
        include: {
          zona: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          _count: {
            select: {
              grifos: true
            }
          }
        }
      });

      return this.transformToResponseDto(sede);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar la sede');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar si la sede existe
      const sede = await this.prisma.sede.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              grifos: true
            }
          }
        }
      });

      if (!sede) {
        throw new NotFoundException(`Sede con ID ${id} no encontrada`);
      }

      // Verificar si tiene dependencias
      if (sede._count.grifos > 0) {
        throw new ConflictException(
          `No se puede eliminar la sede porque tiene ${sede._count.grifos} grifo(s) asociado(s). Elimine o reasigne los grifos primero.`
        );
      }

      await this.prisma.sede.delete({
        where: { id }
      });

      return {
        message: `Sede "${sede.nombre}" eliminada exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la sede');
    }
  }

  async toggleStatus(id: number): Promise<SedeResponseDto> {
    const sede = await this.prisma.sede.findUnique({
      where: { id }
    });

    if (!sede) {
      throw new NotFoundException(`Sede con ID ${id} no encontrada`);
    }

    const updatedSede = await this.prisma.sede.update({
      where: { id },
      data: { activo: !sede.activo },
      include: {
        zona: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            grifos: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedSede);
  }

  async findByCode(codigo: string): Promise<SedeResponseDto> {
    const sede = await this.prisma.sede.findUnique({
      where: { codigo },
      include: {
        zona: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            grifos: true
          }
        }
      }
    });

    if (!sede) {
      throw new NotFoundException(`Sede con código ${codigo} no encontrada`);
    }

    return this.transformToResponseDto(sede);
  }

  async findByZona(zonaId: number): Promise<SedeResponseDto[]> {
    const sedes = await this.prisma.sede.findMany({
      where: { 
        zonaId,
        activo: true 
      },
      include: {
        zona: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            grifos: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return sedes.map(sede => this.transformToResponseDto(sede));
  }

  // Método para obtener estadísticas de sedes
  // async getStats() {
  //   const [total, activas, inactivas, conGrifos, porZona] = await Promise.all([
  //     this.prisma.sede.count(),
  //     this.prisma.sede.count({ where: { activo: true } }),
  //     this.prisma.sede.count({ where: { activo: false } }),
  //     this.prisma.sede.count({
  //       where: {
  //         grifos: {
  //           some: {}
  //         }
  //       }
  //     }),
  //     this.prisma.sede.groupBy({
  //       by: ['zonaId'],
  //       _count: {
  //         id: true
  //       },
  //       include: {
  //         zona: {
  //           select: {
  //             nombre: true
  //           }
  //         }
  //       }
  //     })
  //   ]);

  //   return {
  //     total,
  //     activas,
  //     inactivas,
  //     conGrifos,
  //     sinGrifos: total - conGrifos,
  //     distribucePorZona: porZona
  //   };
  // }

  // Método privado para transformar la entidad a DTO de respuesta
  private transformToResponseDto(sede: any): SedeResponseDto {
    return plainToInstance(SedeResponseDto, {
      ...sede,
      grifosCount: sede._count?.grifos || 0
    }, {
      excludeExtraneousValues: true
    });
  }
}