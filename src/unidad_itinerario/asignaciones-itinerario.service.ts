// src/asignaciones-rutas/asignaciones-itinerario.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateAsignacionItinerarioDto,
  FrecuenciaItinerario
} from './dto/create-asignacion-itinerario.dto';
import { FiltrosAsignacionItinerarioDto } from './dto/filtros-asignacion-itinerario.dto';
import { UpdateAsignacionItinerarioDto } from './dto/update-asignacion-itinerario.dto';
import {
  AsignacionItinerarioResponseDto,
  AsignacionesItinerarioPaginadasResponseDto,
} from './dto/asignacion-itinerario-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AsignacionesItinerarioService {
  constructor(private prisma: PrismaService) { }

  /**
   * Crear una asignación permanente de unidad a itinerario
   */
  async create(
    createAsignacionDto: CreateAsignacionItinerarioDto,
  ): Promise<AsignacionItinerarioResponseDto> {
    // 1. Validar que la unidad existe y está activa
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: createAsignacionDto.unidadId },
      select: { id: true, placa: true, activo: true },
    });

    if (!unidad) {
      throw new NotFoundException(
        `Unidad con ID ${createAsignacionDto.unidadId} no encontrada`
      );
    }

    if (!unidad.activo) {
      throw new BadRequestException(
        `La unidad ${unidad.placa} está inactiva y no puede ser asignada`
      );
    }

    // 2. Validar que el itinerario existe y está activo
    const itinerario = await this.prisma.itinerario.findUnique({
      where: { id: createAsignacionDto.itinerarioId },
      select: { id: true, nombre: true, estado: true },
    });

    if (!itinerario) {
      throw new NotFoundException(
        `Itinerario con ID ${createAsignacionDto.itinerarioId} no encontrado`
      );
    }

    if (itinerario.estado !== 'ACTIVO') {
      throw new BadRequestException(
        `El itinerario "${itinerario.nombre}" no está activo y no puede ser asignado`
      );
    }

    // 3. Validar que la unidad no tiene otra asignación permanente activa
    await this.validarAsignacionUnica(createAsignacionDto.unidadId);

    // 4. Validar días específicos según frecuencia
    this.validarDiasSegunFrecuencia(
      createAsignacionDto.frecuencia,
      createAsignacionDto.diasEspecificos
    );

    // 5. Crear la asignación
    const asignacion = await this.prisma.unidadItinerario.create({
      data: {
        unidadId: createAsignacionDto.unidadId,
        itinerarioId: createAsignacionDto.itinerarioId,
        frecuencia: createAsignacionDto.frecuencia,
        diasEspecificos: this.obtenerDiasSegunFrecuencia(
          createAsignacionDto.frecuencia,
          createAsignacionDto.diasEspecificos
        ),
        horaInicioPersonalizada: createAsignacionDto.horaInicioPersonalizada || null,
        esPermanente: createAsignacionDto.esPermanente ?? true,
        asignadoPorId: createAsignacionDto.asignadoPorId || null,
        motivoCambio: createAsignacionDto.motivoCambio || null,
        observaciones: createAsignacionDto.observaciones || null,
      },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            tipoCombustible: true,
          },
        },
        itinerario: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoItinerario: true,
            distanciaTotal: true,
            diasOperacion: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        _count: {
          select: {
            ejecuciones: true,
          },
        },
      },
    });

    return this.mapearAsignacionAResponse(asignacion);
  }

  /**
   * Listar asignaciones con filtros y paginación
   */
  // async findAll(
  //   filtros: FiltrosAsignacionItinerarioDto
  // ): Promise<AsignacionesItinerarioPaginadasResponseDto> {
  //   const { page = 1, pageSize = 10 } = filtros;

  //   // Construir filtros
  //   const where: Prisma.UnidadItinerarioWhereInput = this.construirFiltros(filtros);

  //   // Calcular skip
  //   const skip = (page - 1) * pageSize;

  //   // Ejecutar consultas en paralelo
  //   const [asignaciones, total] = await Promise.all([
  //     this.prisma.unidadItinerario.findMany({
  //       where,
  //       skip,
  //       take: pageSize,
  //       orderBy: { fechaAsignacion: 'desc' },
  //       include: {
  //         unidad: {
  //           select: {
  //             id: true,
  //             placa: true,
  //             marca: true,
  //             modelo: true,
  //             tipoCombustible: true,
  //           },
  //         },
  //         itinerario: {
  //           select: {
  //             id: true,
  //             nombre: true,
  //             codigo: true,
  //             tipoItinerario: true,
  //             distanciaTotal: true,
  //             diasOperacion: true,
  //           },
  //         },
  //         asignadoPor: {
  //           select: {
  //             id: true,
  //             nombres: true,
  //             apellidos: true,
  //           },
  //         },
  //         _count: {
  //           select: {
  //             ejecuciones: true,
  //           },
  //         },
  //       },
  //     }),
  //     this.prisma.unidadItinerario.count({ where }),
  //   ]);

  //   // Mapear resultados
  //   const data = asignaciones.map((asignacion) =>
  //     this.mapearAsignacionAResponse(asignacion)
  //   );

  //   // Calcular metadata
  //   const totalPages = Math.ceil(total / pageSize);
  //   const offset = skip;
  //   const nextOffset = page < totalPages ? skip + pageSize : null;
  //   const prevOffset = page > 1 ? skip - pageSize : null;
  //   const hasNext = page < totalPages;
  //   const hasPrevious = page > 1;

  //   return {
  //     data,
  //     meta: {
  //       total,
  //       page,
  //       pageSize,
  //       totalPages,
  //       offset,
  //       limit: pageSize,
  //       nextOffset,
  //       prevOffset,
  //       hasNext,
  //       hasPrevious,
  //     },
  //   };
  // }

  /*
    ***************************************************************************************
    Metodo: se implemento cursor para millones de registros
    Fecha: 22-10-2025
    Descripcion: metodo anterior findall funciona pero se reemplazo con el nuevo 
    Autor: 
    ***************************************************************************************
  */

  async findAll(
    filtros: FiltrosAsignacionItinerarioDto
  ): Promise<AsignacionesItinerarioPaginadasResponseDto> {
    const { page = 1, pageSize = 10, cursor, prevCursor } = filtros;

    // Construir filtros base (igual que antes)
    const where: Prisma.UnidadItinerarioWhereInput = this.construirFiltros(filtros);

    // Manejo de paginación: Cursor o Offset
    let skip: number | undefined;
    let take: number;
    let orderBy: Prisma.UnidadItinerarioOrderByWithRelationInput = { id: 'asc' };  // Cambia a { fechaAsignacion: 'desc' } si prefieres
    let cursorCondition: any = undefined;
    let isPrevMode = false;

    if (prevCursor) {
      // Modo anterior: Filtra < prevCursorId (para asc, va hacia atrás)
      try {
        const prevCursorId = parseInt(Buffer.from(prevCursor, 'base64').toString('utf8'), 10);
        cursorCondition = { id: { lt: prevCursorId } };
        Object.assign(where, cursorCondition);
        isPrevMode = true;
        take = pageSize + 1;
        skip = undefined;
        orderBy = { id: 'desc' };  // Invierte orden para "prev" (de mayor a menor ID)
      } catch (error) {
        throw new BadRequestException('PrevCursor inválido: debe ser un ID válido en base64');
      }
    } else if (cursor) {
      // Modo siguiente: > cursorId
      try {
        const cursorId = parseInt(Buffer.from(cursor, 'base64').toString('utf8'), 10);
        cursorCondition = { id: { gt: cursorId } };
        Object.assign(where, cursorCondition);
        take = pageSize + 1;
        skip = undefined;
      } catch (error) {
        throw new BadRequestException('Cursor inválido: debe ser un ID válido en base64');
      }
    } else {
      // Modo tradicional
      skip = (page - 1) * pageSize;
      take = pageSize;
    }

    // Calcular total base (sin cursor, para fallback)
    const baseWhere = { ...where };  // Copia sin cursorCondition
    delete baseWhere.id;  // Remueve condición de cursor si existe
    const baseTotal = await this.prisma.unidadItinerario.count({ where: baseWhere });

    // Ejecutar consultas en paralelo (CAMBIO: let para asignacionesRaw)
    let [asignacionesRaw, total] = await Promise.all([
      this.prisma.unidadItinerario.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          unidad: {
            select: {
              id: true,
              placa: true,
              marca: true,
              modelo: true,
              tipoCombustible: true,
            },
          },
          itinerario: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              tipoItinerario: true,
              distanciaTotal: true,
              diasOperacion: true,
            },
          },
          asignadoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
            },
          },
          _count: {
            select: {
              ejecuciones: true,
            },
          },
        },
      }),
      this.prisma.unidadItinerario.count({ where }),
    ]);

    // FALLBACK: Si cursor mode devuelve vacío pero baseTotal >0, carga primera página
    let isFallback = false;
    if ((prevCursor || cursor) && asignacionesRaw.length === 0 && baseTotal > 0) {
      console.log(`Fallback: Cursor ${prevCursor || cursor} inválido, cargando primera página`);
      isFallback = true;
      asignacionesRaw = await this.prisma.unidadItinerario.findMany({
        where: baseWhere,
        skip: 0,
        take: pageSize,
        orderBy: { id: 'asc' },
        include: {  // COPIA COMPLETA del include (no comentario)
          unidad: {
            select: {
              id: true,
              placa: true,
              marca: true,
              modelo: true,
              tipoCombustible: true,
            },
          },
          itinerario: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              tipoItinerario: true,
              distanciaTotal: true,
              diasOperacion: true,
            },
          },
          asignadoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
            },
          },
          _count: {
            select: {
              ejecuciones: true,
            },
          },
        },
      });
      total = baseTotal;
    }

    let asignaciones = asignacionesRaw;
    let hasNext = false;
    let nextCursor: string | null = null;
    let hasPrevious = false;
    let previousCursor: string | null = null;

    if (prevCursor || cursor || isFallback) {
      // Modo cursor (next o prev, incluye fallback)
      const effectivePageSize = pageSize;
      hasNext = asignaciones.length > effectivePageSize;
      if (hasNext) {
        const nextItem = asignaciones[effectivePageSize];
        nextCursor = Buffer.from(nextItem.id.toString()).toString('base64');
        asignaciones = asignaciones.slice(0, effectivePageSize);
      }

      // PreviousCursor solo si hay datos y no es la primera página
      if (asignaciones.length > 0 && (cursor || prevCursor)) {
        const firstItemId = isPrevMode ? asignaciones[asignaciones.length - 1].id : asignaciones[0].id;
        previousCursor = Buffer.from(firstItemId.toString()).toString('base64');
        hasPrevious = firstItemId > 1;  // Asume IDs empiezan en 1
      } else {
        hasPrevious = false;
        previousCursor = null;
      }
    } else {
      // Modo tradicional
      const totalPages = Math.ceil(total / pageSize);
      hasNext = page < totalPages;
      hasPrevious = page > 1;
      nextCursor = null;
      previousCursor = null;
    }

    // Si es prevMode, revierte el orden para coherencia
    if (isPrevMode) {
      asignaciones = asignaciones.reverse();
    }

    // Mapear resultados
    const data = asignaciones.map((asignacion) =>
      this.mapearAsignacionAResponse(asignacion)
    );

    // Calcular metadata
    const isCursorMode = !!(cursor || prevCursor || isFallback);
    const offset = isCursorMode ? null : (page - 1) * pageSize;
    const totalPages = isCursorMode ? null : Math.ceil(total / pageSize);
    const nextOffset = isCursorMode ? null : (hasNext ? offset! + pageSize : null);
    const prevOffset = isCursorMode ? null : (hasPrevious ? offset! - pageSize : null);

    return {
      data,
      meta: {
        total,
        page: isCursorMode ? null : page,
        pageSize,
        totalPages,
        offset,
        limit: pageSize,
        nextOffset,
        prevOffset,
        nextCursor,
        previousCursor,
        hasNext,
        hasPrevious,
        isFallback,  // Opcional: Para debug en UI
      },
    };
  }

  /**
   * Obtener una asignación por ID
   */
  async findOne(id: number): Promise<AsignacionItinerarioResponseDto> {
    const asignacion = await this.prisma.unidadItinerario.findUnique({
      where: { id },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            tipoCombustible: true,
          },
        },
        itinerario: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoItinerario: true,
            distanciaTotal: true,
            diasOperacion: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        _count: {
          select: {
            ejecuciones: true,
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    return this.mapearAsignacionAResponse(asignacion);
  }

  /**
   * Obtener el itinerario actual de una unidad
   */
  async obtenerItinerarioActual(unidadId: number): Promise<AsignacionItinerarioResponseDto | null> {
    // Validar que la unidad existe
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId },
      select: { id: true, placa: true },
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    // Buscar asignación activa
    const asignacion = await this.prisma.unidadItinerario.findFirst({
      where: {
        unidadId,
        fechaDesasignacion: null,
      },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            tipoCombustible: true,
          },
        },
        itinerario: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoItinerario: true,
            distanciaTotal: true,
            diasOperacion: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        _count: {
          select: {
            ejecuciones: true,
          },
        },
      },
    });

    return asignacion ? this.mapearAsignacionAResponse(asignacion) : null;
  }

  /**
   * Actualizar una asignación
   */
  async update(
    id: number,
    updateAsignacionDto: UpdateAsignacionItinerarioDto
  ): Promise<AsignacionItinerarioResponseDto> {
    // Verificar que existe
    await this.findOne(id);

    // Validar días según frecuencia si se actualiza
    if (updateAsignacionDto.frecuencia) {
      this.validarDiasSegunFrecuencia(
        updateAsignacionDto.frecuencia,
        updateAsignacionDto.diasEspecificos
      );
    }

    // Obtener días según frecuencia
    const diasEspecificos =
      updateAsignacionDto.frecuencia
        ? this.obtenerDiasSegunFrecuencia(
          updateAsignacionDto.frecuencia,
          updateAsignacionDto.diasEspecificos
        )
        : undefined;

    const asignacion = await this.prisma.unidadItinerario.update({
      where: { id },
      data: {
        ...(updateAsignacionDto.frecuencia && { frecuencia: updateAsignacionDto.frecuencia }),
        ...(diasEspecificos && { diasEspecificos }),
        ...(updateAsignacionDto.horaInicioPersonalizada !== undefined && {
          horaInicioPersonalizada: updateAsignacionDto.horaInicioPersonalizada,
        }),
        ...(updateAsignacionDto.esPermanente !== undefined && {
          esPermanente: updateAsignacionDto.esPermanente,
        }),
        ...(updateAsignacionDto.motivoCambio !== undefined && {
          motivoCambio: updateAsignacionDto.motivoCambio,
        }),
        ...(updateAsignacionDto.observaciones !== undefined && {
          observaciones: updateAsignacionDto.observaciones,
        }),
      },
      include: {
        unidad: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            tipoCombustible: true,
          },
        },
        itinerario: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoItinerario: true,
            distanciaTotal: true,
            diasOperacion: true,
          },
        },
        asignadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
        _count: {
          select: {
            ejecuciones: true,
          },
        },
      },
    });

    return this.mapearAsignacionAResponse(asignacion);
  }

  /**
   * Desasignar una unidad de un itinerario
   */
  async desasignar(id: number): Promise<{ message: string }> {
    const asignacion = await this.findOne(id);

    if (asignacion.fechaDesasignacion) {
      throw new BadRequestException('Esta asignación ya fue desasignada anteriormente');
    }

    // Verificar si hay ejecuciones en curso
    const ejecucionesEnCurso = await this.prisma.ejecucionItinerario.count({
      where: {
        unidadId: asignacion.unidadId,
        itinerarioId: asignacion.itinerarioId,
        estado: 'EN_CURSO',
      },
    });

    if (ejecucionesEnCurso > 0) {
      throw new BadRequestException(
        `No se puede desasignar porque la unidad ${asignacion.unidad?.placa} tiene ${ejecucionesEnCurso} ejecución(es) en curso`
      );
    }

    // Marcar como desasignada
    await this.prisma.unidadItinerario.update({
      where: { id },
      data: {
        fechaDesasignacion: new Date(),
      },
    });

    return {
      message: `Unidad ${asignacion.unidad?.placa} desasignada del itinerario "${asignacion.itinerario?.nombre}" exitosamente`,
    };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Validar que la unidad no tiene otra asignación permanente activa
   */
  private async validarAsignacionUnica(unidadId: number): Promise<void> {
    const asignacionExistente = await this.prisma.unidadItinerario.findFirst({
      where: {
        unidadId,
        fechaDesasignacion: null,
        esPermanente: true,
      },
      include: {
        itinerario: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (asignacionExistente) {
      throw new ConflictException(
        `La unidad ya tiene una asignación permanente activa al itinerario "${asignacionExistente.itinerario.nombre}". Debe desasignarla primero.`
      );
    }
  }

  /**
   * Validar días específicos según frecuencia
   */
  private validarDiasSegunFrecuencia(
    frecuencia: FrecuenciaItinerario,
    diasEspecificos?: string[]
  ): void {
    if (frecuencia === FrecuenciaItinerario.PERSONALIZADO) {
      if (!diasEspecificos || diasEspecificos.length === 0) {
        throw new BadRequestException(
          'Debe especificar al menos un día cuando la frecuencia es PERSONALIZADO'
        );
      }
    }
  }

  /**
   * Obtener días según frecuencia
   */
  private obtenerDiasSegunFrecuencia(
    frecuencia: FrecuenciaItinerario,
    diasEspecificos?: string[]
  ): string[] {
    switch (frecuencia) {
      case FrecuenciaItinerario.DIARIO:
        return ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
      case FrecuenciaItinerario.LUNES_VIERNES:
        return ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
      case FrecuenciaItinerario.FINES_SEMANA:
        return ['SABADO', 'DOMINGO'];
      case FrecuenciaItinerario.PERSONALIZADO:
        return diasEspecificos || [];
      default:
        return diasEspecificos || [];
    }
  }

  /**
   * Construir filtros
   */
  private construirFiltros(
    filtros: FiltrosAsignacionItinerarioDto
  ): Prisma.UnidadItinerarioWhereInput {
    const where: Prisma.UnidadItinerarioWhereInput = {};

    if (filtros.unidadId) {
      where.unidadId = filtros.unidadId;
    }

    if (filtros.itinerarioId) {
      where.itinerarioId = filtros.itinerarioId;
    }

    if (filtros.soloActivas) {
      where.fechaDesasignacion = null;
    }

    if (filtros.soloPermanentes) {
      where.esPermanente = true;
    }

    return where;
  }

  /**
   * Mapear asignación a DTO de respuesta
   */
  private mapearAsignacionAResponse(asignacion: any): AsignacionItinerarioResponseDto {
    return {
      id: asignacion.id,
      unidadId: asignacion.unidadId,
      unidad: asignacion.unidad
        ? {
          id: asignacion.unidad.id,
          placa: asignacion.unidad.placa,
          marca: asignacion.unidad.marca,
          modelo: asignacion.unidad.modelo,
          tipoCombustible: asignacion.unidad.tipoCombustible,
        }
        : undefined,
      itinerarioId: asignacion.itinerarioId,
      itinerario: asignacion.itinerario
        ? {
          id: asignacion.itinerario.id,
          nombre: asignacion.itinerario.nombre,
          codigo: asignacion.itinerario.codigo,
          tipoItinerario: asignacion.itinerario.tipoItinerario,
          distanciaTotal: Number(asignacion.itinerario.distanciaTotal),
          diasOperacion: asignacion.itinerario.diasOperacion,
        }
        : undefined,
      fechaAsignacion: asignacion.fechaAsignacion,
      fechaDesasignacion: asignacion.fechaDesasignacion,
      frecuencia: asignacion.frecuencia,
      diasEspecificos: asignacion.diasEspecificos,
      horaInicioPersonalizada: asignacion.horaInicioPersonalizada,
      esPermanente: asignacion.esPermanente,
      asignadoPorId: asignacion.asignadoPorId,
      asignadoPor: asignacion.asignadoPor
        ? {
          id: asignacion.asignadoPor.id,
          nombres: asignacion.asignadoPor.nombres,
          apellidos: asignacion.asignadoPor.apellidos,
        }
        : undefined,
      motivoCambio: asignacion.motivoCambio,
      observaciones: asignacion.observaciones,
      createdAt: asignacion.createdAt,
      updatedAt: asignacion.updatedAt,
      ejecucionesRealizadas: asignacion._count?.ejecuciones || 0,
      estadoAsignacion: asignacion.fechaDesasignacion ? 'DESASIGNADA' : 'ACTIVA',
    };
  }
}