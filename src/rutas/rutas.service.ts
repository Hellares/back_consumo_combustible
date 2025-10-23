// src/rutas/rutas.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRutaDto, EstadoRuta } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { FiltrosRutaDto } from './dto/filtros-ruta.dto';
import { RutaResponseDto, RutasPaginadasResponseDto } from './dto/ruta-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RutasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva ruta
   */
  async create(createRutaDto: CreateRutaDto): Promise<RutaResponseDto> {
    // Validar si el código ya existe (si se proporcionó)
    if (createRutaDto.codigo) {
      await this.validarCodigoUnico(createRutaDto.codigo);
    }

    // Validar coherencia de datos
    this.validarDatosRuta(createRutaDto);

    try {
      const ruta = await this.prisma.ruta.create({
        data: {
          nombre: createRutaDto.nombre,
          codigo: createRutaDto.codigo || null,
          descripcion: createRutaDto.descripcion || null,
          origen: createRutaDto.origen || null,
          destino: createRutaDto.destino || null,
          distanciaKm: createRutaDto.distanciaKm || null,
          tiempoEstimadoMinutos: createRutaDto.tiempoEstimadoMinutos || null,
          estado: createRutaDto.estado || EstadoRuta.ACTIVA,
        },
        include: {
          _count: {
            select: {
              asignacionesExcepcionales: {
                where: { activo: true },
              },
              tramosItinerario: true,
            },
          },
        },
      });

      return this.mapearRutaAResponse(ruta);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una ruta con este código');
      }
      throw error;
    }
  }

  /**
   * Listar rutas con paginación y filtros
   */
  async findAll(filtros: FiltrosRutaDto): Promise<RutasPaginadasResponseDto> {
    const { page = 1, pageSize = 10, orderBy = 'nombre', orderDirection = 'asc' } = filtros;

    // Construir condiciones de búsqueda
    const where: Prisma.RutaWhereInput = this.construirFiltros(filtros);

    // Calcular skip para paginación
    const skip = (page - 1) * pageSize;

    // Construir ordenamiento
    const orderByClause = this.construirOrdenamiento(orderBy, orderDirection);

    // Ejecutar consultas en paralelo
    const [rutas, total] = await Promise.all([
      this.prisma.ruta.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: orderByClause,
        include: {
          _count: {
            select: {
              asignacionesExcepcionales: {
                where: { activo: true },
              },
              tramosItinerario: true,
            },
          },
        },
      }),
      this.prisma.ruta.count({ where }),
    ]);

    // Mapear resultados
    const data = rutas.map(ruta => this.mapearRutaAResponse(ruta));

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / pageSize);
    const offset = skip;
    const limit = pageSize;
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
        limit,
        nextOffset,
        prevOffset,
        hasNext,
        hasPrevious,
      },
    };
  }

  /**
   * Obtener una ruta por ID
   */
  async findOne(id: number): Promise<RutaResponseDto> {
    const ruta = await this.prisma.ruta.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            asignacionesExcepcionales: {
              where: { activo: true },
            },
            tramosItinerario: true,
            ticketsAbastecimiento: true,
          },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return this.mapearRutaAResponse(ruta);
  }

  /**
   * Buscar ruta por código
   */
  async findByCodigo(codigo: string): Promise<RutaResponseDto> {
    const ruta = await this.prisma.ruta.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: {
        _count: {
          select: {
            asignacionesExcepcionales: {
              where: { activo: true },
            },
            tramosItinerario: true,
          },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con código ${codigo} no encontrada`);
    }

    return this.mapearRutaAResponse(ruta);
  }

  /**
   * Actualizar una ruta
   */
  async update(id: number, updateRutaDto: UpdateRutaDto): Promise<RutaResponseDto> {
    // Verificar que la ruta existe
    await this.findOne(id);

    // Si se actualiza el código, validar que sea único
    if (updateRutaDto.codigo) {
      await this.validarCodigoUnico(updateRutaDto.codigo, id);
    }

    // Validar coherencia de datos
    if (Object.keys(updateRutaDto).length > 0) {
      this.validarDatosRuta(updateRutaDto);
    }

    try {
      const ruta = await this.prisma.ruta.update({
        where: { id },
        data: {
          ...(updateRutaDto.nombre && { nombre: updateRutaDto.nombre }),
          ...(updateRutaDto.codigo !== undefined && { codigo: updateRutaDto.codigo }),
          ...(updateRutaDto.descripcion !== undefined && { descripcion: updateRutaDto.descripcion }),
          ...(updateRutaDto.origen !== undefined && { origen: updateRutaDto.origen }),
          ...(updateRutaDto.destino !== undefined && { destino: updateRutaDto.destino }),
          ...(updateRutaDto.distanciaKm !== undefined && { distanciaKm: updateRutaDto.distanciaKm }),
          ...(updateRutaDto.tiempoEstimadoMinutos !== undefined && {
            tiempoEstimadoMinutos: updateRutaDto.tiempoEstimadoMinutos,
          }),
          ...(updateRutaDto.estado && { estado: updateRutaDto.estado }),
        },
        include: {
          _count: {
            select: {
              asignacionesExcepcionales: {
                where: { activo: true },
              },
              tramosItinerario: true,
            },
          },
        },
      });

      return this.mapearRutaAResponse(ruta);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una ruta con este código');
      }
      throw error;
    }
  }

  /**
   * Eliminar una ruta (soft delete - cambiar a INACTIVA)
   */
  async remove(id: number): Promise<{ message: string }> {
    // Verificar que la ruta existe
    const ruta = await this.findOne(id);

    // Verificar si la ruta tiene asignaciones activas
    const asignacionesActivas = await this.prisma.unidadRuta.count({
      where: {
        rutaId: id,
        activo: true,
      },
    });

    if (asignacionesActivas > 0) {
      throw new BadRequestException(
        `No se puede eliminar la ruta porque tiene ${asignacionesActivas} asignación(es) activa(s)`,
      );
    }

    // Verificar si la ruta está siendo usada en itinerarios activos
    const usosEnItinerariosActivos = await this.prisma.tramoItinerario.count({
      where: {
        rutaId: id,
        itinerario: {
          estado: 'ACTIVO',
        },
      },
    });

    if (usosEnItinerariosActivos > 0) {
      throw new BadRequestException(
        `No se puede eliminar la ruta porque está siendo usada en ${usosEnItinerariosActivos} itinerario(s) activo(s)`,
      );
    }

    // Realizar soft delete (cambiar estado a INACTIVA)
    await this.prisma.ruta.update({
      where: { id },
      data: { estado: EstadoRuta.INACTIVA },
    });

    return {
      message: `Ruta "${ruta.nombre}" desactivada exitosamente`,
    };
  }

  /**
   * Eliminar permanentemente una ruta (hard delete)
   * ADVERTENCIA: Solo usar en casos muy específicos
   */
  async removePermanently(id: number): Promise<{ message: string }> {
    // Verificar que la ruta existe
    const ruta = await this.findOne(id);

    // Verificar que no tenga ningún uso
    const [asignaciones, tramosItinerario, tickets] = await Promise.all([
      this.prisma.unidadRuta.count({ where: { rutaId: id } }),
      this.prisma.tramoItinerario.count({ where: { rutaId: id } }),
      this.prisma.ticketAbastecimiento.count({ where: { rutaId: id } }),
    ]);

    const totalUsos = asignaciones + tramosItinerario + tickets;

    if (totalUsos > 0) {
      throw new BadRequestException(
        `No se puede eliminar permanentemente la ruta porque tiene registros relacionados (${totalUsos} registros)`,
      );
    }

    // Eliminar permanentemente
    await this.prisma.ruta.delete({
      where: { id },
    });

    return {
      message: `Ruta "${ruta.nombre}" eliminada permanentemente`,
    };
  }

  /**
   * Reactivar una ruta inactiva
   */
  async reactivar(id: number): Promise<RutaResponseDto> {
    const ruta = await this.findOne(id);

    if (ruta.estado === EstadoRuta.ACTIVA) {
      throw new BadRequestException('La ruta ya está activa');
    }

    const rutaActualizada = await this.prisma.ruta.update({
      where: { id },
      data: { estado: EstadoRuta.ACTIVA },
      include: {
        _count: {
          select: {
            asignacionesExcepcionales: {
              where: { activo: true },
            },
            tramosItinerario: true,
          },
        },
      },
    });

    return this.mapearRutaAResponse(rutaActualizada);
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Validar que el código sea único
   */
  private async validarCodigoUnico(codigo: string, excludeId?: number): Promise<void> {
    const existente = await this.prisma.ruta.findUnique({
      where: { codigo: codigo.toUpperCase() },
      select: { id: true },
    });

    if (existente && existente.id !== excludeId) {
      throw new ConflictException(`Ya existe una ruta con el código ${codigo}`);
    }
  }

  /**
   * Validar coherencia de datos de la ruta
   */
  private validarDatosRuta(datos: CreateRutaDto | UpdateRutaDto): void {
    // Validar que si hay distancia y tiempo, la velocidad promedio sea coherente
    if (datos.distanciaKm && datos.tiempoEstimadoMinutos) {
      const velocidadPromedio = (datos.distanciaKm / datos.tiempoEstimadoMinutos) * 60;

      // Validar velocidad razonable (entre 10 y 120 km/h)
      if (velocidadPromedio < 10 || velocidadPromedio > 120) {
        throw new BadRequestException(
          `La velocidad promedio calculada (${velocidadPromedio.toFixed(1)} km/h) no es coherente. Debe estar entre 10 y 120 km/h`,
        );
      }
    }
  }

  /**
   * Construir filtros para la consulta
   */
  private construirFiltros(filtros: FiltrosRutaDto): Prisma.RutaWhereInput {
    const where: Prisma.RutaWhereInput = {};

    if (filtros.estado) {
      where.estado = filtros.estado;
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

    if (filtros.origen) {
      where.origen = {
        contains: filtros.origen,
        mode: 'insensitive',
      };
    }

    if (filtros.destino) {
      where.destino = {
        contains: filtros.destino,
        mode: 'insensitive',
      };
    }

    return where;
  }

  /**
   * Construir ordenamiento
   */
  private construirOrdenamiento(
    orderBy: string,
    orderDirection: 'asc' | 'desc',
  ): Prisma.RutaOrderByWithRelationInput {
    const validOrderFields = ['nombre', 'codigo', 'distanciaKm', 'createdAt'];

    if (!validOrderFields.includes(orderBy)) {
      orderBy = 'nombre';
    }

    return { [orderBy]: orderDirection };
  }

  /**
   * Mapear ruta de Prisma a DTO de respuesta
   */
  private mapearRutaAResponse(ruta: any): RutaResponseDto {
    return {
      id: ruta.id,
      nombre: ruta.nombre,
      codigo: ruta.codigo,
      descripcion: ruta.descripcion,
      origen: ruta.origen,
      destino: ruta.destino,
      distanciaKm: ruta.distanciaKm,
      tiempoEstimadoMinutos: ruta.tiempoEstimadoMinutos,
      estado: ruta.estado as EstadoRuta,
      createdAt: ruta.createdAt,
      updatedAt: ruta.updatedAt,
      asignacionesActivas: ruta._count?.asignacionesExcepcionales || 0,
      usosEnItinerarios: ruta._count?.tramosItinerario || 0,
    };
  }
}