// =============================================
// src/tickets_abastecimiento/tickets_abastecimiento.service.ts
// =============================================

import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException,
  UnauthorizedException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { plainToInstance } from 'class-transformer';

import { QueryTicketDto } from './dto/query-ticket.dto';
import { RechazarTicketDto } from './dto/rechazar-ticket.dto';
import { TicketAbastecimientoResponseDto } from './dto/ticket-response.dto';
import { CreateTicketAbastecimientoDto } from './dto/create-tickets_abastecimiento.dto';
import { UpdateTicketAbastecimientoDto } from './dto/update-tickets_abastecimiento.dto';

@Injectable()
export class TicketsAbastecimientoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear nuevo ticket de abastecimiento
   */
  async create(
    createTicketDto: CreateTicketAbastecimientoDto,
    solicitadoPorId: number
  ): Promise<TicketAbastecimientoResponseDto> {
    // 1. Validar referencias activas
    await this.validateReferences(createTicketDto);

    // 2. Validar kilometraje secuencial
    if (createTicketDto.kilometrajeAnterior) {
      await this.validateKilometrajeSecuencial(
        createTicketDto.unidadId,
        createTicketDto.kilometrajeActual,
        createTicketDto.kilometrajeAnterior
      );
    }

    // 3. Validar precinto único
    await this.validatePrecintoUnico(createTicketDto.precintoNuevo);

    // 4. Generar número de ticket
    const numeroTicket = await this.generateNumeroTicket();

    // 5. Obtener estado inicial (SOLICITADO)
    const estadoInicial = await this.prisma.estadoTicketAbastecimiento.findFirst({
      where: { nombre: 'SOLICITADO' }
    });

    if (!estadoInicial) {
      throw new BadRequestException('No se encuentra el estado inicial para tickets');
    }

    // 6. Crear ticket
    const ticketData = {
      numeroTicket,
      fecha: createTicketDto.fecha ? new Date(createTicketDto.fecha) : new Date(),
      hora: createTicketDto.hora ?
        new Date(`1970-01-01T${createTicketDto.hora}Z`) :
        new Date(),
      turnoId: createTicketDto.turnoId,
      unidadId: createTicketDto.unidadId,
      conductorId: createTicketDto.conductorId,
      grifoId: createTicketDto.grifoId,
      rutaId: createTicketDto.rutaId,
      kilometrajeActual: createTicketDto.kilometrajeActual,
      kilometrajeAnterior: createTicketDto.kilometrajeAnterior,
      precintoNuevo: createTicketDto.precintoNuevo,
      tipoCombustible: createTicketDto.tipoCombustible,
      cantidad: createTicketDto.cantidad,
      observacionesSolicitud: createTicketDto.observacionesSolicitud,
      estadoId: estadoInicial.id,
      solicitadoPorId
    };

    const ticket = await this.prisma.ticketAbastecimiento.create({
      data: ticketData,
      include: this.getIncludeOptions()
    });

    return this.transformToResponseDto(ticket);
  }

 async findAll(queryDto: QueryTicketDto) {
  const { page, limit, search, orderBy, orderDirection, ...filters } = queryDto;
  
  const skip = (page - 1) * Math.min(limit, 100);
  const take = Math.min(limit, 100);

  // Construir condiciones WHERE
  const whereConditions: any = {
    AND: []
  };

  // Filtro de búsqueda general
  if (search) {
    whereConditions.AND.push({
      OR: [
        { numeroTicket: { contains: search, mode: 'insensitive' } },
        { unidad: { placa: { contains: search, mode: 'insensitive' } } },
        { conductor: { nombres: { contains: search, mode: 'insensitive' } } },
        { conductor: { apellidos: { contains: search, mode: 'insensitive' } } },
        { conductor: { dni: { contains: search, mode: 'insensitive' } } }
      ]
    });
  }

  // Filtros específicos
  if (filters.unidadId) {
    whereConditions.AND.push({ unidadId: filters.unidadId });
  }

  if (filters.conductorId) {
    whereConditions.AND.push({ conductorId: filters.conductorId });
  }

  if (filters.grifoId) {
    whereConditions.AND.push({ grifoId: filters.grifoId });
  }

  if (filters.estadoId) {
    whereConditions.AND.push({ estadoId: filters.estadoId });
  }

  if (filters.tipoCombustible) {
    whereConditions.AND.push({ tipoCombustible: filters.tipoCombustible });
  }

  // Filtro de fechas
  if (filters.fechaInicio || filters.fechaFin) {
    const fechaConditions: any = {};
    if (filters.fechaInicio) {
      fechaConditions.gte = new Date(filters.fechaInicio);
    }
    if (filters.fechaFin) {
      fechaConditions.lte = new Date(filters.fechaFin);
    }
    whereConditions.AND.push({ fecha: fechaConditions });
  }

  // Filtro solo pendientes
  if (filters.solosPendientes) {
    whereConditions.AND.push({
      estado: { nombre: 'SOLICITADO' }
    });
  }

  // Si no hay condiciones, remover el AND vacío
  if (whereConditions.AND.length === 0) {
    delete whereConditions.AND;
  }

  // Configurar ordenamiento
  const orderByClause = this.buildOrderBy(orderBy, orderDirection);

  // ========== OPTIMIZACIÓN: SELECT ESPECÍFICO ==========
  // Ejecutar consultas con SELECT optimizado
  const [tickets, total] = await Promise.all([
    this.prisma.ticketAbastecimiento.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy: orderByClause,
      select: {
        // Campos principales del ticket
        id: true,
        numeroTicket: true,
        fecha: true,
        hora: true,
        kilometrajeActual: true,
        kilometrajeAnterior: true,
        precintoNuevo: true,
        tipoCombustible: true,
        cantidad: true,
        observacionesSolicitud: true,
        fechaSolicitud: true,
        motivoRechazo: true,
        fechaRechazo: true,
        createdAt: true,
        updatedAt: true,
        
        // Turno - Solo campos esenciales
        turno: {
          select: {
            id: true,
            nombre: true,
            horaInicio: true,
            horaFin: true
          }
        },
        
        // Unidad - Solo campos esenciales
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            tipoCombustible: true
          }
        },
        
        // Conductor - Solo campos esenciales
        conductor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        },
        
        // Grifo - Solo campos esenciales
        grifo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            direccion: true
          }
        },
        
        // Ruta - Solo campos esenciales (opcional)
        ruta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            origen: true,
            destino: true
          }
        },
        
        // Estado - Solo campos esenciales
        estado: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true
          }
        },
        
        // Usuario que solicitó - Solo campos esenciales
        solicitadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true
          }
        },
        
        // Usuario que rechazó - Solo campos esenciales (opcional)
        rechazadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true
          }
        }
      }
    }),
    this.prisma.ticketAbastecimiento.count({ where: whereConditions })
  ]);

  // Calcular diferencia de kilometraje para cada ticket
  const ticketsConDiferencia = tickets.map(ticket => {
    // Convertir Decimal a Number primero
    const kmActual = Number(ticket.kilometrajeActual) || 0;
    const kmAnterior = ticket.kilometrajeAnterior ? Number(ticket.kilometrajeAnterior) : null;
    
    // Calcular diferencia
    const diferenciaKilometraje = kmAnterior 
      ? Number((kmActual - kmAnterior).toFixed(2))
      : 0;

    return {
      ...ticket,
      diferenciaKilometraje,
      // Formatear fechas y horas
      fecha: ticket.fecha?.toISOString().split('T')[0],
      hora: ticket.hora?.toISOString().split('T')[1]?.split('.')[0],
      // Convertir Decimals de Prisma a Numbers
      kilometrajeActual: kmActual,
      kilometrajeAnterior: kmAnterior,
      cantidad: Number(ticket.cantidad) || 0
    };
  });

  return {
    data: ticketsConDiferencia,
    meta: {
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
      hasNextPage: page < Math.ceil(total / take),
      hasPreviousPage: page > 1
    }
  };
}


  /**
   * Obtener ticket por ID
   */
  // async findOne(id: number): Promise<TicketAbastecimientoResponseDto> {
  //   const ticket = await this.prisma.ticketAbastecimiento.findUnique({
  //     where: { id },
  //     include: this.getIncludeOptions()
  //   });

  //   if (!ticket) {
  //     throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
  //   }

  //   return this.transformToResponseDto(ticket);
  // }
  async findOne(id: number) {
  const ticket = await this.prisma.ticketAbastecimiento.findUnique({
    where: { id },
    select: {
      id: true,
      numeroTicket: true,
      fecha: true,
      hora: true,
      kilometrajeActual: true,
      kilometrajeAnterior: true,
      precintoNuevo: true,
      tipoCombustible: true,
      cantidad: true,
      observacionesSolicitud: true,
      fechaSolicitud: true,
      motivoRechazo: true,
      fechaRechazo: true,
      createdAt: true,
      updatedAt: true,
      
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
          // zona: {
          //   select: {
          //     id: true,
          //     nombre: true
          //   }
          // }
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
      grifo: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
          direccion: true
        }
      },
      ruta: {
        select: {
          id: true,
          nombre: true,
          codigo: true,
          origen: true,
          destino: true
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
      solicitadoPor: {
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
    }
  });

  if (!ticket) {
    throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
  }

  // Convertir Decimals a Number primero
  const kmActual = Number(ticket.kilometrajeActual) || 0;
  const kmAnterior = ticket.kilometrajeAnterior ? Number(ticket.kilometrajeAnterior) : null;

  // Calcular diferencia de kilometraje
  const diferenciaKilometraje = kmAnterior 
    ? Number((kmActual - kmAnterior).toFixed(2))
    : 0;

  return {
    ...ticket,
    diferenciaKilometraje,
    fecha: ticket.fecha?.toISOString().split('T')[0],
    hora: ticket.hora?.toISOString().split('T')[1]?.split('.')[0],
    kilometrajeActual: kmActual,
    kilometrajeAnterior: kmAnterior,
    cantidad: Number(ticket.cantidad) || 0
  };
}

  /**
   * Actualizar ticket (solo si está en estado SOLICITADO)
   */
  async update(
    id: number,
    updateTicketDto: UpdateTicketAbastecimientoDto,
    userId: number
  ): Promise<TicketAbastecimientoResponseDto> {
    // Verificar que el ticket existe y está en estado editable
    const existingTicket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id },
      include: { estado: true }
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    if (existingTicket.estado.nombre !== 'SOLICITADO') {
      throw new BadRequestException(
        `No se puede modificar un ticket en estado ${existingTicket.estado.nombre}`
      );
    }

    // Verificar que solo el solicitante puede editar
    if (existingTicket.solicitadoPorId !== userId) {
      throw new UnauthorizedException('Solo el solicitante puede modificar este ticket');
    }

    // Validar precinto si se está actualizando
    if (updateTicketDto.precintoNuevo && 
        updateTicketDto.precintoNuevo !== existingTicket.precintoNuevo) {
      await this.validatePrecintoUnico(updateTicketDto.precintoNuevo);
    }

    // Validar kilometraje si se está actualizando
    if (updateTicketDto.kilometrajeActual || updateTicketDto.kilometrajeAnterior) {
      const kmActual = updateTicketDto.kilometrajeActual ?? Number(existingTicket.kilometrajeActual);
      const kmAnterior = updateTicketDto.kilometrajeAnterior ?? 
        (existingTicket.kilometrajeAnterior ? Number(existingTicket.kilometrajeAnterior) : undefined);

      if (kmAnterior) {
        await this.validateKilometrajeSecuencial(
          existingTicket.unidadId,
          kmActual,
          kmAnterior,
          id
        );
      }
    }

    // Actualizar ticket
    const updatedTicket = await this.prisma.ticketAbastecimiento.update({
      where: { id },
      data: {
        ...updateTicketDto,
        fecha: updateTicketDto.fecha ? new Date(updateTicketDto.fecha) : undefined,
        hora: updateTicketDto.hora ? 
          new Date(`1970-01-01T${updateTicketDto.hora}Z`) : undefined,
        precintoNuevo: updateTicketDto.precintoNuevo?.toUpperCase(),
        updatedAt: new Date()
      },
      include: this.getIncludeOptions()
    });

    return this.transformToResponseDto(updatedTicket);
  }

  /**
   * Aprobar ticket (crear detalle de abastecimiento)
   */
  async aprobar(id: number, aprobadoPorId: number): Promise<TicketAbastecimientoResponseDto> {
    const ticket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id },
      include: { estado: true }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    if (ticket.estado.nombre !== 'SOLICITADO') {
      throw new BadRequestException(
        `No se puede aprobar un ticket en estado ${ticket.estado.nombre}`
      );
    }

    // Obtener estado APROBADO
    const estadoAprobado = await this.prisma.estadoTicketAbastecimiento.findFirst({
      where: { nombre: 'APROBADO' }
    });

    if (!estadoAprobado) {
      throw new BadRequestException('No se encuentra el estado APROBADO');
    }

    // Usar transacción para aprobar ticket y crear detalle
    const result = await this.prisma.$transaction(async (prisma) => {
      // Actualizar estado del ticket
      const ticketAprobado = await prisma.ticketAbastecimiento.update({
        where: { id },
        data: {
          estadoId: estadoAprobado.id,
          updatedAt: new Date()
        },
        include: this.getIncludeOptions()
      });

      // Crear detalle de abastecimiento básico
      await prisma.detalleAbastecimiento.create({
        data: {
          ticketId: id,
          unidadMedida: 'GALONES',
          costoPorUnidad: 0, // Se actualizará cuando se complete el abastecimiento
          costoTotal: 0,
          aprobadoPorId,
          fechaAprobacion: new Date()
        }
      });

      return ticketAprobado;
    });

    return this.transformToResponseDto(result);
  }

  /**
   * Rechazar ticket
   */
  async rechazar(
    id: number,
    rechazarDto: RechazarTicketDto,
    rechazadoPorId: number
  ): Promise<TicketAbastecimientoResponseDto> {
    const ticket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id },
      include: { estado: true }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    if (ticket.estado.nombre !== 'SOLICITADO') {
      throw new BadRequestException(
        `No se puede rechazar un ticket en estado ${ticket.estado.nombre}`
      );
    }

    // Obtener estado RECHAZADO
    const estadoRechazado = await this.prisma.estadoTicketAbastecimiento.findFirst({
      where: { nombre: 'RECHAZADO' }
    });

    if (!estadoRechazado) {
      throw new BadRequestException('No se encuentra el estado RECHAZADO');
    }

    // Actualizar ticket
    const ticketRechazado = await this.prisma.ticketAbastecimiento.update({
      where: { id },
      data: {
        estadoId: estadoRechazado.id,
        motivoRechazo: rechazarDto.motivoRechazo,
        rechazadoPorId,
        fechaRechazo: new Date(),
        updatedAt: new Date()
      },
      include: this.getIncludeOptions()
    });

    return this.transformToResponseDto(ticketRechazado);
  }

  /**
   * Eliminar ticket (solo si está en estado SOLICITADO)
   */
  async remove(id: number, userId: number): Promise<void> {
    const ticket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id },
      include: { estado: true }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    if (ticket.estado.nombre !== 'SOLICITADO') {
      throw new BadRequestException(
        `No se puede eliminar un ticket en estado ${ticket.estado.nombre}`
      );
    }

    // Verificar que solo el solicitante puede eliminar
    if (ticket.solicitadoPorId !== userId) {
      throw new UnauthorizedException('Solo el solicitante puede eliminar este ticket');
    }

    await this.prisma.ticketAbastecimiento.delete({
      where: { id }
    });
  }

  /**
   * Obtener estadísticas de tickets
   */
  async getEstadisticas() {
    const [
      totalTickets,
      ticketsPendientes,
      ticketsAprobados,
      ticketsRechazados,
      ticketsHoy
    ] = await Promise.all([
      this.prisma.ticketAbastecimiento.count(),
      this.prisma.ticketAbastecimiento.count({
        where: { estado: { nombre: 'SOLICITADO' } }
      }),
      this.prisma.ticketAbastecimiento.count({
        where: { estado: { nombre: 'APROBADO' } }
      }),
      this.prisma.ticketAbastecimiento.count({
        where: { estado: { nombre: 'RECHAZADO' } }
      }),
      this.prisma.ticketAbastecimiento.count({
        where: {
          fecha: {
            gte: new Date(new Date().toDateString()),
            lt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      total: totalTickets,
      pendientes: ticketsPendientes,
      aprobados: ticketsAprobados,
      rechazados: ticketsRechazados,
      hoy: ticketsHoy,
      porcentajeAprobacion: totalTickets > 0 ? 
        Number(((ticketsAprobados / totalTickets) * 100).toFixed(2)) : 0
    };
  }

  /**
   * Obtener tickets por unidad
   */
  async findByUnidad(unidadId: number) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId }
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    const tickets = await this.prisma.ticketAbastecimiento.findMany({
      where: { unidadId },
      // take: limit,
      orderBy: { fecha: 'desc' },
      include: this.getIncludeOptions()
    });

    return tickets.map(ticket => this.transformToResponseDto(ticket));
  }

  /**
   * Obtener tickets por conductor
   */
  async findByConductor(conductorId: number, limit: number = 10) {
    const conductor = await this.prisma.usuario.findUnique({
      where: { id: conductorId }
    });

    if (!conductor) {
      throw new NotFoundException(`Conductor con ID ${conductorId} no encontrado`);
    }

    const tickets = await this.prisma.ticketAbastecimiento.findMany({
      where: { conductorId },
      take: limit,
      orderBy: { fecha: 'desc' },
      include: this.getIncludeOptions()
    });

    return tickets.map(ticket => this.transformToResponseDto(ticket));
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Validar que todas las referencias existan y estén activas
   */
  private async validateReferences(createDto: CreateTicketAbastecimientoDto) {
    const [unidad, conductor, grifo, turno, ruta] = await Promise.all([
      this.prisma.unidad.findFirst({
        where: { id: createDto.unidadId, activo: true }
      }),
      this.prisma.usuario.findFirst({
        where: { id: createDto.conductorId, activo: true }
      }),
      this.prisma.grifo.findFirst({
        where: { id: createDto.grifoId, activo: true }
      }),
      createDto.turnoId ? this.prisma.turno.findFirst({
        where: { id: createDto.turnoId, activo: true }
      }) : null,
      createDto.rutaId ? this.prisma.ruta.findFirst({
        where: { id: createDto.rutaId, activo: true }
      }) : null
    ]);

    if (!unidad) {
      throw new BadRequestException(`Unidad con ID ${createDto.unidadId} no encontrada o inactiva`);
    }

    if (!conductor) {
      throw new BadRequestException(`Conductor con ID ${createDto.conductorId} no encontrado o inactivo`);
    }

    if (!grifo) {
      throw new BadRequestException(`Grifo con ID ${createDto.grifoId} no encontrado o inactivo`);
    }

    if (createDto.turnoId && !turno) {
      throw new BadRequestException(`Turno con ID ${createDto.turnoId} no encontrado o inactivo`);
    }

    if (createDto.rutaId && !ruta) {
      throw new BadRequestException(`Ruta con ID ${createDto.rutaId} no encontrada o inactiva`);
    }

    // Validar compatibilidad de tipo de combustible
    if (createDto.tipoCombustible !== unidad.tipoCombustible) {
      throw new BadRequestException(
        `Tipo de combustible ${createDto.tipoCombustible} no compatible con unidad (${unidad.tipoCombustible})`
      );
    }
  }

  /**
   * Validar que el kilometraje sea secuencial
   */
  private async validateKilometrajeSecuencial(
    unidadId: number,
    kilometrajeActual: number,
    kilometrajeAnterior: number,
    excludeTicketId?: number
  ) {
    if (kilometrajeActual <= kilometrajeAnterior) {
      throw new BadRequestException(
        'El kilometraje actual debe ser mayor al kilometraje anterior'
      );
    }

    // Verificar último kilometraje registrado
    const where: any = { unidadId };
    if (excludeTicketId) {
      where.id = { not: excludeTicketId };
    }

    const ultimoTicket = await this.prisma.ticketAbastecimiento.findFirst({
      where,
      orderBy: { fecha: 'desc' },
      select: { kilometrajeActual: true }
    });

    if (ultimoTicket) {
      const ultimoKm = Number(ultimoTicket.kilometrajeActual);
      if (kilometrajeAnterior < ultimoKm) {
        throw new BadRequestException(
          `El kilometraje anterior (${kilometrajeAnterior}) debe ser mayor o igual al último registrado (${ultimoKm})`
        );
      }
    }
  }

  /**
   * Validar que el precinto sea único
   */
  private async validatePrecintoUnico(precintoNuevo: string) {
    const existingPrecinto = await this.prisma.ticketAbastecimiento.findFirst({
      where: { precintoNuevo: precintoNuevo.toUpperCase() }
    });

    if (existingPrecinto) {
      throw new ConflictException(`Ya existe un ticket con el precinto ${precintoNuevo}`);
    }
  }

  /**
   * Generar número único de ticket
   */
  private async generateNumeroTicket(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const prefix = `TK-${year}-${month}`;
    
    const lastTicket = await this.prisma.ticketAbastecimiento.findFirst({
      where: {
        numeroTicket: { startsWith: prefix }
      },
      orderBy: { numeroTicket: 'desc' }
    });

    let nextNumber = 1;
    
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.numeroTicket.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Construir cláusula orderBy
   */
  private buildOrderBy(orderBy: string, orderDirection: 'asc' | 'desc') {
  const validOrderFields = {
    fecha: { fecha: orderDirection },
    numeroTicket: { numeroTicket: orderDirection },
    unidad: { unidad: { placa: orderDirection } },
    conductor: { conductor: { apellidos: orderDirection } },
    cantidad: { cantidad: orderDirection },
    estado: { estado: { nombre: orderDirection } },
    kilometrajeActual: { kilometrajeActual: orderDirection }
  };

  return validOrderFields[orderBy] || { fecha: 'desc', numeroTicket: 'desc' };
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
      solicitadoPor: {
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
   * Transformar objeto de BD a DTO de respuesta
   */
  private transformToResponseDto(ticket: any): TicketAbastecimientoResponseDto {
    // Calcular diferencia de kilometraje - manejar valores null/undefined
    const kmActual = ticket.kilometrajeActual ? Number(ticket.kilometrajeActual) : 0;
    const kmAnterior = ticket.kilometrajeAnterior ? Number(ticket.kilometrajeAnterior) : null;

    const diferenciaKilometraje = kmActual && kmAnterior
      ? Number((kmActual - kmAnterior).toFixed(2))
      : 0;

    // Crear objeto manualmente para evitar problemas con plainToInstance
    return {
      id: ticket.id,
      numeroTicket: ticket.numeroTicket,
      fecha: ticket.fecha?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      hora: ticket.hora?.toISOString().split('T')[1]?.split('.')[0] || new Date().toISOString().split('T')[1]?.split('.')[0],
      turno: ticket.turno ? {
        id: ticket.turno.id,
        nombre: ticket.turno.nombre,
        horaInicio: ticket.turno.horaInicio?.toISOString().split('T')[1]?.split('.')[0] || '',
        horaFin: ticket.turno.horaFin?.toISOString().split('T')[1]?.split('.')[0] || ''
      } : undefined,
      unidad: ticket.unidad ? {
        id: ticket.unidad.id,
        placa: ticket.unidad.placa,
        marca: ticket.unidad.marca,
        modelo: ticket.unidad.modelo,
        tipoCombustible: ticket.unidad.tipoCombustible
      } : { id: 0, placa: '', marca: '', modelo: '', tipoCombustible: '' },
      conductor: ticket.conductor ? {
        id: ticket.conductor.id,
        nombres: ticket.conductor.nombres,
        apellidos: ticket.conductor.apellidos,
        dni: ticket.conductor.dni,
        codigoEmpleado: ticket.conductor.codigoEmpleado
      } : { id: 0, nombres: '', apellidos: '', dni: '', codigoEmpleado: '' },
      grifo: ticket.grifo ? {
        id: ticket.grifo.id,
        nombre: ticket.grifo.nombre,
        codigo: ticket.grifo.codigo,
        direccion: ticket.grifo.direccion
      } : { id: 0, nombre: '', codigo: '', direccion: '' },
      ruta: ticket.ruta ? {
        id: ticket.ruta.id,
        nombre: ticket.ruta.nombre,
        codigo: ticket.ruta.codigo,
        origen: ticket.ruta.origen,
        destino: ticket.ruta.destino
      } : undefined,
      kilometrajeActual: kmActual,
      kilometrajeAnterior: kmAnterior,
      diferenciaKilometraje,
      precintoNuevo: ticket.precintoNuevo,
      tipoCombustible: ticket.tipoCombustible,
      cantidad: ticket.cantidad ? Number(ticket.cantidad) : 0,
      observacionesSolicitud: ticket.observacionesSolicitud,
      estado: ticket.estado ? {
        id: ticket.estado.id,
        nombre: ticket.estado.nombre,
        descripcion: ticket.estado.descripcion,
        color: ticket.estado.color
      } : { id: 0, nombre: '', descripcion: '', color: '' },
      solicitadoPor: ticket.solicitadoPor ? {
        id: ticket.solicitadoPor.id,
        nombres: ticket.solicitadoPor.nombres,
        apellidos: ticket.solicitadoPor.apellidos,
        codigoEmpleado: ticket.solicitadoPor.codigoEmpleado
      } : { id: 0, nombres: '', apellidos: '', codigoEmpleado: '' },
      fechaSolicitud: ticket.fechaSolicitud,
      motivoRechazo: ticket.motivoRechazo,
      rechazadoPor: ticket.rechazadoPor ? {
        id: ticket.rechazadoPor.id,
        nombres: ticket.rechazadoPor.nombres,
        apellidos: ticket.rechazadoPor.apellidos,
        codigoEmpleado: ticket.rechazadoPor.codigoEmpleado
      } : undefined,
      fechaRechazo: ticket.fechaRechazo,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    } as TicketAbastecimientoResponseDto;
  }
}