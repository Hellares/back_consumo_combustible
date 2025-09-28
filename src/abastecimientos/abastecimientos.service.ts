// =============================================
// src/abastecimientos/abastecimientos.service.ts
// =============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateAbastecimientoDto } from './dto/create-abastecimiento.dto';
import { UpdateAbastecimientoDto } from './dto/update-abastecimiento.dto';
import { QueryAbastecimientoDto } from './dto/query-abastecimiento.dto';
import { AbastecimientoResponseDto } from './dto/abastecimiento-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../database/prisma.service';
import { AprobarAbastecimientoDto } from './dto/aprobar-abastecimiento.dto';
import { RechazarAbastecimientoDto } from './dto/rechazar-abastecimiento.dto';

@Injectable()
export class AbastecimientosService {
  constructor(private prisma: PrismaService) {}

  async create(createAbastecimientoDto: CreateAbastecimientoDto): Promise<AbastecimientoResponseDto> {
    try {
      // Validar que la unidad existe y está activa
      const unidad = await this.prisma.unidad.findUnique({
        where: { id: createAbastecimientoDto.unidadId }
      });

      if (!unidad) {
        throw new NotFoundException(`Unidad con ID ${createAbastecimientoDto.unidadId} no encontrada`);
      }

      if (!unidad.activo) {
        throw new BadRequestException('No se puede registrar abastecimiento en una unidad inactiva');
      }

      // Validar que el conductor existe y está activo
      const conductor = await this.prisma.usuario.findUnique({
        where: { id: createAbastecimientoDto.conductorId }
      });

      if (!conductor) {
        throw new NotFoundException(`Conductor con ID ${createAbastecimientoDto.conductorId} no encontrado`);
      }

      if (!conductor.activo) {
        throw new BadRequestException('No se puede registrar abastecimiento con un conductor inactivo');
      }

      // Validar que el grifo existe y está activo
      const grifo = await this.prisma.grifo.findUnique({
        where: { id: createAbastecimientoDto.grifoId }
      });

      if (!grifo) {
        throw new NotFoundException(`Grifo con ID ${createAbastecimientoDto.grifoId} no encontrado`);
      }

      if (!grifo.activo) {
        throw new BadRequestException('No se puede registrar abastecimiento en un grifo inactivo');
      }

      // Validar turno si se proporciona
      if (createAbastecimientoDto.turnoId) {
        const turno = await this.prisma.turno.findUnique({
          where: { id: createAbastecimientoDto.turnoId }
        });

        if (!turno) {
          throw new NotFoundException(`Turno con ID ${createAbastecimientoDto.turnoId} no encontrado`);
        }

        if (!turno.activo) {
          throw new BadRequestException('No se puede registrar abastecimiento en un turno inactivo');
        }
      }

      // Validar ruta si se proporciona
      if (createAbastecimientoDto.rutaId) {
        const ruta = await this.prisma.ruta.findUnique({
          where: { id: createAbastecimientoDto.rutaId }
        });

        if (!ruta) {
          throw new NotFoundException(`Ruta con ID ${createAbastecimientoDto.rutaId} no encontrada`);
        }

        if (!ruta.activo) {
          throw new BadRequestException('No se puede registrar abastecimiento en una ruta inactiva');
        }
      }

      // Validar controlador si se proporciona
      if (createAbastecimientoDto.controladorId) {
        const controlador = await this.prisma.usuario.findUnique({
          where: { id: createAbastecimientoDto.controladorId }
        });

        if (!controlador) {
          throw new NotFoundException(`Controlador con ID ${createAbastecimientoDto.controladorId} no encontrado`);
        }

        if (!controlador.activo) {
          throw new BadRequestException('No se puede asignar un controlador inactivo');
        }
      }

      // Validar consistencia de kilometraje
      if (createAbastecimientoDto.kilometrajeAnterior && 
          createAbastecimientoDto.kilometrajeActual <= createAbastecimientoDto.kilometrajeAnterior) {
        throw new BadRequestException('El kilometraje actual debe ser mayor al kilometraje anterior');
      }

      // Validar consistencia de horómetro
      if (createAbastecimientoDto.horometroAnterior && 
          createAbastecimientoDto.horometroActual && 
          createAbastecimientoDto.horometroActual <= createAbastecimientoDto.horometroAnterior) {
        throw new BadRequestException('El horómetro actual debe ser mayor al horómetro anterior');
      }

      // Verificar que el precinto nuevo no esté duplicado
      const precintoExistente = await this.prisma.abastecimiento.findFirst({
        where: { precintoNuevo: createAbastecimientoDto.precintoNuevo.trim() }
      });

      if (precintoExistente) {
        throw new ConflictException(`Ya existe un abastecimiento con el precinto: ${createAbastecimientoDto.precintoNuevo}`);
      }

      // Generar número de abastecimiento único
      const numeroAbastecimiento = await this.generateNumeroAbastecimiento();

      // Calcular costo total
      const costoTotal = Number((createAbastecimientoDto.cantidad * createAbastecimientoDto.costoPorUnidad).toFixed(2));

      // Verificar que existe el estado por defecto
      const estadoDefault = await this.prisma.estadoAbastecimiento.findFirst({
        where: { id: 1 }
      });

      if (!estadoDefault) {
        throw new BadRequestException('No existe el estado por defecto. Contacte al administrador.');
      }

      // Preparar datos para creación
      const dataToCreate = {
        numeroAbastecimiento,
        fecha: createAbastecimientoDto.fecha ? new Date(createAbastecimientoDto.fecha) : new Date(),
        hora: createAbastecimientoDto.hora ? 
          new Date(`1970-01-01T${createAbastecimientoDto.hora}Z`) : 
          new Date(),
        turnoId: createAbastecimientoDto.turnoId,
        unidadId: createAbastecimientoDto.unidadId,
        conductorId: createAbastecimientoDto.conductorId,
        controladorId: createAbastecimientoDto.controladorId,
        grifoId: createAbastecimientoDto.grifoId,
        rutaId: createAbastecimientoDto.rutaId,
        kilometrajeActual: createAbastecimientoDto.kilometrajeActual,
        kilometrajeAnterior: createAbastecimientoDto.kilometrajeAnterior,
        horometroActual: createAbastecimientoDto.horometroActual,
        horometroAnterior: createAbastecimientoDto.horometroAnterior,
        precintoAnterior: createAbastecimientoDto.precintoAnterior?.trim(),
        precintoNuevo: createAbastecimientoDto.precintoNuevo.trim(),
        precinto2: createAbastecimientoDto.precinto2?.trim(),
        tipoCombustible: createAbastecimientoDto.tipoCombustible,
        cantidad: createAbastecimientoDto.cantidad,
        unidadMedida: createAbastecimientoDto.unidadMedida,
        costoPorUnidad: createAbastecimientoDto.costoPorUnidad,
        costoTotal,
        numeroTicket: createAbastecimientoDto.numeroTicket?.trim(),
        valeDiesel: createAbastecimientoDto.valeDiesel?.trim(),
        numeroFactura: createAbastecimientoDto.numeroFactura?.trim(),
        importeFactura: createAbastecimientoDto.importeFactura,
        requerimiento: createAbastecimientoDto.requerimiento?.trim(),
        numeroSalidaAlmacen: createAbastecimientoDto.numeroSalidaAlmacen?.trim(),
        fotoSurtidorUrl: createAbastecimientoDto.fotoSurtidorUrl,
        fotoTableroUrl: createAbastecimientoDto.fotoTableroUrl,
        fotoPrecintoNuevoUrl: createAbastecimientoDto.fotoPrecintoNuevoUrl,
        fotoPrecinto2Url: createAbastecimientoDto.fotoPrecinto2Url,
        fotoTicketUrl: createAbastecimientoDto.fotoTicketUrl,
        observaciones: createAbastecimientoDto.observaciones?.trim(),
        estadoId: 3 // Estado inicial: PENDIENTE (según tu tabla)
      };

      const abastecimiento = await this.prisma.abastecimiento.create({
        data: dataToCreate,
        include: {
          ...this.getIncludeOptions(),
          // Remover estado temporalmente si no existe
          estado: false
        }
      });

      return this.transformToResponseDto(abastecimiento);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el abastecimiento');
    }
  }

