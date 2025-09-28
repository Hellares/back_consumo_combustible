// =============================================
// src/licencias-conducir/licencias-conducir.service.ts
// =============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

import { QueryLicenciaConducirDto } from './dto/query-licencia-conducir.dto';
import { LicenciaConducirResponseDto } from './dto/licencia-conducir-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma.service';
import { CreateLicenciaConducirDto } from './dto/create-licencias_conducir.dto';
import { UpdateLicenciaConducirDto } from './dto/update-licencias_conducir.dto';

@Injectable()
export class LicenciasConducirService {
  constructor(private prisma: PrismaService) {}

  async create(createLicenciaConducirDto: CreateLicenciaConducirDto): Promise<LicenciaConducirResponseDto> {
    try {
      // Verificar si el usuario existe
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createLicenciaConducirDto.usuarioId }
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${createLicenciaConducirDto.usuarioId} no encontrado`);
      }

      if (!usuario.activo) {
        throw new BadRequestException(`No se puede asignar una licencia a un usuario inactivo`);
      }

      // Verificar si el número de licencia ya existe
      const existingLicencia = await this.prisma.licenciaConducir.findUnique({
        where: { numeroLicencia: createLicenciaConducirDto.numeroLicencia }
      });

      if (existingLicencia) {
        throw new ConflictException(`Ya existe una licencia con el número: ${createLicenciaConducirDto.numeroLicencia}`);
      }

      // Validar fechas
      this.validateFechas(createLicenciaConducirDto.fechaEmision, createLicenciaConducirDto.fechaExpiracion);

      // Verificar si el usuario ya tiene una licencia activa de la misma categoría
      const licenciaExistenteMismaCategoria = await this.prisma.licenciaConducir.findFirst({
        where: {
          usuarioId: createLicenciaConducirDto.usuarioId,
          categoria: createLicenciaConducirDto.categoria,
          activo: true
        }
      });

      if (licenciaExistenteMismaCategoria) {
        throw new ConflictException(`El usuario ya tiene una licencia activa de categoría ${createLicenciaConducirDto.categoria}`);
      }

      // Convertir fechas a formato Date
      const data = {
        ...createLicenciaConducirDto,
        fechaEmision: new Date(createLicenciaConducirDto.fechaEmision),
        fechaExpiracion: new Date(createLicenciaConducirDto.fechaExpiracion)
      };

      const licencia = await this.prisma.licenciaConducir.create({
        data,
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              codigoEmpleado: true
            }
          }
        }
      });

      return this.transformToResponseDto(licencia);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la licencia de conducir');
    }
  }

  async findAll(queryDto: QueryLicenciaConducirDto) {
    const { page, limit, search, usuarioId, categoria, activo, estadoVigencia, soloVencidas, proximasVencer, orderBy, orderDirection } = queryDto;
    const offset = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {};

    if (search) {
      where.OR = [
        {
          numeroLicencia: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          categoria: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          usuario: {
            OR: [
              {
                nombres: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                apellidos: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                dni: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                codigoEmpleado: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ];
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Filtros por estado de vigencia
    const today = new Date();
    const in90Days = new Date();
    in90Days.setDate(today.getDate() + 90);

    if (soloVencidas) {
      where.fechaExpiracion = {
        lt: today
      };
    }

    if (proximasVencer) {
      where.fechaExpiracion = {
        gte: today,
        lte: in90Days
      };
    }

    if (estadoVigencia) {
      switch (estadoVigencia) {
        case 'VENCIDA':
          where.fechaExpiracion = { lt: today };
          break;
        case 'PRÓXIMO_VENCIMIENTO':
          where.fechaExpiracion = { gte: today, lte: in90Days };
          break;
        case 'VIGENTE':
          where.fechaExpiracion = { gt: in90Days };
          break;
      }
    }

    // Contar total de registros
    const total = await this.prisma.licenciaConducir.count({ where });

    // Obtener licencias con paginación
    const licencias = await this.prisma.licenciaConducir.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      }
    });

    const licenciasTransformadas = licencias.map(licencia => this.transformToResponseDto(licencia));

    // Calcular metadata avanzada
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const nextOffset = hasNext ? offset + limit : null;
    const prevOffset = hasPrevious ? Math.max(0, offset - limit) : null;

    return {
      data: licenciasTransformadas,
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

  async findOne(id: number): Promise<LicenciaConducirResponseDto> {
    const licencia = await this.prisma.licenciaConducir.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true,
            telefono: true,
            email: true
          }
        }
      }
    });

    if (!licencia) {
      throw new NotFoundException(`Licencia de conducir con ID ${id} no encontrada`);
    }

    return this.transformToResponseDto(licencia);
  }

  async update(id: number, updateLicenciaConducirDto: UpdateLicenciaConducirDto): Promise<LicenciaConducirResponseDto> {
    try {
      // Verificar si la licencia existe
      const existingLicencia = await this.prisma.licenciaConducir.findUnique({
        where: { id }
      });

      if (!existingLicencia) {
        throw new NotFoundException(`Licencia de conducir con ID ${id} no encontrada`);
      }

      // Verificar si se está cambiando de usuario
      if (updateLicenciaConducirDto.usuarioId && updateLicenciaConducirDto.usuarioId !== existingLicencia.usuarioId) {
        const usuario = await this.prisma.usuario.findUnique({
          where: { id: updateLicenciaConducirDto.usuarioId }
        });

        if (!usuario) {
          throw new NotFoundException(`Usuario con ID ${updateLicenciaConducirDto.usuarioId} no encontrado`);
        }

        if (!usuario.activo) {
          throw new BadRequestException(`No se puede asignar la licencia a un usuario inactivo`);
        }
      }

      // Verificar conflictos de número de licencia (si se está actualizando)
      if (updateLicenciaConducirDto.numeroLicencia && updateLicenciaConducirDto.numeroLicencia !== existingLicencia.numeroLicencia) {
        const conflictingLicencia = await this.prisma.licenciaConducir.findUnique({
          where: { numeroLicencia: updateLicenciaConducirDto.numeroLicencia }
        });

        if (conflictingLicencia) {
          throw new ConflictException(`Ya existe una licencia con el número: ${updateLicenciaConducirDto.numeroLicencia}`);
        }
      }

      // Validar fechas si se están actualizando
      const fechaEmision = updateLicenciaConducirDto.fechaEmision || existingLicencia.fechaEmision.toISOString().split('T')[0];
      const fechaExpiracion = updateLicenciaConducirDto.fechaExpiracion || existingLicencia.fechaExpiracion.toISOString().split('T')[0];
      
      this.validateFechas(fechaEmision, fechaExpiracion);

      // Verificar conflictos de categoría en el mismo usuario (si se están actualizando ambos)
      const targetUsuarioId = updateLicenciaConducirDto.usuarioId || existingLicencia.usuarioId;
      const targetCategoria = updateLicenciaConducirDto.categoria || existingLicencia.categoria;

      if ((updateLicenciaConducirDto.usuarioId || updateLicenciaConducirDto.categoria) && 
          (targetUsuarioId !== existingLicencia.usuarioId || targetCategoria !== existingLicencia.categoria)) {
        const conflictingLicencia = await this.prisma.licenciaConducir.findFirst({
          where: {
            usuarioId: targetUsuarioId,
            categoria: targetCategoria,
            activo: true,
            NOT: { id }
          }
        });

        if (conflictingLicencia) {
          throw new ConflictException(`El usuario ya tiene una licencia activa de categoría ${targetCategoria}`);
        }
      }

      // Preparar datos para actualizar
      const data: any = { ...updateLicenciaConducirDto };
      
      // Convertir fechas a formato Date para Prisma
      if (data.fechaEmision) {
        data.fechaEmision = new Date(data.fechaEmision);
      }
      if (data.fechaExpiracion) {
        data.fechaExpiracion = new Date(data.fechaExpiracion);
      }

      const licencia = await this.prisma.licenciaConducir.update({
        where: { id },
        data,
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              codigoEmpleado: true
            }
          }
        }
      });

      return this.transformToResponseDto(licencia);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar la licencia de conducir');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar si la licencia existe
      const licencia = await this.prisma.licenciaConducir.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      if (!licencia) {
        throw new NotFoundException(`Licencia de conducir con ID ${id} no encontrada`);
      }

      await this.prisma.licenciaConducir.delete({
        where: { id }
      });

      return {
        message: `Licencia ${licencia.numeroLicencia} de ${licencia.usuario.nombres} ${licencia.usuario.apellidos} eliminada exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la licencia de conducir');
    }
  }

  async toggleStatus(id: number): Promise<LicenciaConducirResponseDto> {
    const licencia = await this.prisma.licenciaConducir.findUnique({
      where: { id }
    });

    if (!licencia) {
      throw new NotFoundException(`Licencia de conducir con ID ${id} no encontrada`);
    }

    const updatedLicencia = await this.prisma.licenciaConducir.update({
      where: { id },
      data: { activo: !licencia.activo },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedLicencia);
  }

  async findByNumero(numeroLicencia: string): Promise<LicenciaConducirResponseDto> {
    const licencia = await this.prisma.licenciaConducir.findUnique({
      where: { numeroLicencia },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      }
    });

    if (!licencia) {
      throw new NotFoundException(`Licencia con número ${numeroLicencia} no encontrada`);
    }

    return this.transformToResponseDto(licencia);
  }

  async findByUsuario(usuarioId: number): Promise<LicenciaConducirResponseDto[]> {
    const licencias = await this.prisma.licenciaConducir.findMany({
      where: { 
        usuarioId,
        activo: true 
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      },
      orderBy: { fechaExpiracion: 'asc' }
    });

    return licencias.map(licencia => this.transformToResponseDto(licencia));
  }

  async findProximasVencer(dias: number = 90): Promise<LicenciaConducirResponseDto[]> {
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + dias);

    const licencias = await this.prisma.licenciaConducir.findMany({
      where: {
        activo: true,
        fechaExpiracion: {
          gte: today,
          lte: limitDate
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      },
      orderBy: { fechaExpiracion: 'asc' }
    });

    return licencias.map(licencia => this.transformToResponseDto(licencia));
  }

  async findVencidas(): Promise<LicenciaConducirResponseDto[]> {
    const today = new Date();

    const licencias = await this.prisma.licenciaConducir.findMany({
      where: {
        activo: true,
        fechaExpiracion: {
          lt: today
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      },
      orderBy: { fechaExpiracion: 'desc' }
    });

    return licencias.map(licencia => this.transformToResponseDto(licencia));
  }

  async findByCategoria(categoria: string): Promise<LicenciaConducirResponseDto[]> {
    const licencias = await this.prisma.licenciaConducir.findMany({
      where: { 
        categoria,
        activo: true 
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      },
      orderBy: { fechaExpiracion: 'asc' }
    });

    return licencias.map(licencia => this.transformToResponseDto(licencia));
  }

  // Método para obtener estadísticas de licencias
  async getStats() {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    const in90Days = new Date();
    in90Days.setDate(today.getDate() + 90);

    const [total, activas, inactivas, vencidas, proximasVencer30, proximasVencer90, porCategoria] = await Promise.all([
      this.prisma.licenciaConducir.count(),
      this.prisma.licenciaConducir.count({ where: { activo: true } }),
      this.prisma.licenciaConducir.count({ where: { activo: false } }),
      this.prisma.licenciaConducir.count({
        where: {
          activo: true,
          fechaExpiracion: { lt: today }
        }
      }),
      this.prisma.licenciaConducir.count({
        where: {
          activo: true,
          fechaExpiracion: { gte: today, lte: in30Days }
        }
      }),
      this.prisma.licenciaConducir.count({
        where: {
          activo: true,
          fechaExpiracion: { gte: today, lte: in90Days }
        }
      }),
      this.prisma.licenciaConducir.groupBy({
        by: ['categoria'],
        _count: {
          id: true
        },
        where: { activo: true },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      })
    ]);

    return {
      total,
      activas,
      inactivas,
      vencidas,
      vigentes: activas - vencidas - proximasVencer90,
      proximasVencer30,
      proximasVencer90,
      distribucePorCategoria: porCategoria.map(item => ({
        categoria: item.categoria,
        cantidad: item._count.id
      }))
    };
  }

  // Métodos auxiliares privados
  private validateFechas(fechaEmision: string, fechaExpiracion: string): void {
    const emision = new Date(fechaEmision);
    const expiracion = new Date(fechaExpiracion);
    const today = new Date();

    if (emision >= expiracion) {
      throw new BadRequestException('La fecha de emisión debe ser anterior a la fecha de expiración');
    }

    if (emision > today) {
      throw new BadRequestException('La fecha de emisión no puede ser futura');
    }

    // Validar que la licencia tenga una duración razonable (mínimo 1 año, máximo 20 años)
    const diffYears = expiracion.getFullYear() - emision.getFullYear();
    if (diffYears < 1) {
      throw new BadRequestException('La licencia debe tener una vigencia mínima de 1 año');
    }
    if (diffYears > 20) {
      throw new BadRequestException('La licencia no puede tener una vigencia mayor a 20 años');
    }
  }

  private calculateDaysRemaining(fechaExpiracion: Date): number {
    const today = new Date();
    const diffTime = fechaExpiracion.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getEstadoVigencia(fechaExpiracion: Date): string {
    const diasRestantes = this.calculateDaysRemaining(fechaExpiracion);
    
    if (diasRestantes < 0) {
      return 'VENCIDA';
    } else if (diasRestantes <= 90) {
      return 'PRÓXIMO_VENCIMIENTO';
    } else {
      return 'VIGENTE';
    }
  }

  // Método privado para transformar la entidad a DTO de respuesta
  private transformToResponseDto(licencia: any): LicenciaConducirResponseDto {
    const diasRestantes = this.calculateDaysRemaining(licencia.fechaExpiracion);
    const estadoVigencia = this.getEstadoVigencia(licencia.fechaExpiracion);

    return plainToInstance(LicenciaConducirResponseDto, {
      ...licencia,
      fechaEmision: licencia.fechaEmision.toISOString().split('T')[0],
      fechaExpiracion: licencia.fechaExpiracion.toISOString().split('T')[0],
      diasRestantes,
      estaVencida: diasRestantes < 0,
      proximaVencimiento: diasRestantes >= 0 && diasRestantes <= 90,
      estadoVigencia
    }, {
      excludeExtraneousValues: true
    });
  }
}
