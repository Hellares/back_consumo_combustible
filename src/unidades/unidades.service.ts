import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

import { QueryUnidadDto } from './dto/query-unidad.dto';
import { UnidadResponseDto } from './dto/unidad-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUnidadDto } from './dto/create-unidade.dto';
import { UpdateUnidadDto } from './dto/update-unidade.dto';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class UnidadesService {
  constructor(private prisma: PrismaService) {}

  async create(createUnidadDto: CreateUnidadDto): Promise<UnidadResponseDto> {
  try {
    // ✅ 1. Validar fecha antes de hacer consultas DB
    if (createUnidadDto.fechaAdquisicion) {
      this.validateFechaAdquisicion(createUnidadDto.fechaAdquisicion);
    }

    // ✅ 2. Usar transacción para garantizar atomicidad
    const unidad = await this.prisma.$transaction(async (tx) => {
      
      // ✅ 3. Verificar unicidad en paralelo para mayor eficiencia
      const [existingPlaca, existingVin, existingMotor] = await Promise.all([
        tx.unidad.findUnique({ 
          where: { placa: createUnidadDto.placa } 
        }),
        createUnidadDto.nroVin 
          ? tx.unidad.findUnique({ where: { nroVin: createUnidadDto.nroVin } })
          : null,
        createUnidadDto.nroMotor 
          ? tx.unidad.findUnique({ where: { nroMotor: createUnidadDto.nroMotor } })
          : null
      ]);

      // Validar resultados de unicidad
      if (existingPlaca) {
        throw new ConflictException(
          `Ya existe una unidad con la placa: ${createUnidadDto.placa}`
        );
      }

      if (existingVin) {
        throw new ConflictException(
          `Ya existe una unidad con el VIN: ${createUnidadDto.nroVin}`
        );
      }

      if (existingMotor) {
        throw new ConflictException(
          `Ya existe una unidad con el número de motor: ${createUnidadDto.nroMotor}`
        );
      }

      // ✅ 4. Validar conductor y zona en paralelo si existen
      if (createUnidadDto.conductorOperadorId || createUnidadDto.zonaOperacionId) {
        const [conductor, zona, conductorConUnidad] = await Promise.all([
          createUnidadDto.conductorOperadorId
            ? tx.usuario.findUnique({
                where: { id: createUnidadDto.conductorOperadorId },
                select: { id: true, activo: true, nombres: true, apellidos: true }
              })
            : null,
          createUnidadDto.zonaOperacionId
            ? tx.zona.findUnique({
                where: { id: createUnidadDto.zonaOperacionId },
                select: { id: true, activo: true, nombre: true }
              })
            : null,
          createUnidadDto.conductorOperadorId
            ? tx.unidad.findFirst({
                where: {
                  conductorOperadorId: createUnidadDto.conductorOperadorId,
                  activo: true
                },
                select: { id: true, placa: true }
              })
            : null
        ]);

        // Validar conductor
        if (createUnidadDto.conductorOperadorId) {
          if (!conductor) {
            throw new NotFoundException(
              `Conductor con ID ${createUnidadDto.conductorOperadorId} no encontrado`
            );
          }

          if (!conductor.activo) {
            throw new BadRequestException(
              `No se puede asignar un conductor inactivo`
            );
          }

          if (conductorConUnidad) {
            throw new ConflictException(
              `El conductor ${conductor.nombres} ${conductor.apellidos} ya tiene asignada la unidad con placa: ${conductorConUnidad.placa}`
            );
          }
        }

        // Validar zona
        if (createUnidadDto.zonaOperacionId) {
          if (!zona) {
            throw new NotFoundException(
              `Zona con ID ${createUnidadDto.zonaOperacionId} no encontrada`
            );
          }

          if (!zona.activo) {
            throw new BadRequestException(
              `No se puede asignar la zona inactiva: ${zona.nombre}`
            );
          }
        }
      }

      // ✅ 5. Preparar datos con valores por defecto
      const data: any = {
        ...createUnidadDto,
        estado: createUnidadDto.estado || 'OPERATIVO', // ✅ Estado por defecto
        activo: createUnidadDto.activo ?? true, // ✅ Activo por defecto
      };

      // Convertir fecha a formato Date
      if (data.fechaAdquisicion) {
        data.fechaAdquisicion = new Date(data.fechaAdquisicion);
      }

      // ✅ 6. Crear unidad con todos los datos relacionados
      return await tx.unidad.create({
        data,
        include: {
          conductorOperador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              codigoEmpleado: true
            }
          },
          zonaOperacion: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          _count: {
            select: {
              mantenimientos: true,
              fallas: true,
              inspecciones: true
            }
          }
        }
      });
    });

    // ✅ 7. Transformar y retornar
    return this.transformToResponseDto(unidad);

  } catch (error) {
    // ✅ 8. Manejo de errores específicos
    if (
      error instanceof NotFoundException || 
      error instanceof ConflictException || 
      error instanceof BadRequestException
    ) {
      throw error;
    }
    
    // Log del error original para debugging
    console.error('Error al crear unidad:', error);
    
    throw new BadRequestException(
      'Error al crear la unidad. Por favor, verifica los datos e intenta nuevamente.'
    );
  }
}

  async findAll(queryDto: QueryUnidadDto) {
    const { page, limit, search, conductorOperadorId, zonaOperacionId, marca, tipoCombustible, estado, activo, sinConductor, soloOperativas, orderBy, orderDirection } = queryDto;
    const offset = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {};

    if (search) {
      where.OR = [
        {
          placa: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          marca: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          modelo: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          conductorOperador: {
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
              }
            ]
          }
        }
      ];
    }

    if (conductorOperadorId) {
      where.conductorOperadorId = conductorOperadorId;
    }

    if (zonaOperacionId) {
      where.zonaOperacionId = zonaOperacionId;
    }

    if (marca) {
      where.marca = {
        contains: marca,
        mode: 'insensitive'
      };
    }

    if (tipoCombustible) {
      where.tipoCombustible = tipoCombustible;
    }

    if (estado) {
      where.estado = estado;
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (sinConductor) {
      where.conductorOperadorId = null;
    }

    if (soloOperativas) {
      where.estado = {
        in: ['OPERATIVO']
      };
      where.activo = true;
    }

    // Contar total de registros
    const total = await this.prisma.unidad.count({ where });

    // Obtener unidades con paginación
    const unidades = await this.prisma.unidad.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true
          }
        }
      }
    });

    const unidadesTransformadas = unidades.map(unidad => this.transformToResponseDto(unidad));

    // Calcular metadata avanzada - FORMATO IGUAL AL DE USUARIOS
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const nextOffset = hasNext ? offset + limit : null;
    const prevOffset = hasPrevious ? Math.max(0, offset - limit) : null;

    // ✅ RETORNAR EN EL MISMO FORMATO QUE USUARIOS
    return {
      success: true,
      message: 'Unidades obtenidas exitosamente',
      data: {
        data: unidadesTransformadas,
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
      }
    };
  }

  async findOne(id: number): Promise<UnidadResponseDto> {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true,
            telefono: true,
            email: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            descripcion: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true,
            inspecciones: true
          }
        }
      }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    }

    return this.transformToResponseDto(unidad);
  }

  async update(id: number, updateUnidadDto: UpdateUnidadDto): Promise<UnidadResponseDto> {
    try {
      // Verificar si la unidad existe
      const existingUnidad = await this.prisma.unidad.findUnique({
        where: { id }
      });

      if (!existingUnidad) {
        throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
      }

      // Verificar conflictos de placa (si se está actualizando)
      if (updateUnidadDto.placa && updateUnidadDto.placa !== existingUnidad.placa) {
        const conflictingUnidad = await this.prisma.unidad.findUnique({
          where: { placa: updateUnidadDto.placa }
        });

        if (conflictingUnidad) {
          throw new ConflictException(`Ya existe una unidad con la placa: ${updateUnidadDto.placa}`);
        }
      }

      // Verificar conflictos de VIN (si se está actualizando)
      if (updateUnidadDto.nroVin && updateUnidadDto.nroVin !== existingUnidad.nroVin) {
        const conflictingUnidad = await this.prisma.unidad.findUnique({
          where: { nroVin: updateUnidadDto.nroVin }
        });

        if (conflictingUnidad) {
          throw new ConflictException(`Ya existe una unidad con el VIN: ${updateUnidadDto.nroVin}`);
        }
      }

      // Verificar conflictos de número de motor (si se está actualizando)
      if (updateUnidadDto.nroMotor && updateUnidadDto.nroMotor !== existingUnidad.nroMotor) {
        const conflictingUnidad = await this.prisma.unidad.findUnique({
          where: { nroMotor: updateUnidadDto.nroMotor }
        });

        if (conflictingUnidad) {
          throw new ConflictException(`Ya existe una unidad con el número de motor: ${updateUnidadDto.nroMotor}`);
        }
      }

      // Verificar conductor (si se está actualizando)
      if (updateUnidadDto.conductorOperadorId !== undefined) {
        if (updateUnidadDto.conductorOperadorId !== null) {
          const conductor = await this.prisma.usuario.findUnique({
            where: { id: updateUnidadDto.conductorOperadorId }
          });

          if (!conductor) {
            throw new NotFoundException(`Conductor con ID ${updateUnidadDto.conductorOperadorId} no encontrado`);
          }

          if (!conductor.activo) {
            throw new BadRequestException(`No se puede asignar un conductor inactivo`);
          }

          // Verificar que el conductor no tenga ya otra unidad asignada
          if (updateUnidadDto.conductorOperadorId !== existingUnidad.conductorOperadorId) {
            const conductorConUnidad = await this.prisma.unidad.findFirst({
              where: {
                conductorOperadorId: updateUnidadDto.conductorOperadorId,
                activo: true,
                NOT: { id }
              }
            });

            if (conductorConUnidad) {
              throw new ConflictException(`El conductor ya tiene asignada la unidad con placa: ${conductorConUnidad.placa}`);
            }
          }
        }
      }

      // Verificar zona (si se está actualizando)
      if (updateUnidadDto.zonaOperacionId !== undefined) {
        if (updateUnidadDto.zonaOperacionId !== null) {
          const zona = await this.prisma.zona.findUnique({
            where: { id: updateUnidadDto.zonaOperacionId }
          });

          if (!zona) {
            throw new NotFoundException(`Zona con ID ${updateUnidadDto.zonaOperacionId} no encontrada`);
          }

          if (!zona.activo) {
            throw new BadRequestException(`No se puede asignar una zona inactiva`);
          }
        }
      }

      // Validar fecha de adquisición si se está actualizando
      if (updateUnidadDto.fechaAdquisicion) {
        this.validateFechaAdquisicion(updateUnidadDto.fechaAdquisicion);
      }

      // Preparar datos para actualizar
      const data: any = { ...updateUnidadDto };
      
      // Convertir fecha a formato Date para Prisma
      if (data.fechaAdquisicion) {
        data.fechaAdquisicion = new Date(data.fechaAdquisicion);
      }

      const unidad = await this.prisma.unidad.update({
        where: { id },
        data,
        include: {
          conductorOperador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              codigoEmpleado: true
            }
          },
          zonaOperacion: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          _count: {
            select: {
              // abastecimientos: true,
              mantenimientos: true,
              fallas: true
            }
          }
        }
      });

      return this.transformToResponseDto(unidad);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar la unidad');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar si la unidad existe
      const unidad = await this.prisma.unidad.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              // abastecimientos: true,
              mantenimientos: true,
              fallas: true,
              inspecciones: true
            }
          }
        }
      });

      if (!unidad) {
        throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
      }

      // Verificar si tiene dependencias
      // const totalDependencias = unidad._count.abastecimientos + 
                               unidad._count.mantenimientos + 
                               unidad._count.fallas + 
                               unidad._count.inspecciones;

      // if (totalDependencias > 0) {
      //   throw new ConflictException(
      //     `No se puede eliminar la unidad porque tiene registros asociados: ${unidad._count.abastecimientos} abastecimientos, ${unidad._count.mantenimientos} mantenimientos, ${unidad._count.fallas} fallas, ${unidad._count.inspecciones} inspecciones. Los registros históricos deben conservarse.`
      //   );
      // }

      await this.prisma.unidad.delete({
        where: { id }
      });

      return {
        message: `Unidad "${unidad.placa}" (${unidad.marca} ${unidad.modelo}) eliminada exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la unidad');
    }
  }

  async toggleStatus(id: number): Promise<UnidadResponseDto> {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    }

    const updatedUnidad = await this.prisma.unidad.update({
      where: { id },
      data: { activo: !unidad.activo },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedUnidad);
  }

  async findByPlaca(placa: string): Promise<UnidadResponseDto> {
    const unidad = await this.prisma.unidad.findUnique({
      where: { placa },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true
          }
        }
      }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con placa ${placa} no encontrada`);
    }

    return this.transformToResponseDto(unidad);
  }

  async findByConductor(conductorId: number): Promise<UnidadResponseDto | null> {
    const unidad = await this.prisma.unidad.findFirst({
      where: { 
        conductorOperadorId: conductorId,
        activo: true 
      },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true
          }
        }
      }
    });

    return unidad ? this.transformToResponseDto(unidad) : null;
  }

  async findByZona(zonaId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    // Contar total de unidades en la zona
    const total = await this.prisma.unidad.count({
      where: { 
        zonaOperacionId: zonaId,
        activo: true 
      }
    });

    // Obtener unidades con paginación
    const unidades = await this.prisma.unidad.findMany({
      where: { 
        zonaOperacionId: zonaId,
        activo: true 
      },
      skip: offset,
      take: limit,
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            ticketsAbastecimiento: true,
            mantenimientos: true,
            fallas: true
          }
        }
      },
      orderBy: { placa: 'asc' }
    });

    const unidadesTransformadas = unidades.map(unidad => this.transformToResponseDto(unidad));

    // Calcular metadata completa
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const nextOffset = hasNext ? offset + limit : null;
    const prevOffset = hasPrevious ? Math.max(0, offset - limit) : null;

    return {
      success: true,
      message: 'Unidades de la zona obtenidas exitosamente',
      data: {
        data: unidadesTransformadas,
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
      }
    };
  }

  async findSinConductor(): Promise<UnidadResponseDto[]> {
    const unidades = await this.prisma.unidad.findMany({
      where: { 
        conductorOperadorId: null,
        activo: true,
        estado: 'OPERATIVO'
      },
      include: {
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true
          }
        }
      },
      orderBy: { placa: 'asc' }
    });

    return unidades.map(unidad => this.transformToResponseDto(unidad));
  }

  async asignarConductor(unidadId: number, conductorId: number): Promise<UnidadResponseDto> {
    // Verificar que la unidad existe
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    // Verificar que el conductor existe y está activo
    const conductor = await this.prisma.usuario.findUnique({
      where: { id: conductorId }
    });

    if (!conductor) {
      throw new NotFoundException(`Conductor con ID ${conductorId} no encontrado`);
    }

    if (!conductor.activo) {
      throw new BadRequestException(`No se puede asignar un conductor inactivo`);
    }

    // Verificar que el conductor no tenga ya una unidad asignada
    const conductorConUnidad = await this.prisma.unidad.findFirst({
      where: {
        conductorOperadorId: conductorId,
        activo: true
      }
    });

    if (conductorConUnidad) {
      throw new ConflictException(`El conductor ya tiene asignada la unidad con placa: ${conductorConUnidad.placa}`);
    }

    const updatedUnidad = await this.prisma.unidad.update({
      where: { id: unidadId },
      data: { conductorOperadorId: conductorId },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            ticketsAbastecimiento: true,
            mantenimientos: true,
            fallas: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedUnidad);
  }

  async desasignarConductor(unidadId: number): Promise<UnidadResponseDto> {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    const updatedUnidad = await this.prisma.unidad.update({
      where: { id: unidadId },
      data: { conductorOperadorId: null },
      include: {
        zonaOperacion: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        _count: {
          select: {
            // abastecimientos: true,
            mantenimientos: true,
            fallas: true
          }
        }
      }
    });

    return this.transformToResponseDto(updatedUnidad);
  }

  // Método para obtener estadísticas de unidades
  async getStats() {
    const [total, activas, inactivas, porEstado, porTipoCombustible, porZona, sinConductor, porMarca] = await Promise.all([
      this.prisma.unidad.count(),
      this.prisma.unidad.count({ where: { activo: true } }),
      this.prisma.unidad.count({ where: { activo: false } }),
      this.prisma.unidad.groupBy({
        by: ['estado'],
        _count: { id: true },
        where: { activo: true }
      }),
      this.prisma.unidad.groupBy({
        by: ['tipoCombustible'],
        _count: { id: true },
        where: { activo: true }
      }),
      this.prisma.unidad.groupBy({
        by: ['zonaOperacionId'],
        _count: { id: true },
        where: { activo: true }
      }),
      this.prisma.unidad.count({
        where: {
          conductorOperadorId: null,
          activo: true
        }
      }),
      this.prisma.unidad.groupBy({
        by: ['marca'],
        _count: { id: true },
        where: { activo: true },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: 10
      })
    ]);

    return {
      total,
      activas,
      inactivas,
      sinConductor,
      conConductor: activas - sinConductor,
      distribucePorEstado: porEstado.map(item => ({
        estado: item.estado,
        cantidad: item._count.id
      })),
      distribucePorTipoCombustible: porTipoCombustible.map(item => ({
        tipoCombustible: item.tipoCombustible,
        cantidad: item._count.id
      })),
      distribucePorZona: porZona.map(item => ({
        zonaId: item.zonaOperacionId,
        cantidad: item._count.id
      })),
      topMarcas: porMarca.map(item => ({
        marca: item.marca,
        cantidad: item._count.id
      }))
    };
  }

  // Métodos auxiliares privados
  private validateFechaAdquisicion(fechaAdquisicion: string): void {
    const fecha = new Date(fechaAdquisicion);
    const today = new Date();
    const hace50Anos = new Date();
    hace50Anos.setFullYear(today.getFullYear() - 50);

    if (fecha > today) {
      throw new BadRequestException('La fecha de adquisición no puede ser futura');
    }

    if (fecha < hace50Anos) {
      throw new BadRequestException('La fecha de adquisición no puede ser anterior a 50 años');
    }
  }

  private calculateAntiguedad(fechaAdquisicion: Date | null): number | null {
    if (!fechaAdquisicion) return null;
    
    const today = new Date();
    const diffTime = today.getTime() - fechaAdquisicion.getTime();
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    
    return diffYears;
  }

  private canOperate(estado: string, activo: boolean): boolean {
    const estadosOperativos = ['OPERATIVO'];
    return activo && estadosOperativos.includes(estado);
  }

  // Método privado para transformar la entidad a DTO de respuesta
  private transformToResponseDto(unidad: any): UnidadResponseDto {
    const antiguedadAnios = this.calculateAntiguedad(unidad.fechaAdquisicion);
    const puedeOperar = this.canOperate(unidad.estado, unidad.activo);

    // Convertir valores Decimal de Prisma a números, manejando valores nulos
    const capacidadTanque = unidad.capacidadTanque ? Number(unidad.capacidadTanque) : null;
    const odometroInicial = unidad.odometroInicial ? Number(unidad.odometroInicial) : 0;
    const horometroInicial = unidad.horometroInicial ? Number(unidad.horometroInicial) : 0;

    return plainToInstance(UnidadResponseDto, {
      ...unidad,
      capacidadTanque,
      odometroInicial,
      horometroInicial,
      fechaAdquisicion: unidad.fechaAdquisicion?.toISOString().split('T')[0],
      abastecimientosCount: unidad._count?.abastecimientos || 0,
      mantenimientosCount: unidad._count?.mantenimientos || 0,
      fallasCount: unidad._count?.fallas || 0,
      antiguedadAnios,
      puedeOperar
    }, {
      excludeExtraneousValues: true
    });
  }
}