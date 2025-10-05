// =============================================
// src/grifos/grifos.service.ts
// =============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateGrifoDto } from './dto/create-grifo.dto';
import { UpdateGrifoDto } from './dto/update-grifo.dto';
import { QueryGrifoDto } from './dto/query-grifo.dto';
import { GrifoResponseDto } from './dto/grifo-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class GrifosService {
  constructor(private prisma: PrismaService) {}

  async create(createGrifoDto: CreateGrifoDto): Promise<GrifoResponseDto> {
    try {
      // Verificar si la sede existe
      const sede = await this.prisma.sede.findUnique({
        where: { id: createGrifoDto.sedeId },
        include: {
          zona: true
        }
      });

      if (!sede) {
        throw new NotFoundException(`Sede con ID ${createGrifoDto.sedeId} no encontrada`);
      }

      if (!sede.activo) {
        throw new BadRequestException(`No se puede crear un grifo en una sede inactiva`);
      }

      if (!sede.zona.activo) {
        throw new BadRequestException(`No se puede crear un grifo en una zona inactiva`);
      }

      // Verificar si el código ya existe (si se proporciona)
      if (createGrifoDto.codigo) {
        const existingGrifo = await this.prisma.grifo.findUnique({
          where: { codigo: createGrifoDto.codigo }
        });

        if (existingGrifo) {
          throw new ConflictException(`Ya existe un grifo con el código: ${createGrifoDto.codigo}`);
        }
      }

      // Verificar si el nombre ya existe en la misma sede
      const existingGrifoByName = await this.prisma.grifo.findFirst({
        where: { 
          nombre: {
            equals: createGrifoDto.nombre,
            mode: 'insensitive'
          },
          sedeId: createGrifoDto.sedeId
        }
      });

      if (existingGrifoByName) {
        throw new ConflictException(`Ya existe un grifo con el nombre "${createGrifoDto.nombre}" en esta sede`);
      }

      // Validar horarios
      if (createGrifoDto.horarioApertura && createGrifoDto.horarioCierre) {
        this.validateHorarios(createGrifoDto.horarioApertura, createGrifoDto.horarioCierre);
      }

      // Preparar datos para crear
      // const data: any = { ...createGrifoDto };
      
      // // Convertir horarios a formato DateTime para Prisma
      // if (data.horarioApertura) {
      //   data.horarioApertura = new Date(`1970-01-01T${data.horarioApertura}:00Z`);
      // }
      // if (data.horarioCierre) {
      //   data.horarioCierre = new Date(`1970-01-01T${data.horarioCierre}:00Z`);
      // }

      const grifo = await this.prisma.grifo.create({
        data: createGrifoDto,
        include: {
          sede: {
            include: {
              zona: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              }
            }
          },
          _count: {
            select: {
              ticketsAbastecimiento: true
            }
          }
        }
      });

      return this.transformToResponseDto(grifo);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el grifo');
    }
  }

  async findAll(queryDto: QueryGrifoDto) {
    const { page, limit, search, sedeId, zonaId, activo, soloAbiertos, orderBy, orderDirection } = queryDto;
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

    if (sedeId) {
      where.sedeId = sedeId;
    }

    if (zonaId) {
      where.sede = {
        zonaId: zonaId
      };
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Contar total de registros
    const total = await this.prisma.grifo.count({ where });

    // Obtener grifos con paginación
    const grifos = await this.prisma.grifo.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            ticketsAbastecimiento: true
          }
        }
      }
    });

    let grifosTransformados = grifos.map(grifo => this.transformToResponseDto(grifo));

    // Filtrar solo abiertos si se solicita
    if (soloAbiertos) {
      grifosTransformados = grifosTransformados.filter(grifo => grifo.estaAbierto);
    }

    // Calcular metadata avanzada
    const finalTotal = soloAbiertos ? grifosTransformados.length : total;
    const totalPages = Math.ceil(finalTotal / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const nextOffset = hasNext ? offset + limit : null;
    const prevOffset = hasPrevious ? Math.max(0, offset - limit) : null;

    // Si se filtró por "soloAbiertos", aplicar paginación manual
    if (soloAbiertos) {
      grifosTransformados = grifosTransformados.slice(offset, offset + limit);
    }

    return {
      data: grifosTransformados,
      meta: {
        total: finalTotal,
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

  async findOne(id: number): Promise<GrifoResponseDto> {
    const grifo = await this.prisma.grifo.findUnique({
      where: { id },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            // abastecimientos: true
          }
        }
      }
    });

    if (!grifo) {
      throw new NotFoundException(`Grifo con ID ${id} no encontrado`);
    }

    return this.transformToResponseDto(grifo);
  }

  async update(id: number, updateGrifoDto: UpdateGrifoDto): Promise<GrifoResponseDto> {
    try {
      // Verificar si el grifo existe
      const existingGrifo = await this.prisma.grifo.findUnique({
        where: { id }
      });

      if (!existingGrifo) {
        throw new NotFoundException(`Grifo con ID ${id} no encontrado`);
      }

      // Verificar si se está cambiando de sede
      if (updateGrifoDto.sedeId && updateGrifoDto.sedeId !== existingGrifo.sedeId) {
        const sede = await this.prisma.sede.findUnique({
          where: { id: updateGrifoDto.sedeId },
          include: { zona: true }
        });

        if (!sede) {
          throw new NotFoundException(`Sede con ID ${updateGrifoDto.sedeId} no encontrada`);
        }

        if (!sede.activo) {
          throw new BadRequestException(`No se puede mover el grifo a una sede inactiva`);
        }

        if (!sede.zona.activo) {
          throw new BadRequestException(`No se puede mover el grifo a una zona inactiva`);
        }
      }

      // Verificar conflictos de código (si se está actualizando)
      if (updateGrifoDto.codigo && updateGrifoDto.codigo !== existingGrifo.codigo) {
        const conflictingGrifo = await this.prisma.grifo.findUnique({
          where: { codigo: updateGrifoDto.codigo }
        });

        if (conflictingGrifo) {
          throw new ConflictException(`Ya existe un grifo con el código: ${updateGrifoDto.codigo}`);
        }
      }

      // Verificar conflictos de nombre en la sede (si se está actualizando)
      if (updateGrifoDto.nombre && updateGrifoDto.nombre !== existingGrifo.nombre) {
        const targetSedeId = updateGrifoDto.sedeId || existingGrifo.sedeId;
        const conflictingGrifo = await this.prisma.grifo.findFirst({
          where: { 
            nombre: {
              equals: updateGrifoDto.nombre,
              mode: 'insensitive'
            },
            sedeId: targetSedeId,
            NOT: { id }
          }
        });

        if (conflictingGrifo) {
          throw new ConflictException(`Ya existe un grifo con el nombre "${updateGrifoDto.nombre}" en esta sede`);
        }
      }

      // Validar horarios si se están actualizando
      // const horarioApertura = updateGrifoDto.horarioApertura || this.formatTimeFromDate(existingGrifo.horarioApertura);
      // const horarioCierre = updateGrifoDto.horarioCierre || this.formatTimeFromDate(existingGrifo.horarioCierre);
      const horarioApertura = updateGrifoDto.horarioApertura || existingGrifo.horarioApertura;
      const horarioCierre = updateGrifoDto.horarioCierre || existingGrifo.horarioCierre;
      
      if (horarioApertura && horarioCierre) {
        this.validateHorarios(horarioApertura, horarioCierre);
      }

      // Preparar datos para actualizar
      const data: any = { ...updateGrifoDto };
      
      // Convertir horarios a formato DateTime para Prisma
      if (data.horarioApertura) {
        data.horarioApertura = new Date(`1970-01-01T${data.horarioApertura}:00Z`);
      }
      if (data.horarioCierre) {
        data.horarioCierre = new Date(`1970-01-01T${data.horarioCierre}:00Z`);
      }

      const grifo = await this.prisma.grifo.update({
        where: { id },
        data,
        include: {
          sede: {
            include: {
              zona: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              }
            }
          },
          _count: {
            select: {
              // abastecimientos: true
            }
          }
        }
      });

      return this.transformToResponseDto(grifo);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el grifo');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar si el grifo existe
      const grifo = await this.prisma.grifo.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              // abastecimientos: true
            }
          }
        }
      });

      if (!grifo) {
        throw new NotFoundException(`Grifo con ID ${id} no encontrado`);
      }

      // Verificar si tiene dependencias
      // if (grifo._count.abastecimientos > 0) {
      //   throw new ConflictException(
      //     `No se puede eliminar el grifo porque tiene ${grifo._count.abastecimientos} abastecimiento(s) registrado(s). Los registros históricos deben conservarse.`
      //   );
      // }

      await this.prisma.grifo.delete({
        where: { id }
      });

      return {
        message: `Grifo "${grifo.nombre}" eliminado exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el grifo');
    }
  }

  async toggleStatus(id: number): Promise<GrifoResponseDto> {
    const grifo = await this.prisma.grifo.findUnique({
      where: { id }
    });

    if (!grifo) {
      throw new NotFoundException(`Grifo con ID ${id} no encontrado`);
    }

    const updatedGrifo = await this.prisma.grifo.update({
      where: { id },
      data: { activo: !grifo.activo },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            // abastecimientos: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedGrifo);
  }

  async findByCode(codigo: string): Promise<GrifoResponseDto> {
    const grifo = await this.prisma.grifo.findUnique({
      where: { codigo },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            // abastecimientos: true
          }
        }
      }
    });

    if (!grifo) {
      throw new NotFoundException(`Grifo con código ${codigo} no encontrado`);
    }

    return this.transformToResponseDto(grifo);
  }

  async findBySede(sedeId: number): Promise<GrifoResponseDto[]> {
    const grifos = await this.prisma.grifo.findMany({
      where: { 
        sedeId,
        activo: true 
      },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            ticketsAbastecimiento: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return grifos.map(grifo => this.transformToResponseDto(grifo));
  }

  async findByZona(zonaId: number): Promise<GrifoResponseDto[]> {
    const grifos = await this.prisma.grifo.findMany({
      where: { 
        sede: {
          zonaId: zonaId
        },
        activo: true 
      },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            // abastecimientos: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return grifos.map(grifo => this.transformToResponseDto(grifo));
  }

  async findAbiertos(): Promise<GrifoResponseDto[]> {
    const grifos = await this.prisma.grifo.findMany({
      where: { 
        activo: true
      },
      include: {
        sede: {
          include: {
            zona: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          }
        },
        _count: {
          select: {
            // abastecimientos: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    const grifosTransformados = grifos.map(grifo => this.transformToResponseDto(grifo));
    return grifosTransformados.filter(grifo => grifo.estaAbierto);
  }

  // Método para obtener estadísticas de grifos
  async getStats() {
    const [total, activos, inactivos, conAbastecimientos, abiertos] = await Promise.all([
      this.prisma.grifo.count(),
      this.prisma.grifo.count({ where: { activo: true } }),
      this.prisma.grifo.count({ where: { activo: false } }),
      this.prisma.grifo.count({
        where: {
          ticketsAbastecimiento: {
            some: {}
          }
        }
      }),
      this.findAbiertos().then(grifos => grifos.length)
    ]);

    const distribucePorSede = await this.prisma.grifo.groupBy({
      by: ['sedeId'],
      _count: {
        id: true
      }
    });

    return {
      total,
      activos,
      inactivos,
      conAbastecimientos,
      sinAbastecimientos: total - conAbastecimientos,
      abiertos,
      cerrados: activos - abiertos,
      distribucePorSede
    };
  }

  // Métodos auxiliares privados
  private validateHorarios(apertura: string, cierre: string): void {
    const [horaApertura, minutoApertura] = apertura.split(':').map(Number);
    const [horaCierre, minutoCierre] = cierre.split(':').map(Number);
    
    const minutosApertura = horaApertura * 60 + minutoApertura;
    const minutosCierre = horaCierre * 60 + minutoCierre;
    
    if (minutosApertura >= minutosCierre) {
      throw new BadRequestException('El horario de apertura debe ser anterior al horario de cierre');
    }
  }

  private formatTimeFromDate(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().substring(11, 16); // Extrae HH:MM
  }

  private isAbierto(horarioApertura: string | null, horarioCierre: string | null): boolean {
    if (!horarioApertura || !horarioCierre) {
      return true; // Si no hay horarios definidos, se considera abierto
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [horaApertura, minApertura] = horarioApertura.split(':').map(Number);
    const [horaCierre, minCierre] = horarioCierre.split(':').map(Number);
    
    const apertura = horaApertura * 60 + minApertura;
    const cierre = horaCierre * 60 + minCierre;
    
    return currentTime >= apertura && currentTime <= cierre;
  }

  // Método privado para transformar la entidad a DTO de respuesta
  private transformToResponseDto(grifo: any): GrifoResponseDto {
  return plainToInstance(GrifoResponseDto, {
    ...grifo,
    // ✅ Asegúrate de incluir el count
    ticketsAbastecimientoCount: grifo._count?.ticketsAbastecimiento || 0,
    estaAbierto: this.isAbierto(grifo.horarioApertura, grifo.horarioCierre) && grifo.activo,
    // ✅ Asegúrate de que la zona se incluya correctamente
    sede: {
      ...grifo.sede,
      zona: grifo.sede?.zona || null
    }
  }, {
    excludeExtraneousValues: true
  });
}
}