import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { QueryDetalleDto } from './dto/query-detalle.dto';
import { UpdateDetalleDto } from './dto/update-detalles-abastecimiento.dto';
import { DetalleAbastecimientoResponseDto } from './dto/detalle-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DetallesAbastecimientoService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(
    queryDto: QueryDetalleDto,
    grifoId?: number,
    zonaId?: number,
    sedeId?: number
  ) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'fechaAprobacion',
      sortOrder = 'desc',
      ...filters
    } = queryDto;

    const whereUbicacion: any = {};

    if (grifoId) {
      whereUbicacion.grifoId = grifoId;
    } else if (sedeId) {
      whereUbicacion.grifo = { sedeId: sedeId };
    } else if (zonaId) {
      whereUbicacion.grifo = { sede: { zonaId: zonaId } };
    }

    const estadoAprobado = await this.prisma.estadoTicketAbastecimiento.findFirst({
      where: { nombre: 'APROBADO' }
    });

    const where: Prisma.DetalleAbastecimientoWhereInput = {
      ticket: {
        ...whereUbicacion,
        estadoId: estadoAprobado?.id,
        ...(filters.placa && {
          unidad: {
            placa: { contains: filters.placa, mode: 'insensitive' as Prisma.QueryMode }
          }
        })
      },
      ...(filters.ticketId && { ticketId: filters.ticketId }),
      ...(filters.controladorId && { controladorId: filters.controladorId }),
      ...(filters.aprobadoPorId && { aprobadoPorId: filters.aprobadoPorId }),
      ...(filters.numeroTicketGrifo && {
        numeroTicketGrifo: { contains: filters.numeroTicketGrifo, mode: 'insensitive' as Prisma.QueryMode }
      }),
      ...(filters.numeroFactura && {
        numeroFactura: { contains: filters.numeroFactura, mode: 'insensitive' as Prisma.QueryMode }
      }),
      ...(filters.fechaDesde || filters.fechaHasta) && {
        fechaAprobacion: {
          ...(filters.fechaDesde && { gte: new Date(filters.fechaDesde) }),
          ...(filters.fechaHasta && { lte: new Date(filters.fechaHasta) })
        }
      }
    };

    const total = await this.prisma.detalleAbastecimiento.count({ where });

    const detalles = await this.prisma.detalleAbastecimiento.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        ticket: {
          include: {
            unidad: true,
            conductor: true,
            estado: true,
            grifo: {
              include: {
                sede: {
                  include: {
                    zona: true
                  }
                }
              }
            },
            itinerario: true,
            ruta: true
          }
        },
        controlador: true,
        aprobadoPor: true,
        concluidoPor: true
      }
    });

    const data = detalles.map(detalle => this.mapToResponseDto(detalle));

    const offset = (page - 1) * pageSize;
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        offset,
        limit: pageSize,
        nextOffset: hasNext ? offset + pageSize : null,
        prevOffset: hasPrevious ? Math.max(0, offset - pageSize) : null,
        hasNext,
        hasPrevious,
        filtro: {
          grifoId: grifoId || null,
          sedeId: sedeId || null,
          zonaId: zonaId || null
        }
      }
    };
  }

  async findOne(id: number): Promise<DetalleAbastecimientoResponseDto> {
    const detalle = await this.prisma.detalleAbastecimiento.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            unidad: true,
            conductor: true,
            estado: true,
            grifo: {
              include: {
                sede: {
                  include: {
                    zona: true
                  }
                }
              }
            },
            itinerario: true,
            ruta: true
          }
        },
        controlador: true,
        aprobadoPor: true,
        concluidoPor: true
      }
    });

    if (!detalle) {
      throw new NotFoundException(`Detalle de abastecimiento con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(detalle);
  }

  async findByTicketId(ticketId: number): Promise<DetalleAbastecimientoResponseDto> {
    const detalle = await this.prisma.detalleAbastecimiento.findUnique({
      where: { ticketId },
      include: {
        ticket: {
          include: {
            unidad: true,
            conductor: true,
            estado: true,
            grifo: {
              include: {
                sede: {
                  include: {
                    zona: true
                  }
                }
              }
            },
            itinerario: true,
            ruta: true
          }
        },
        controlador: true,
        aprobadoPor: true,
        concluidoPor: true
      }
    });

    if (!detalle) {
      throw new NotFoundException(`No existe detalle de abastecimiento para el ticket ${ticketId}`);
    }

    return this.mapToResponseDto(detalle);
  }

  async cambiarEstado(
    id: number,
    estado: string,
    usuarioId?: number
  ): Promise<DetalleAbastecimientoResponseDto> {
    const detalleExistente = await this.prisma.detalleAbastecimiento.findUnique({
      where: { id },
      include: { ticket: { include: { estado: true } } }
    });

    if (!detalleExistente) {
      throw new NotFoundException(`Detalle de abastecimiento con ID ${id} no encontrado`);
    }

    if (detalleExistente.ticket.estado.nombre !== 'APROBADO') {
      throw new BadRequestException(
        `No se puede cambiar el estado de un detalle cuyo ticket no está APROBADO`
      );
    }

    const updateData: any = {
      estado,
      updatedAt: new Date()
    };

    if (estado === 'CONCLUIDO') {
      updateData.fechaConcluido = new Date();
      updateData.concluidoPorId = usuarioId;
    }

    if (estado === 'EN_PROGRESO') {
      updateData.fechaConcluido = null;
      updateData.concluidoPorId = null;
    }

    const detalleActualizado = await this.prisma.detalleAbastecimiento.update({
      where: { id },
      data: updateData,
      include: {
        ticket: {
          include: {
            unidad: true,
            conductor: true,
            estado: true,
            grifo: {
              include: {
                sede: {
                  include: {
                    zona: true
                  }
                }
              }
            },
            itinerario: true,
            ruta: true
          }
        },
        controlador: true,
        aprobadoPor: true,
        concluidoPor: true
      }
    });

    return this.mapToResponseDto(detalleActualizado);
  }

  async update(id: number, updateDetalleDto: UpdateDetalleDto): Promise<DetalleAbastecimientoResponseDto> {
    const detalleExistente = await this.prisma.detalleAbastecimiento.findUnique({
      where: { id },
      include: { ticket: { include: { estado: true } } }
    });

    if (!detalleExistente) {
      throw new NotFoundException(`Detalle de abastecimiento con ID ${id} no encontrado`);
    }

    if (detalleExistente.ticket.estado.nombre !== 'APROBADO') {
      throw new BadRequestException(
        `No se puede actualizar un detalle cuyo ticket no está APROBADO`
      );
    }

    if (detalleExistente.estado === 'CONCLUIDO') {
      throw new BadRequestException(
        'No se puede actualizar un detalle que ya está CONCLUIDO'
      );
    }

    if (updateDetalleDto.controladorId) {
      const controladorExiste = await this.prisma.usuario.findUnique({
        where: { id: updateDetalleDto.controladorId }
      });

      if (!controladorExiste) {
        throw new NotFoundException(`Controlador con ID ${updateDetalleDto.controladorId} no encontrado`);
      }
    }

    const updateData: any = {
      ...(updateDetalleDto.cantidadAbastecida !== undefined && { cantidadAbastecida: updateDetalleDto.cantidadAbastecida }),
      ...(updateDetalleDto.motivoDiferencia !== undefined && { motivoDiferencia: updateDetalleDto.motivoDiferencia }),
      ...(updateDetalleDto.horometroActual !== undefined && { horometroActual: updateDetalleDto.horometroActual }),
      ...(updateDetalleDto.horometroAnterior !== undefined && { horometroAnterior: updateDetalleDto.horometroAnterior }),
      ...(updateDetalleDto.precintoAnterior !== undefined && { precintoAnterior: updateDetalleDto.precintoAnterior }),
      ...(updateDetalleDto.precinto2 !== undefined && { precinto2: updateDetalleDto.precinto2 }),
      ...(updateDetalleDto.unidadMedida !== undefined && { unidadMedida: updateDetalleDto.unidadMedida }),
      ...(updateDetalleDto.costoPorUnidad !== undefined && { costoPorUnidad: updateDetalleDto.costoPorUnidad }),
      ...(updateDetalleDto.costoTotal !== undefined && { costoTotal: updateDetalleDto.costoTotal }),
      ...(updateDetalleDto.numeroTicketGrifo !== undefined && { numeroTicketGrifo: updateDetalleDto.numeroTicketGrifo }),
      ...(updateDetalleDto.valeDiesel !== undefined && { valeDiesel: updateDetalleDto.valeDiesel }),
      ...(updateDetalleDto.numeroFactura !== undefined && { numeroFactura: updateDetalleDto.numeroFactura }),
      ...(updateDetalleDto.importeFactura !== undefined && { importeFactura: updateDetalleDto.importeFactura }),
      ...(updateDetalleDto.requerimiento !== undefined && { requerimiento: updateDetalleDto.requerimiento }),
      ...(updateDetalleDto.numeroSalidaAlmacen !== undefined && { numeroSalidaAlmacen: updateDetalleDto.numeroSalidaAlmacen }),
      ...(updateDetalleDto.observacionesControlador !== undefined && { observacionesControlador: updateDetalleDto.observacionesControlador }),
      ...(updateDetalleDto.controladorId !== undefined && { controladorId: updateDetalleDto.controladorId }),
      updatedAt: new Date()
    };

    const detalleActualizado = await this.prisma.detalleAbastecimiento.update({
      where: { id },
      data: updateData,
      include: {
        ticket: {
          include: {
            unidad: true,
            conductor: true,
            estado: true,
            grifo: {
              include: {
                sede: {
                  include: {
                    zona: true
                  }
                }
              }
            },
            itinerario: true,
            ruta: true
          }
        },
        controlador: true,
        aprobadoPor: true,
        concluidoPor: true
      }
    });

    return this.mapToResponseDto(detalleActualizado);
  }

  async getEstadisticas(
    fechaDesde?: string,
    fechaHasta?: string,
    grifoId?: number,
    zonaId?: number,
    sedeId?: number
  ) {
    const whereUbicacion: any = {};

    if (grifoId) {
      whereUbicacion.ticket = { grifoId };
    } else if (sedeId) {
      whereUbicacion.ticket = { grifo: { sedeId } };
    } else if (zonaId) {
      whereUbicacion.ticket = { grifo: { sede: { zonaId } } };
    }

    const where: Prisma.DetalleAbastecimientoWhereInput = {
      ...whereUbicacion,
      ...(fechaDesde || fechaHasta) && {
        fechaAprobacion: {
          ...(fechaDesde && { gte: new Date(fechaDesde) }),
          ...(fechaHasta && { lte: new Date(fechaHasta) })
        }
      }
    };

    const [
      totalDetalles,
      sumaCostos,
      detallesPorUnidad
    ] = await Promise.all([
      this.prisma.detalleAbastecimiento.count({ where }),
      this.prisma.detalleAbastecimiento.aggregate({
        where,
        _sum: { costoTotal: true },
        _avg: { costoPorUnidad: true }
      }),
      this.prisma.detalleAbastecimiento.groupBy({
        by: ['ticketId'],
        where,
        _count: true
      })
    ]);

    return {
      totalDetalles,
      costoTotalAcumulado: sumaCostos._sum.costoTotal || 0,
      costoPromedioUnidad: sumaCostos._avg.costoPorUnidad || 0,
      totalUnidadesAbastecidas: detallesPorUnidad.length
    };
  }

  private mapToResponseDto(detalle: any): DetalleAbastecimientoResponseDto {
    return {
      id: detalle.id,
      ticketId: detalle.ticketId,
      cantidadAbastecida: detalle.cantidadAbastecida ? Number(detalle.cantidadAbastecida) : null,
      motivoDiferencia: detalle.motivoDiferencia,
      horometroActual: detalle.horometroActual,
      horometroAnterior: detalle.horometroAnterior,
      precintoAnterior: detalle.precintoAnterior,
      precinto2: detalle.precinto2,
      unidadMedida: detalle.unidadMedida,
      costoPorUnidad: detalle.costoPorUnidad,
      costoTotal: detalle.costoTotal,
      numeroTicketGrifo: detalle.numeroTicketGrifo,
      valeDiesel: detalle.valeDiesel,
      numeroFactura: detalle.numeroFactura,
      importeFactura: detalle.importeFactura,
      requerimiento: detalle.requerimiento,
      numeroSalidaAlmacen: detalle.numeroSalidaAlmacen,
      observacionesControlador: detalle.observacionesControlador,
      controladorId: detalle.controladorId,
      aprobadoPorId: detalle.aprobadoPorId,
      fechaAprobacion: detalle.fechaAprobacion,
      estado: detalle.estado || 'EN_PROGRESO',
      fechaConcluido: detalle.fechaConcluido,
      concluidoPorId: detalle.concluidoPorId,
      createdAt: detalle.createdAt,
      updatedAt: detalle.updatedAt,
      ticket: {
        id: detalle.ticket.id,
        numeroTicket: detalle.ticket.numeroTicket,
        fecha: detalle.ticket.fecha,
        hora: detalle.ticket.hora,
        placaUnidad: detalle.ticket.unidad.placa,
        unidadDescripcion: `${detalle.ticket.unidad.marca} ${detalle.ticket.unidad.modelo}`,
        conductorNombre: `${detalle.ticket.conductor.nombres} ${detalle.ticket.conductor.apellidos}`,
        grifoNombre: detalle.ticket.grifo.nombre,
        cantidad: detalle.ticket.cantidad ? Number(detalle.ticket.cantidad) : 0,
        estadoTicket: detalle.ticket.estado?.nombre || 'DESCONOCIDO',
        estadoColor: detalle.ticket.estado?.color || '#gray',
        itinerario: detalle.ticket.itinerario ? {
          id: detalle.ticket.itinerario.id,
          nombre: detalle.ticket.itinerario.nombre,
          codigo: detalle.ticket.itinerario.codigo,
          tipoItinerario: detalle.ticket.itinerario.tipoItinerario,
          distanciaTotal: detalle.ticket.itinerario.distanciaTotal,
          diasOperacion: detalle.ticket.itinerario.diasOperacion
        } : null,
        ruta: detalle.ticket.ruta ? {
          id: detalle.ticket.ruta.id,
          nombre: detalle.ticket.ruta.nombre,
          codigo: detalle.ticket.ruta.codigo,
          origen: detalle.ticket.ruta.origen,
          destino: detalle.ticket.ruta.destino,
          distanciaKm: detalle.ticket.ruta.distanciaKm
        } : null,
        origenAsignacion: detalle.ticket.origenAsignacion || 'NINGUNO'
      },

      controlador: detalle.controlador ? {
        id: detalle.controlador.id,
        nombreCompleto: `${detalle.controlador.nombres} ${detalle.controlador.apellidos}`,
        email: detalle.controlador.email
      } : undefined,
      aprobadoPor: {
        id: detalle.aprobadoPor.id,
        nombreCompleto: `${detalle.aprobadoPor.nombres} ${detalle.aprobadoPor.apellidos}`,
        email: detalle.aprobadoPor.email
      },
      concluidoPor: detalle.concluidoPor ? {
        id: detalle.concluidoPor.id,
        nombreCompleto: `${detalle.concluidoPor.nombres} ${detalle.concluidoPor.apellidos}`,
        email: detalle.concluidoPor.email
      } : undefined
    };
  }
}