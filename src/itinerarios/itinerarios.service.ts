// src/itinerarios/itinerarios.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateItinerarioDto, CreateTramoDto, EstadoItinerario } from './dto/create-itinerario.dto';
import { UpdateItinerarioDto } from './dto/update-itinerario.dto';
import { FiltrosItinerarioDto } from './dto/filtros-itinerario.dto';
import { ItinerarioResponseDto, ItinerariosPaginadosResponseDto, TramoResponseDto } from './dto/itinerario-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItinerariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo itinerario con sus tramos
   */
  async create(createItinerarioDto: CreateItinerarioDto): Promise<ItinerarioResponseDto> {
    // 1. Validar código único
    await this.validarCodigoUnico(createItinerarioDto.codigo);

    // 2. Validar secuencia de tramos
    this.validarSecuenciaTramos(createItinerarioDto.tramos);

    // 3. Validar que las rutas existen
    await this.validarRutasExisten(createItinerarioDto.tramos);

    // 4. Calcular totales
    const { distanciaTotal, tiempoTotal } = await this.calcularTotales(createItinerarioDto.tramos);

    try {
      // 5. Crear itinerario con tramos en una transacción
      const itinerario = await this.prisma.$transaction(async (prisma) => {
        // Crear el itinerario
        const nuevoItinerario = await prisma.itinerario.create({
          data: {
            nombre: createItinerarioDto.nombre,
            codigo: createItinerarioDto.codigo,
            descripcion: createItinerarioDto.descripcion || null,
            tipoItinerario: createItinerarioDto.tipoItinerario,
            distanciaTotal: distanciaTotal,
            tiempoEstimadoTotal: tiempoTotal,
            diasOperacion: createItinerarioDto.diasOperacion,
            horaInicioHabitual: createItinerarioDto.horaInicioHabitual || null,
            duracionEstimadaHoras: createItinerarioDto.duracionEstimadaHoras || null,
            estado: createItinerarioDto.estado || EstadoItinerario.ACTIVO,
            requiereSupervisor: createItinerarioDto.requiereSupervisor || false,
          },
        });

        // Crear los tramos
        const tramosCreados = await Promise.all(
          createItinerarioDto.tramos.map((tramo) =>
            prisma.tramoItinerario.create({
              data: {
                itinerarioId: nuevoItinerario.id,
                rutaId: tramo.rutaId,
                orden: tramo.orden,
                tipoTramo: tramo.tipoTramo,
                ciudadOrigen: tramo.ciudadOrigen,
                ciudadDestino: tramo.ciudadDestino,
                puntoParada: tramo.puntoParada || null,
                direccionParada: tramo.direccionParada || null,
                coordenadasParada: tramo.coordenadasParada || null,
                tiempoParadaMinutos: tramo.tiempoParadaMinutos || null,
                esParadaObligatoria: tramo.esParadaObligatoria || false,
                requiereInspeccion: tramo.requiereInspeccion || false,
                requiereAbastecimiento: tramo.requiereAbastecimiento || false,
                requiereDocumentacion: tramo.requiereDocumentacion || false,
                toleranciaKm: tramo.toleranciaKm || null,
                toleranciaTiempo: tramo.toleranciaTiempo || null,
                horarioPreferido: tramo.horarioPreferido || null,
                restriccionesClimaticas: tramo.restriccionesClimaticas || null,
                observaciones: tramo.observaciones || null,
              },
              include: {
                ruta: true,
              },
            })
          )
        );

        return { ...nuevoItinerario, tramos: tramosCreados };
      });

      return this.mapearItinerarioAResponse(itinerario);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un itinerario con este código');
      }
      throw error;
    }
  }

  /**
   * Listar itinerarios con paginación y filtros
   */
  async findAll(filtros: FiltrosItinerarioDto): Promise<ItinerariosPaginadosResponseDto> {
    const { page = 1, pageSize = 10, orderBy = 'nombre', orderDirection = 'asc' } = filtros;

    // Construir condiciones de búsqueda
    const where: Prisma.ItinerarioWhereInput = this.construirFiltros(filtros);

    // Calcular skip
    const skip = (page - 1) * pageSize;

    // Construir ordenamiento
    const orderByClause = this.construirOrdenamiento(orderBy, orderDirection);

    // Ejecutar consultas en paralelo
    const [itinerarios, total] = await Promise.all([
      this.prisma.itinerario.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: orderByClause,
        include: {
          tramos: {
            orderBy: { orden: 'asc' },
            include: {
              ruta: true,
            },
          },
          _count: {
            select: {
              asignacionesUnidades: true,
              ejecuciones: true,
            },
          },
        },
      }),
      this.prisma.itinerario.count({ where }),
    ]);

    // Mapear resultados
    const data = itinerarios.map((itinerario) => this.mapearItinerarioAResponse(itinerario));

    // Calcular metadata
    const totalPages = Math.ceil(total / pageSize);
    const offset = skip;
    const nextOffset = page < totalPages ? skip + pageSize : null;
    const prevOffset = page > 1 ? skip - pageSize : null;
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
        nextOffset,
        prevOffset,
        hasNext,
        hasPrevious,
      },
    };
  }

  /**
   * Obtener un itinerario por ID
   */
  async findOne(id: number): Promise<ItinerarioResponseDto> {
    const itinerario = await this.prisma.itinerario.findUnique({
      where: { id },
      include: {
        tramos: {
          orderBy: { orden: 'asc' },
          include: {
            ruta: true,
          },
        },
        _count: {
          select: {
            asignacionesUnidades: true,
            ejecuciones: true,
            ticketsAbastecimiento: true,
          },
        },
      },
    });

    if (!itinerario) {
      throw new NotFoundException(`Itinerario con ID ${id} no encontrado`);
    }

    return this.mapearItinerarioAResponse(itinerario);
  }

  /**
   * Buscar itinerario por código
   */
  async findByCodigo(codigo: string): Promise<ItinerarioResponseDto> {
    const itinerario = await this.prisma.itinerario.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: {
        tramos: {
          orderBy: { orden: 'asc' },
          include: {
            ruta: true,
          },
        },
        _count: {
          select: {
            asignacionesUnidades: true,
            ejecuciones: true,
          },
        },
      },
    });

    if (!itinerario) {
      throw new NotFoundException(`Itinerario con código ${codigo} no encontrado`);
    }

    return this.mapearItinerarioAResponse(itinerario);
  }

  /**
   * Actualizar un itinerario (sin modificar tramos)
   */
  async update(id: number, updateItinerarioDto: UpdateItinerarioDto): Promise<ItinerarioResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza el código, validar que sea único
    if (updateItinerarioDto.codigo) {
      await this.validarCodigoUnico(updateItinerarioDto.codigo, id);
    }

    try {
      const itinerario = await this.prisma.itinerario.update({
        where: { id },
        data: {
          ...(updateItinerarioDto.nombre && { nombre: updateItinerarioDto.nombre }),
          ...(updateItinerarioDto.codigo && { codigo: updateItinerarioDto.codigo }),
          ...(updateItinerarioDto.descripcion !== undefined && { descripcion: updateItinerarioDto.descripcion }),
          ...(updateItinerarioDto.tipoItinerario && { tipoItinerario: updateItinerarioDto.tipoItinerario }),
          ...(updateItinerarioDto.diasOperacion && { diasOperacion: updateItinerarioDto.diasOperacion }),
          ...(updateItinerarioDto.horaInicioHabitual !== undefined && {
            horaInicioHabitual: updateItinerarioDto.horaInicioHabitual,
          }),
          ...(updateItinerarioDto.duracionEstimadaHoras !== undefined && {
            duracionEstimadaHoras: updateItinerarioDto.duracionEstimadaHoras,
          }),
          ...(updateItinerarioDto.estado && { estado: updateItinerarioDto.estado }),
          ...(updateItinerarioDto.requiereSupervisor !== undefined && {
            requiereSupervisor: updateItinerarioDto.requiereSupervisor,
          }),
        },
        include: {
          tramos: {
            orderBy: { orden: 'asc' },
            include: {
              ruta: true,
            },
          },
          _count: {
            select: {
              asignacionesUnidades: true,
              ejecuciones: true,
            },
          },
        },
      });

      return this.mapearItinerarioAResponse(itinerario);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un itinerario con este código');
      }
      throw error;
    }
  }

  /**
   * Eliminar un itinerario (soft delete)
   */
  async remove(id: number): Promise<{ message: string }> {
    const itinerario = await this.findOne(id);

    // Verificar si tiene asignaciones activas
    const asignacionesActivas = await this.prisma.unidadItinerario.count({
      where: {
        itinerarioId: id,
        fechaDesasignacion: null,
      },
    });

    if (asignacionesActivas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el itinerario porque tiene ${asignacionesActivas} asignación(es) activa(s)`
      );
    }

    // Verificar si tiene ejecuciones en curso
    const ejecucionesEnCurso = await this.prisma.ejecucionItinerario.count({
      where: {
        itinerarioId: id,
        estado: 'EN_CURSO',
      },
    });

    if (ejecucionesEnCurso > 0) {
      throw new BadRequestException(
        `No se puede eliminar el itinerario porque tiene ${ejecucionesEnCurso} ejecución(es) en curso`
      );
    }

    // Soft delete
    await this.prisma.itinerario.update({
      where: { id },
      data: { estado: EstadoItinerario.INACTIVO },
    });

    return {
      message: `Itinerario "${itinerario.nombre}" desactivado exitosamente`,
    };
  }

  /**
   * Agregar un tramo a un itinerario existente
   */
  async agregarTramo(itinerarioId: number, createTramoDto: CreateTramoDto): Promise<TramoResponseDto> {
    // Verificar que el itinerario existe
    const itinerario = await this.findOne(itinerarioId);

    // Validar que la ruta existe
    const ruta = await this.prisma.ruta.findUnique({
      where: { id: createTramoDto.rutaId },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${createTramoDto.rutaId} no encontrada`);
    }

    // Verificar que no exista ya un tramo con ese orden
    const tramoExistente = await this.prisma.tramoItinerario.findFirst({
      where: {
        itinerarioId,
        orden: createTramoDto.orden,
      },
    });

    if (tramoExistente) {
      throw new ConflictException(`Ya existe un tramo con orden ${createTramoDto.orden} en este itinerario`);
    }

    // Validar secuencia si no es el primer tramo
    if (createTramoDto.orden > 1) {
      const tramoAnterior = await this.prisma.tramoItinerario.findFirst({
        where: {
          itinerarioId,
          orden: createTramoDto.orden - 1,
        },
      });

      if (tramoAnterior && tramoAnterior.ciudadDestino !== createTramoDto.ciudadOrigen) {
        throw new BadRequestException(
          `La ciudad origen "${createTramoDto.ciudadOrigen}" no coincide con el destino del tramo anterior "${tramoAnterior.ciudadDestino}"`
        );
      }
    }

    // Crear el tramo
    const tramo = await this.prisma.tramoItinerario.create({
      data: {
        itinerarioId,
        rutaId: createTramoDto.rutaId,
        orden: createTramoDto.orden,
        tipoTramo: createTramoDto.tipoTramo,
        ciudadOrigen: createTramoDto.ciudadOrigen,
        ciudadDestino: createTramoDto.ciudadDestino,
        puntoParada: createTramoDto.puntoParada || null,
        direccionParada: createTramoDto.direccionParada || null,
        coordenadasParada: createTramoDto.coordenadasParada || null,
        tiempoParadaMinutos: createTramoDto.tiempoParadaMinutos || null,
        esParadaObligatoria: createTramoDto.esParadaObligatoria || false,
        requiereInspeccion: createTramoDto.requiereInspeccion || false,
        requiereAbastecimiento: createTramoDto.requiereAbastecimiento || false,
        requiereDocumentacion: createTramoDto.requiereDocumentacion || false,
        toleranciaKm: createTramoDto.toleranciaKm || null,
        toleranciaTiempo: createTramoDto.toleranciaTiempo || null,
        horarioPreferido: createTramoDto.horarioPreferido || null,
        restriccionesClimaticas: createTramoDto.restriccionesClimaticas || null,
        observaciones: createTramoDto.observaciones || null,
      },
      include: {
        ruta: true,
      },
    });

    // Recalcular totales del itinerario
    await this.recalcularTotalesItinerario(itinerarioId);

    return this.mapearTramoAResponse(tramo);
  }

  /**
   * Eliminar un tramo de un itinerario
   */
  async eliminarTramo(itinerarioId: number, tramoId: number): Promise<{ message: string }> {
    // Verificar que el itinerario existe
    await this.findOne(itinerarioId);

    // Verificar que el tramo existe y pertenece al itinerario
    const tramo = await this.prisma.tramoItinerario.findFirst({
      where: {
        id: tramoId,
        itinerarioId,
      },
    });

    if (!tramo) {
      throw new NotFoundException(`Tramo con ID ${tramoId} no encontrado en este itinerario`);
    }

    // Eliminar el tramo
    await this.prisma.tramoItinerario.delete({
      where: { id: tramoId },
    });

    // Reordenar tramos subsiguientes
    await this.reordenarTramos(itinerarioId, tramo.orden);

    // Recalcular totales
    await this.recalcularTotalesItinerario(itinerarioId);

    return {
      message: `Tramo ${tramo.orden} eliminado exitosamente`,
    };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Validar código único
   */
  private async validarCodigoUnico(codigo: string, excludeId?: number): Promise<void> {
    const existente = await this.prisma.itinerario.findUnique({
      where: { codigo: codigo.toUpperCase() },
      select: { id: true },
    });

    if (existente && existente.id !== excludeId) {
      throw new ConflictException(`Ya existe un itinerario con el código ${codigo}`);
    }
  }

  /**
   * Validar secuencia de tramos
   */
  private validarSecuenciaTramos(tramos: CreateTramoDto[]): void {
    // Ordenar por orden
    const tramosOrdenados = [...tramos].sort((a, b) => a.orden - b.orden);

    // Validar que los órdenes sean consecutivos
    for (let i = 0; i < tramosOrdenados.length; i++) {
      if (tramosOrdenados[i].orden !== i + 1) {
        throw new BadRequestException(
          `Los tramos deben tener orden consecutivo. Se esperaba orden ${i + 1}, pero se encontró ${tramosOrdenados[i].orden}`
        );
      }
    }

    // Validar secuencia de ciudades
    for (let i = 0; i < tramosOrdenados.length - 1; i++) {
      const tramoActual = tramosOrdenados[i];
      const tramoSiguiente = tramosOrdenados[i + 1];

      if (tramoActual.ciudadDestino !== tramoSiguiente.ciudadOrigen) {
        throw new BadRequestException(
          `Secuencia inválida: El destino del tramo ${tramoActual.orden} "${tramoActual.ciudadDestino}" debe coincidir con el origen del tramo ${tramoSiguiente.orden} "${tramoSiguiente.ciudadOrigen}"`
        );
      }
    }
  }

  /**
   * Validar que las rutas existen
   */
  private async validarRutasExisten(tramos: CreateTramoDto[]): Promise<void> {
    const rutaIds = [...new Set(tramos.map((t) => t.rutaId))];

    const rutas = await this.prisma.ruta.findMany({
      where: {
        id: { in: rutaIds },
      },
      select: { id: true },
    });

    if (rutas.length !== rutaIds.length) {
      const rutasEncontradas = rutas.map((r) => r.id);
      const rutasFaltantes = rutaIds.filter((id) => !rutasEncontradas.includes(id));
      throw new NotFoundException(`Rutas no encontradas: ${rutasFaltantes.join(', ')}`);
    }
  }

  /**
   * Calcular distancia total y tiempo total
   */
  private async calcularTotales(tramos: CreateTramoDto[]): Promise<{ distanciaTotal: number; tiempoTotal: number }> {
    const rutaIds = tramos.map((t) => t.rutaId);

    const rutas = await this.prisma.ruta.findMany({
      where: {
        id: { in: rutaIds },
      },
      select: {
        id: true,
        distanciaKm: true,
        tiempoEstimadoMinutos: true,
      },
    });

    let distanciaTotal = 0;
    let tiempoTotal = 0;

    for (const tramo of tramos) {
      const ruta = rutas.find((r) => r.id === tramo.rutaId);
      if (ruta) {
        distanciaTotal += Number(ruta.distanciaKm || 0);
        tiempoTotal += Number(ruta.tiempoEstimadoMinutos || 0);
        tiempoTotal += Number(tramo.tiempoParadaMinutos || 0);
      }
    }

    return { distanciaTotal, tiempoTotal };
  }

  /**
   * Recalcular totales del itinerario
   */
  private async recalcularTotalesItinerario(itinerarioId: number): Promise<void> {
    const tramos = await this.prisma.tramoItinerario.findMany({
      where: { itinerarioId },
      include: { ruta: true },
    });

    let distanciaTotal = 0;
    let tiempoTotal = 0;

    for (const tramo of tramos) {
      distanciaTotal += Number(tramo.ruta.distanciaKm || 0);
      tiempoTotal += Number(tramo.ruta.tiempoEstimadoMinutos || 0);
      tiempoTotal += Number(tramo.tiempoParadaMinutos || 0);
    }

    await this.prisma.itinerario.update({
      where: { id: itinerarioId },
      data: {
        distanciaTotal,
        tiempoEstimadoTotal: tiempoTotal,
      },
    });
  }

  /**
   * Reordenar tramos después de eliminar uno
   */
  private async reordenarTramos(itinerarioId: number, ordenEliminado: number): Promise<void> {
    const tramosPosteriores = await this.prisma.tramoItinerario.findMany({
      where: {
        itinerarioId,
        orden: { gt: ordenEliminado },
      },
      orderBy: { orden: 'asc' },
    });

    for (const tramo of tramosPosteriores) {
      await this.prisma.tramoItinerario.update({
        where: { id: tramo.id },
        data: { orden: tramo.orden - 1 },
      });
    }
  }

  /**
   * Construir filtros
   */
  private construirFiltros(filtros: FiltrosItinerarioDto): Prisma.ItinerarioWhereInput {
    const where: Prisma.ItinerarioWhereInput = {};

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.tipoItinerario) {
      where.tipoItinerario = filtros.tipoItinerario;
    }

    if (filtros.nombre) {
      where.nombre = {
        contains: filtros.nombre,
        mode: 'insensitive',
      };
    }

    if (filtros.codigo) {
      where.codigo = filtros.codigo.toUpperCase();
    }

    return where;
  }

  /**
   * Construir ordenamiento
   */
  private construirOrdenamiento(
    orderBy: string,
    orderDirection: 'asc' | 'desc'
  ): Prisma.ItinerarioOrderByWithRelationInput {
    const validFields = ['nombre', 'codigo', 'distanciaTotal', 'createdAt'];

    if (!validFields.includes(orderBy)) {
      orderBy = 'nombre';
    }

    return { [orderBy]: orderDirection };
  }

  /**
   * Mapear itinerario a DTO de respuesta
   */
  private mapearItinerarioAResponse(itinerario: any): ItinerarioResponseDto {
    return {
      id: itinerario.id,
      nombre: itinerario.nombre,
      codigo: itinerario.codigo,
      descripcion: itinerario.descripcion,
      tipoItinerario: itinerario.tipoItinerario,
      distanciaTotal: itinerario.distanciaTotal,
      tiempoEstimadoTotal: itinerario.tiempoEstimadoTotal,
      diasOperacion: itinerario.diasOperacion,
      horaInicioHabitual: itinerario.horaInicioHabitual,
      duracionEstimadaHoras: itinerario.duracionEstimadaHoras,
      estado: itinerario.estado,
      requiereSupervisor: itinerario.requiereSupervisor,
      createdAt: itinerario.createdAt,
      updatedAt: itinerario.updatedAt,
      tramos: itinerario.tramos ? itinerario.tramos.map((t) => this.mapearTramoAResponse(t)) : undefined,
      unidadesAsignadas: itinerario._count?.asignacionesUnidades || 0,
      ejecucionesRealizadas: itinerario._count?.ejecuciones || 0,
    };
  }

  /**
   * Mapear tramo a DTO de respuesta
   */
  private mapearTramoAResponse(tramo: any): TramoResponseDto {
    return {
      id: tramo.id,
      itinerarioId: tramo.itinerarioId,
      rutaId: tramo.rutaId,
      ruta: tramo.ruta
        ? {
            id: tramo.ruta.id,
            nombre: tramo.ruta.nombre,
            codigo: tramo.ruta.codigo,
            origen: tramo.ruta.origen,
            destino: tramo.ruta.destino,
            distanciaKm: tramo.ruta.distanciaKm,
            tiempoEstimadoMinutos: tramo.ruta.tiempoEstimadoMinutos,
          }
        : undefined,
      orden: tramo.orden,
      tipoTramo: tramo.tipoTramo,
      ciudadOrigen: tramo.ciudadOrigen,
      ciudadDestino: tramo.ciudadDestino,
      puntoParada: tramo.puntoParada,
      direccionParada: tramo.direccionParada,
      coordenadasParada: tramo.coordenadasParada,
      tiempoParadaMinutos: tramo.tiempoParadaMinutos,
      esParadaObligatoria: tramo.esParadaObligatoria,
      requiereInspeccion: tramo.requiereInspeccion,
      requiereAbastecimiento: tramo.requiereAbastecimiento,
      requiereDocumentacion: tramo.requiereDocumentacion,
      toleranciaKm: tramo.toleranciaKm,
      toleranciaTiempo: tramo.toleranciaTiempo,
      horarioPreferido: tramo.horarioPreferido,
      restriccionesClimaticas: tramo.restriccionesClimaticas,
      observaciones: tramo.observaciones,
      createdAt: tramo.createdAt,
      updatedAt: tramo.updatedAt,
    };
  }
}