  async findAll(queryDto: QueryAbastecimientoDto) {
    const { 
      page, 
      limit, 
      search, 
      unidadId, 
      conductorId, 
      grifoId, 
      turnoId, 
      estadoId,
      tipoCombustible,
      fechaInicio,
      fechaFin,
      solosPendientes,
      orderBy, 
      orderDirection 
    } = queryDto;
    
    const offset = (page - 1) * limit;

    // Construir filtros dinámicamente
    const where: any = {};

    if (search) {
      where.OR = [
        { numeroAbastecimiento: { contains: search, mode: 'insensitive' } },
        { unidad: { placa: { contains: search, mode: 'insensitive' } } },
        { conductor: { nombres: { contains: search, mode: 'insensitive' } } },
        { conductor: { apellidos: { contains: search, mode: 'insensitive' } } },
        { conductor: { dni: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (unidadId) {
      where.unidadId = unidadId;
    }

    if (conductorId) {
      where.conductorId = conductorId;
    }

    if (grifoId) {
      where.grifoId = grifoId;
    }

    if (turnoId) {
      where.turnoId = turnoId;
    }

    if (estadoId) {
      where.estadoId = estadoId;
    }

    if (tipoCombustible) {
      where.tipoCombustible = tipoCombustible;
    }

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) {
        where.fecha.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        where.fecha.lte = new Date(fechaFin);
      }
    }

    if (solosPendientes) {
      where.estadoId = 1; // Estado PENDIENTE
    }

    // Contar total de registros
    const total = await this.prisma.abastecimiento.count({ where });

    // Obtener abastecimientos con paginación
    const abastecimientos = await this.prisma.abastecimiento.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: this.getIncludeOptions()
    });

    const abastecimientosTransformados = abastecimientos.map(
      abastecimiento => this.transformToResponseDto(abastecimiento)
    );

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: abastecimientosTransformados,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrevious ? page - 1 : null
      }
    };
  }

  async findOne(id: number): Promise<AbastecimientoResponseDto> {
    const abastecimiento = await this.prisma.abastecimiento.findUnique({
      where: { id },
      include: this.getIncludeOptions()
    });

    if (!abastecimiento) {
      throw new NotFoundException(`Abastecimiento con ID ${id} no encontrado`);
    }

    return this.transformToResponseDto(abastecimiento);
  }

  async findByNumero(numeroAbastecimiento: string): Promise<AbastecimientoResponseDto> {
    const abastecimiento = await this.prisma.abastecimiento.findUnique({
      where: { numeroAbastecimiento: numeroAbastecimiento.trim() },
      include: this.getIncludeOptions()
    });

    if (!abastecimiento) {
      throw new NotFoundException(`Abastecimiento con número ${numeroAbastecimiento} no encontrado`);
    }

    return this.transformToResponseDto(abastecimiento);
  }

  async update(id: number, updateAbastecimientoDto: UpdateAbastecimientoDto): Promise<AbastecimientoResponseDto> {
    try {
      // Verificar que el abastecimiento existe
      const existingAbastecimiento = await this.prisma.abastecimiento.findUnique({
        where: { id }
      });

      if (!existingAbastecimiento) {
        throw new NotFoundException(`Abastecimiento con ID ${id} no encontrado`);
      }

      // Verificar que esté en estado que permita modificación
      if (existingAbastecimiento.estadoId !== 1) { // Solo PENDIENTE
        throw new BadRequestException('Solo se pueden modificar abastecimientos en estado PENDIENTE');
      }

      // Validar precinto nuevo único si se está actualizando
      if (updateAbastecimientoDto.precintoNuevo) {
        const precintoExistente = await this.prisma.abastecimiento.findFirst({
          where: { 
            precintoNuevo: updateAbastecimientoDto.precintoNuevo.trim(),
            id: { not: id }
          }
        });

        if (precintoExistente) {
          throw new ConflictException(`Ya existe un abastecimiento con el precinto: ${updateAbastecimientoDto.precintoNuevo}`);
        }
      }

      // Preparar datos para actualización
      const updateData: any = {};

      // Mapear campos permitidos para actualización
      const allowedFields = [
        'fecha', 'hora', 'turnoId', 'rutaId', 'kilometrajeActual', 'kilometrajeAnterior',
        'horometroActual', 'horometroAnterior', 'precintoAnterior', 'precintoNuevo',
        'precinto2', 'tipoCombustible', 'cantidad', 'unidadMedida', 'costoPorUnidad',
        'numeroTicket', 'valeDiesel', 'numeroFactura', 'importeFactura', 'requerimiento',
        'numeroSalidaAlmacen', 'fotoSurtidorUrl', 'fotoTableroUrl', 'fotoPrecintoNuevoUrl',
        'fotoPrecinto2Url', 'fotoTicketUrl', 'observaciones'
      ];

      for (const field of allowedFields) {
        if (updateAbastecimientoDto[field] !== undefined) {
          if (field === 'fecha') {
            updateData[field] = new Date(updateAbastecimientoDto[field]);
          } else if (field === 'hora') {
            updateData[field] = new Date(`1970-01-01T${updateAbastecimientoDto[field]}Z`);
          } else if (typeof updateAbastecimientoDto[field] === 'string') {
            updateData[field] = updateAbastecimientoDto[field].trim();
          } else {
            updateData[field] = updateAbastecimientoDto[field];
          }
        }
      }

      // Recalcular costo total si se modificó cantidad o costo por unidad
      if (updateAbastecimientoDto.cantidad || updateAbastecimientoDto.costoPorUnidad) {
        const cantidad = updateAbastecimientoDto.cantidad || Number(existingAbastecimiento.cantidad);
        const costoPorUnidad = updateAbastecimientoDto.costoPorUnidad || Number(existingAbastecimiento.costoPorUnidad);
        updateData.costoTotal = Number((cantidad * costoPorUnidad).toFixed(2));
      }

      const abastecimiento = await this.prisma.abastecimiento.update({
        where: { id },
        data: updateData,
        include: this.getIncludeOptions()
      });

      return this.transformToResponseDto(abastecimiento);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el abastecimiento');
    }
  }

  async aprobar(id: number, aprobarDto: AprobarAbastecimientoDto, aprobadoPorId: number): Promise<AbastecimientoResponseDto> {
    try {
      const abastecimiento = await this.prisma.abastecimiento.findUnique({
        where: { id }
      });

      if (!abastecimiento) {
        throw new NotFoundException(`Abastecimiento con ID ${id} no encontrado`);
      }

      if (abastecimiento.estadoId !== 1) {
        throw new BadRequestException('Solo se pueden aprobar abastecimientos en estado PENDIENTE');
      }

      const updatedAbastecimiento = await this.prisma.abastecimiento.update({
        where: { id },
        data: {
          estadoId: 2, // APROBADO
          aprobadoPorId,
          fechaAprobacion: new Date(),
          observacionesControlador: aprobarDto.observacionesControlador?.trim()
        },
        include: this.getIncludeOptions()
      });

      return this.transformToResponseDto(updatedAbastecimiento);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al aprobar el abastecimiento');
    }
  }

  async rechazar(id: number, rechazarDto: RechazarAbastecimientoDto, rechazadoPorId: number): Promise<AbastecimientoResponseDto> {
    try {
      const abastecimiento = await this.prisma.abastecimiento.findUnique({
        where: { id }
      });

      if (!abastecimiento) {
        throw new NotFoundException(`Abastecimiento con ID ${id} no encontrado`);
      }

      if (abastecimiento.estadoId !== 1) {
        throw new BadRequestException('Solo se pueden rechazar abastecimientos en estado PENDIENTE');
      }

      const updatedAbastecimiento = await this.prisma.abastecimiento.update({
        where: { id },
        data: {
          estadoId: 3, // RECHAZADO
          rechazadoPorId,
          fechaRechazo: new Date(),
          motivoRechazo: rechazarDto.motivoRechazo.trim(),
          observacionesControlador: rechazarDto.observacionesControlador?.trim()
        },
        include: this.getIncludeOptions()
      });

      return this.transformToResponseDto(updatedAbastecimiento);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al rechazar el abastecimiento');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const abastecimiento = await this.prisma.abastecimiento.findUnique({
        where: { id }
      });

      if (!abastecimiento) {
        throw new NotFoundException(`Abastecimiento con ID ${id} no encontrado`);
      }

      // Solo permitir eliminar abastecimientos PENDIENTES o RECHAZADOS
      if (![1, 3].includes(abastecimiento.estadoId)) {
        throw new BadRequestException('Solo se pueden eliminar abastecimientos PENDIENTES o RECHAZADOS');
      }

      await this.prisma.abastecimiento.delete({
        where: { id }
      });

      return { message: `Abastecimiento ${abastecimiento.numeroAbastecimiento} eliminado exitosamente` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el abastecimiento');
    }
  }

  /**
   * Obtiene estadísticas generales de abastecimientos
   */
  async getStats() {
    const [
      total,
      pendientes,
      aprobados,
      rechazados,
      totalGalones,
      costoTotal,
      promedioEficiencia
    ] = await Promise.all([
      this.prisma.abastecimiento.count(),
      this.prisma.abastecimiento.count({ where: { estadoId: 1 } }),
      this.prisma.abastecimiento.count({ where: { estadoId: 2 } }),
      this.prisma.abastecimiento.count({ where: { estadoId: 3 } }),
      this.prisma.abastecimiento.aggregate({
        _sum: { cantidad: true }
      }),
      this.prisma.abastecimiento.aggregate({
        _sum: { costoTotal: true }
      }),
      this.prisma.abastecimiento.aggregate({
        _avg: { cantidad: true }
      })
    ]);

    return {
      resumen: {
        total,
        pendientes,
        aprobados,
        rechazados
      },
      combustible: {
        totalGalones: Number(totalGalones._sum.cantidad || 0),
        promedioGalones: Number(promedioEficiencia._avg.cantidad || 0)
      },
      costos: {
        costoTotal: Number(costoTotal._sum.costoTotal || 0),
        promedioCosto: total > 0 ? Number((Number(costoTotal._sum.costoTotal || 0) / total).toFixed(2)) : 0
      }
    };
  }

  /**
   * Obtiene estadísticas por unidad
   */
  async getStatsByUnidad(unidadId: number) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    const [
      totalAbastecimientos,
      totalGalones,
      costoTotal,
      ultimoAbastecimiento,
      eficienciaPromedio
    ] = await Promise.all([
      this.prisma.abastecimiento.count({
        where: { unidadId, estadoId: 2 } // Solo aprobados
      }),
      this.prisma.abastecimiento.aggregate({
        where: { unidadId, estadoId: 2 },
        _sum: { cantidad: true }
      }),
      this.prisma.abastecimiento.aggregate({
        where: { unidadId, estadoId: 2 },
        _sum: { costoTotal: true }
      }),
      this.prisma.abastecimiento.findFirst({
        where: { unidadId },
        orderBy: { fecha: 'desc' },
        include: { conductor: true }
      }),
      this.calculateEficienciaPromedio(unidadId)
    ]);

    return {
      unidad: {
        id: unidad.id,
        placa: unidad.placa,
        marca: unidad.marca,
        modelo: unidad.modelo
      },
      estadisticas: {
        totalAbastecimientos,
        totalGalones: Number(totalGalones._sum.cantidad || 0),
        costoTotal: Number(costoTotal._sum.costoTotal || 0),
        eficienciaPromedio: Number(eficienciaPromedio.toFixed(2)),
        ultimoAbastecimiento: ultimoAbastecimiento ? {
          fecha: ultimoAbastecimiento.fecha,
          cantidad: ultimoAbastecimiento.cantidad,
          conductor: ultimoAbastecimiento.conductor.nombres + ' ' + ultimoAbastecimiento.conductor.apellidos
        } : null
      }
    };
  }

  /**
   * Obtiene abastecimientos por conductor
   */
  async findByConductor(conductorId: number, limit: number = 10) {
    const conductor = await this.prisma.usuario.findUnique({
      where: { id: conductorId }
    });

    if (!conductor) {
      throw new NotFoundException(`Conductor con ID ${conductorId} no encontrado`);
    }

    const abastecimientos = await this.prisma.abastecimiento.findMany({
      where: { conductorId },
      take: limit,
      orderBy: { fecha: 'desc' },
      include: this.getIncludeOptions()
    });

    return abastecimientos.map(abastecimiento => this.transformToResponseDto(abastecimiento));
  }

  /**
   * Genera número único de abastecimiento
   */
  private async generateNumeroAbastecimiento(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Buscar el último número del mes actual
    const prefix = `AB-${year}-${month}`;
    
    const lastAbastecimiento = await this.prisma.abastecimiento.findFirst({
      where: {
        numeroAbastecimiento: {
          startsWith: prefix
        }
      },
      orderBy: {
        numeroAbastecimiento: 'desc'
      }
    });

    let nextNumber = 1;
    
    if (lastAbastecimiento) {
      const lastNumber = parseInt(lastAbastecimiento.numeroAbastecimiento.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Calcula eficiencia promedio de combustible para una unidad
   */
  private async calculateEficienciaPromedio(unidadId: number): Promise<number> {
    const abastecimientos = await this.prisma.abastecimiento.findMany({
      where: { 
        unidadId, 
        estadoId: 2, // Solo aprobados
        kilometrajeAnterior: { not: null },
        kilometrajeActual: { not: null }
      },
      select: {
        kilometrajeActual: true,
        kilometrajeAnterior: true,
        cantidad: true
      }
    });

    if (abastecimientos.length === 0) return 0;

    let totalEficiencia = 0;
    let contadorValidos = 0;

    for (const ab of abastecimientos) {
      if (ab.kilometrajeAnterior && ab.kilometrajeActual && Number(ab.cantidad) > 0) {
        const diferencia = Number(ab.kilometrajeActual) - Number(ab.kilometrajeAnterior);
        if (diferencia > 0) {
          const eficiencia = diferencia / Number(ab.cantidad);
          totalEficiencia += eficiencia;
          contadorValidos++;
        }
      }
    }

    return contadorValidos > 0 ? totalEficiencia / contadorValidos : 0;
  }

  /**
   * Opciones de include para consultas
   */
  private getIncludeOptions() {
    return {
      turno: {
        select: {
          id: true,
          nombre: true,
          horaInicio: true,
          horaFin: true
        }
      },
      unidad: {
        select: {
          id: true,
          placa: true,
          marca: true,
          modelo: true,
          tipoCombustible: true,
          capacidadTanque: true
        }
      },
      conductor: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          dni: true,
          codigoEmpleado: true
        }
      },
      controlador: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          dni: true,
          codigoEmpleado: true
        }
      },
      grifo: {
        include: {
          sede: {
            include: {
              zona: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          }
        }
      },
      ruta: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
          origen: true,
          destino: true,
          distanciaKm: true
        }
      },
      estado: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          color: true
        }
      },
      aprobadoPor: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          codigoEmpleado: true
        }
      },
      rechazadoPor: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          codigoEmpleado: true
        }
      }
    };
  }

  /**
   * Transforma el objeto de base de datos a DTO de respuesta
   */
  private transformToResponseDto(abastecimiento: any): AbastecimientoResponseDto {
    // Calcular campos adicionales
    const diferenciaKilometraje = abastecimiento.kilometrajeActual && abastecimiento.kilometrajeAnterior 
      ? Number((abastecimiento.kilometrajeActual - abastecimiento.kilometrajeAnterior).toFixed(2))
      : 0;

    const diferenciaHorometro = abastecimiento.horometroActual && abastecimiento.horometroAnterior
      ? Number((abastecimiento.horometroActual - abastecimiento.horometroAnterior).toFixed(2))
      : 0;

    return plainToInstance(AbastecimientoResponseDto, {
      ...abastecimiento,
      diferenciaKilometraje,
      diferenciaHorometro
    }, {
      excludeExtraneousValues: true,
    });
  }
}