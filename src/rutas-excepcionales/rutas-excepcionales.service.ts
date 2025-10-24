import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateRutaExcepcionalDto,
  PrioridadRutaExcepcional,
} from './dto/create-ruta-excepcional.dto';
import { UpdateRutaExcepcionalDto } from './dto/update-ruta-excepcional.dto';
import { FiltrosRutaExcepcionalDto } from './dto/filtros-ruta-excepcional.dto';
import {
  RutaExcepcionalResponseDto,
} from './dto/ruta-excepcional-response.dto';
import { Prisma } from '@prisma/client';
import { ValidacionAsignacionesService } from '@/asignaciones/validacion/validacion-asignaciones.service';

@Injectable()
export class RutasExcepcionalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validacionService: ValidacionAsignacionesService,
  ) {}

  /**
   * Asignar una ruta excepcional a una unidad
   */
  async asignarRutaExcepcional(
    createDto: CreateRutaExcepcionalDto,
    userId: number,
  ): Promise<RutaExcepcionalResponseDto> {
    // 1. Validar que la unidad existe y está activa
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: createDto.unidadId },
      select: { id: true, placa: true, activo: true },
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${createDto.unidadId} no encontrada`);
    }

    if (!unidad.activo) {
      throw new BadRequestException(
        `La unidad ${unidad.placa} está inactiva y no puede ser asignada`,
      );
    }

    // 2. Validar que la ruta existe y está activa
    const ruta = await this.prisma.ruta.findUnique({
      where: { id: createDto.rutaId },
      select: { id: true, nombre: true, estado: true },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${createDto.rutaId} no encontrada`);
    }

    if (ruta.estado !== 'ACTIVA') {
      throw new BadRequestException(
        `La ruta "${ruta.nombre}" no está activa y no puede ser asignada`,
      );
    }

    // 3. Convertir fecha string a Date
    const fechaViaje = new Date(createDto.fechaViajeEspecifico);

    // Validar que la fecha no sea pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaViaje.setHours(0, 0, 0, 0);

    if (fechaViaje < hoy) {
      throw new BadRequestException(
        'No se puede asignar una ruta excepcional para una fecha pasada',
      );
    }

    // 4. 🔴 VALIDACIÓN INTELIGENTE CON EL SERVICIO DE VALIDACIÓN
    const validacion = await this.validacionService.validarDisponibilidadUnidad({
      unidadId: createDto.unidadId,
      fechaInicio: fechaViaje,
      fechaFin: fechaViaje,
      tipoAsignacion: 'RUTA_EXCEPCIONAL',
    });

    if (!validacion.permitido) {
      throw new ConflictException(
        validacion.conflictos?.join(' | ') ||
          'La unidad no está disponible para esta fecha',
      );
    }

    // 5. Validar autorización si es requerida
    if (createDto.requiereAutorizacion && !createDto.autorizadoPorId) {
      throw new BadRequestException(
        'Esta ruta excepcional requiere autorización. Debe proporcionar autorizadoPorId',
      );
    }

    let mensajeInfo = `Ruta excepcional "${ruta.nombre}" asignada a unidad ${unidad.placa} para el ${fechaViaje.toLocaleDateString('es-PE')}.`;

    if (validacion.advertencias && validacion.advertencias.length > 0) {
    mensajeInfo += ` ${validacion.advertencias.join(' ')}`;
  }

  // Si el usuario NO proporcionó observaciones, usar el mensaje generado
  const observacionesFinales = createDto.observaciones || mensajeInfo;

    // 6. Crear la asignación excepcional
    const asignacion = await this.prisma.unidadRuta.create({
      data: {
        unidadId: createDto.unidadId,
        rutaId: createDto.rutaId,
        esUnaVez: true, // Siempre es un viaje único
        fechaViajeEspecifico: fechaViaje,
        motivoAsignacion: createDto.motivoAsignacion,
        descripcionMotivo: createDto.descripcionMotivo,
        prioridad: createDto.prioridad || PrioridadRutaExcepcional.NORMAL,
        requiereAutorizacion: createDto.requiereAutorizacion ?? true,
        autorizadoPorId: createDto.autorizadoPorId,
        fechaAutorizacion: createDto.autorizadoPorId ? new Date() : null,
        activo: true,
        asignadoPorId: userId,
        observaciones: observacionesFinales,
      },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            origen: true,
            destino: true,
            distanciaKm: true,
            tiempoEstimadoMinutos: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        autorizadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    

    return this.mapearRutaExcepcionalAResponse(asignacion);
  }

  /**
   * Listar rutas excepcionales con filtros y paginación
   */
  async findAll(filtros: FiltrosRutaExcepcionalDto): Promise<{
    data: RutaExcepcionalResponseDto[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const { page = 1, pageSize = 10, ...restFiltros } = filtros;

    // Construir where clause
    const where: Prisma.UnidadRutaWhereInput = {
      esUnaVez: true, // Solo rutas excepcionales
      ...(restFiltros.unidadId && { unidadId: restFiltros.unidadId }),
      ...(restFiltros.rutaId && { rutaId: restFiltros.rutaId }),
      ...(restFiltros.soloActivas !== undefined && { activo: restFiltros.soloActivas }),
      ...(restFiltros.prioridad && { prioridad: restFiltros.prioridad }),
      ...(restFiltros.motivoAsignacion && {
        motivoAsignacion: { contains: restFiltros.motivoAsignacion, mode: 'insensitive' },
      }),
    };

    // Filtro de fechas
    if (restFiltros.fechaDesde || restFiltros.fechaHasta) {
      where.fechaViajeEspecifico = {};
      if (restFiltros.fechaDesde) {
        where.fechaViajeEspecifico.gte = new Date(restFiltros.fechaDesde);
      }
      if (restFiltros.fechaHasta) {
        where.fechaViajeEspecifico.lte = new Date(restFiltros.fechaHasta);
      }
    }

    // Ejecutar consulta con paginación
    const [data, total] = await Promise.all([
      this.prisma.unidadRuta.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { fechaViajeEspecifico: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          unidad: {
            select: {
              id: true,
              placa: true,
              marca: true,
              modelo: true,
            },
          },
          ruta: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              origen: true,
              destino: true,
              distanciaKm: true,
              tiempoEstimadoMinutos: true,
            },
          },
          asignadoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
            },
          },
          autorizadoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
            },
          },
        },
      }),
      this.prisma.unidadRuta.count({ where }),
    ]);

    return {
      data: data.map((item) => this.mapearRutaExcepcionalAResponse(item)),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Obtener una ruta excepcional por ID
   */
  async findOne(id: number): Promise<RutaExcepcionalResponseDto> {
    const asignacion = await this.prisma.unidadRuta.findUnique({
      where: { id },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            origen: true,
            destino: true,
            distanciaKm: true,
            tiempoEstimadoMinutos: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        autorizadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    if (!asignacion || !asignacion.esUnaVez) {
      throw new NotFoundException(`Ruta excepcional con ID ${id} no encontrada`);
    }

    return this.mapearRutaExcepcionalAResponse(asignacion);
  }

  /**
   * Actualizar una ruta excepcional
   */
  async update(
    id: number,
    updateDto: UpdateRutaExcepcionalDto,
    userId: number,
  ): Promise<RutaExcepcionalResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    const asignacionActualizada = await this.prisma.unidadRuta.update({
      where: { id },
      data: {
        ...(updateDto.motivoAsignacion && { motivoAsignacion: updateDto.motivoAsignacion }),
        ...(updateDto.descripcionMotivo !== undefined && {
          descripcionMotivo: updateDto.descripcionMotivo,
        }),
        ...(updateDto.prioridad && { prioridad: updateDto.prioridad }),
        ...(updateDto.requiereAutorizacion !== undefined && {
          requiereAutorizacion: updateDto.requiereAutorizacion,
        }),
        ...(updateDto.autorizadoPorId && {
          autorizadoPorId: updateDto.autorizadoPorId,
          fechaAutorizacion: new Date(),
        }),
        ...(updateDto.observaciones !== undefined && { observaciones: updateDto.observaciones }),
        updatedAt: new Date(),
      },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            origen: true,
            destino: true,
            distanciaKm: true,
            tiempoEstimadoMinutos: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        autorizadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    return this.mapearRutaExcepcionalAResponse(asignacionActualizada);
  }

  /**
   * Cancelar una ruta excepcional (desactivar)
   */
  async cancelar(id: number, userId: number): Promise<{ message: string }> {
    const asignacion = await this.findOne(id);

    if (!asignacion.activo) {
      throw new BadRequestException('Esta ruta excepcional ya está cancelada');
    }

    // Verificar que no sea una fecha pasada
    const fechaViaje = new Date(asignacion.fechaViajeEspecifico);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaViaje.setHours(0, 0, 0, 0);

    if (fechaViaje < hoy) {
      throw new BadRequestException('No se puede cancelar una ruta excepcional de fecha pasada');
    }

    await this.prisma.unidadRuta.update({
      where: { id },
      data: {
        activo: false,
        fechaDesasignacion: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      message: `Ruta excepcional "${asignacion.ruta.nombre}" cancelada exitosamente`,
    };
  }

  /**
   * Obtener rutas excepcionales de una unidad en un rango de fechas
   */
  async obtenerPorUnidadYRango(
    unidadId: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<RutaExcepcionalResponseDto[]> {
    const asignaciones = await this.prisma.unidadRuta.findMany({
      where: {
        unidadId,
        esUnaVez: true,
        activo: true,
        fechaViajeEspecifico: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            origen: true,
            destino: true,
            distanciaKm: true,
            tiempoEstimadoMinutos: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        autorizadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
      orderBy: {
        fechaViajeEspecifico: 'asc',
      },
    });

    return asignaciones.map((item) => this.mapearRutaExcepcionalAResponse(item));
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Mapear entidad de Prisma a DTO de respuesta
   */
  private mapearRutaExcepcionalAResponse(
    asignacion: any,
  ): RutaExcepcionalResponseDto {
    return {
      id: asignacion.id,
      unidadId: asignacion.unidadId,
      unidad: asignacion.unidad
        ? {
            id: asignacion.unidad.id,
            placa: asignacion.unidad.placa,
            marca: asignacion.unidad.marca,
            modelo: asignacion.unidad.modelo,
          }
        : undefined,
      rutaId: asignacion.rutaId,
      ruta: asignacion.ruta
        ? {
            id: asignacion.ruta.id,
            nombre: asignacion.ruta.nombre,
            codigo: asignacion.ruta.codigo,
            origen: asignacion.ruta.origen,
            destino: asignacion.ruta.destino,
            distanciaKm: asignacion.ruta.distanciaKm
              ? Number(asignacion.ruta.distanciaKm)
              : undefined,
            tiempoEstimadoMinutos: asignacion.ruta.tiempoEstimadoMinutos,
          }
        : undefined,
      esUnaVez: asignacion.esUnaVez,
      fechaAsignacion: asignacion.fechaAsignacion,
      fechaDesasignacion: asignacion.fechaDesasignacion,
      fechaViajeEspecifico: asignacion.fechaViajeEspecifico?.toISOString().split('T')[0],
      motivoAsignacion: asignacion.motivoAsignacion,
      descripcionMotivo: asignacion.descripcionMotivo,
      prioridad: asignacion.prioridad,
      requiereAutorizacion: asignacion.requiereAutorizacion,
      autorizadoPorId: asignacion.autorizadoPorId,
      autorizadoPor: asignacion.autorizadoPor
        ? {
            id: asignacion.autorizadoPor.id,
            nombres: asignacion.autorizadoPor.nombres,
            apellidos: asignacion.autorizadoPor.apellidos,
          }
        : undefined,
      fechaAutorizacion: asignacion.fechaAutorizacion,
      activo: asignacion.activo,
      asignadoPorId: asignacion.asignadoPorId,
      asignadoPor: asignacion.asignadoPor
        ? {
            id: asignacion.asignadoPor.id,
            nombres: asignacion.asignadoPor.nombres,
            apellidos: asignacion.asignadoPor.apellidos,
          }
        : undefined,
      observaciones: asignacion.observaciones,
      createdAt: asignacion.createdAt,
      updatedAt: asignacion.updatedAt,
    };
  }
}