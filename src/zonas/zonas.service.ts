// =============================================
// src/zonas/zonas.service.ts
// =============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { QueryZonaDto } from './dto/query-zona.dto';
import { ZonaResponseDto } from './dto/zona-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ZonasService {
  constructor(private prisma: PrismaService) {}

  async create(createZonaDto: CreateZonaDto): Promise<ZonaResponseDto> {
    try {
      // Verificar si el código ya existe (si se proporciona)
      if (createZonaDto.codigo) {
        const existingZona = await this.prisma.zona.findUnique({
          where: { codigo: createZonaDto.codigo }
        });

        if (existingZona) {
          throw new ConflictException(`Ya existe una zona con el código: ${createZonaDto.codigo}`);
        }
      }

      // Verificar si el nombre ya existe
      const existingZonaByName = await this.prisma.zona.findFirst({
        where: { 
          nombre: {
            equals: createZonaDto.nombre,
            mode: 'insensitive'
          }
        }
      });

      if (existingZonaByName) {
        throw new ConflictException(`Ya existe una zona con el nombre: ${createZonaDto.nombre}`);
      }

      const zona = await this.prisma.zona.create({
        data: createZonaDto,
        include: {
          _count: {
            select: {
              sedes: true,
              unidades: true
            }
          }
        }
      });

      return this.transformToResponseDto(zona);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la zona');
    }
  }

  async findAll(queryDto: QueryZonaDto) {
    const { page, limit, search, activo, orderBy, orderDirection } = queryDto;
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
        }
      ];
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Contar total de registros
    const total = await this.prisma.zona.count({ where });

    // Obtener zonas con paginación
    const zonas = await this.prisma.zona.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        _count: {
          select: {
            sedes: true,
            unidades: true
          }
        }
      }
    });

    const zonasTransformadas = zonas.map(zona => this.transformToResponseDto(zona));

    // Calcular metadata avanzada
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const nextOffset = hasNext ? offset + limit : null;
    const prevOffset = hasPrevious ? Math.max(0, offset - limit) : null;

    return {
      data: zonasTransformadas,
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

  async findOne(id: number): Promise<ZonaResponseDto> {
    const zona = await this.prisma.zona.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sedes: true,
            unidades: true
          }
        },
        sedes: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            activo: true
          }
        }
      }
    });

    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }

    return this.transformToResponseDto(zona);
  }

  async update(id: number, updateZonaDto: UpdateZonaDto): Promise<ZonaResponseDto> {
    try {
      // Verificar si la zona existe
      const existingZona = await this.prisma.zona.findUnique({
        where: { id }
      });

      if (!existingZona) {
        throw new NotFoundException(`Zona con ID ${id} no encontrada`);
      }

      // Verificar conflictos de código (si se está actualizando)
      if (updateZonaDto.codigo && updateZonaDto.codigo !== existingZona.codigo) {
        const conflictingZona = await this.prisma.zona.findUnique({
          where: { codigo: updateZonaDto.codigo }
        });

        if (conflictingZona) {
          throw new ConflictException(`Ya existe una zona con el código: ${updateZonaDto.codigo}`);
        }
      }

      // Verificar conflictos de nombre (si se está actualizando)
      if (updateZonaDto.nombre && updateZonaDto.nombre !== existingZona.nombre) {
        const conflictingZona = await this.prisma.zona.findFirst({
          where: { 
            nombre: {
              equals: updateZonaDto.nombre,
              mode: 'insensitive'
            },
            NOT: { id }
          }
        });

        if (conflictingZona) {
          throw new ConflictException(`Ya existe una zona con el nombre: ${updateZonaDto.nombre}`);
        }
      }

      const zona = await this.prisma.zona.update({
        where: { id },
        data: updateZonaDto,
        include: {
          _count: {
            select: {
              sedes: true,
              unidades: true
            }
          }
        }
      });

      return this.transformToResponseDto(zona);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar la zona');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar si la zona existe
      const zona = await this.prisma.zona.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              sedes: true,
              unidades: true
            }
          }
        }
      });

      if (!zona) {
        throw new NotFoundException(`Zona con ID ${id} no encontrada`);
      }

      // Verificar si tiene dependencias
      if (zona._count.sedes > 0) {
        throw new ConflictException(
          `No se puede eliminar la zona porque tiene ${zona._count.sedes} sede(s) asociada(s). Elimine o reasigne las sedes primero.`
        );
      }

      if (zona._count.unidades > 0) {
        throw new ConflictException(
          `No se puede eliminar la zona porque tiene ${zona._count.unidades} unidad(es) asociada(s). Reasigne las unidades primero.`
        );
      }

      await this.prisma.zona.delete({
        where: { id }
      });

      return {
        message: `Zona "${zona.nombre}" eliminada exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la zona');
    }
  }

  async toggleStatus(id: number): Promise<ZonaResponseDto> {
    const zona = await this.prisma.zona.findUnique({
      where: { id }
    });

    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }

    const updatedZona = await this.prisma.zona.update({
      where: { id },
      data: { activo: !zona.activo },
      include: {
        _count: {
          select: {
            sedes: true,
            unidades: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedZona);
  }

  async findByCode(codigo: string): Promise<ZonaResponseDto> {
    const zona = await this.prisma.zona.findUnique({
      where: { codigo },
      include: {
        _count: {
          select: {
            sedes: true,
            unidades: true
          }
        }
      }
    });

    if (!zona) {
      throw new NotFoundException(`Zona con código ${codigo} no encontrada`);
    }

    return this.transformToResponseDto(zona);
  }

  // Método para obtener estadísticas de zonas
  async getStats() {
    const [total, activas, inactivas, conSedes, conUnidades] = await Promise.all([
      this.prisma.zona.count(),
      this.prisma.zona.count({ where: { activo: true } }),
      this.prisma.zona.count({ where: { activo: false } }),
      this.prisma.zona.count({
        where: {
          sedes: {
            some: {}
          }
        }
      }),
      this.prisma.zona.count({
        where: {
          unidades: {
            some: {}
          }
        }
      })
    ]);

    return {
      total,
      activas,
      inactivas,
      conSedes,
      conUnidades,
      sinAsignar: total - Math.max(conSedes, conUnidades)
    };
  }

  // Método privado para transformar la entidad a DTO de respuesta
  private transformToResponseDto(zona: any): ZonaResponseDto {
    return plainToInstance(ZonaResponseDto, {
      ...zona,
      sedesCount: zona._count?.sedes || 0,
      unidadesCount: zona._count?.unidades || 0
    }, {
      excludeExtraneousValues: true
    });
  }
}