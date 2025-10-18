// =============================================
// GPS Service - Lógica de Negocio Principal
// =============================================

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { 
  LocationData, 
  GpsProviderType, 
  GpsSignalQuality,
  TrackingStatus,
  CurrentLocationResponse,
  TrackingStats
} from './interfaces/location-data.interface';
import { Prisma } from '@prisma/client';
import { CreateLocationDto } from './dto/create-location.dto';
import { CurrentLocationResponseDto, CurrentLocationsListResponseDto, LocationHistoryResponseDto, LocationResponseDto } from './dto/location-response.dto';
import { QueryCurrentLocationsDto, QueryLocationHistoryDto } from './dto/query-location.dto';
import { TrackingStatsDto } from './dto/gps-status.dto';

@Injectable()
export class GpsService {
  private readonly logger = new Logger(GpsService.name);

  // Configuración
  private readonly INACTIVE_THRESHOLD_MINUTES = 5;  // Unidad inactiva si no reporta en 5 min
  private readonly STOPPED_THRESHOLD_KMH = 5;       // Velocidad < 5 km/h = detenido
  private readonly GPS_DEVICE_PRIORITY_MINUTES = 2; // Prioridad GPS device por 2 min

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // CREAR / GUARDAR UBICACIÓN
  // ==========================================

  /**
   * Guardar nueva ubicación en la base de datos
   */
  async createLocation(dto: CreateLocationDto): Promise<LocationResponseDto> {
    try {
      // 1. Validar que la unidad existe
      await this.validateUnidadExists(dto.unidadId);

      // 2. Validar datos de ubicación
      this.validateLocationData(dto);

      // 3. Determinar calidad de señal GPS si no se envió
      const señalGPS = dto.señalGPS || this.calculateSignalQuality(dto.precision);

      // 4. Preparar datos para inserción
      const locationData: Prisma.UbicacionGPSCreateInput = {
        unidad: { connect: { id: dto.unidadId } },
        latitud: dto.latitud,
        longitud: dto.longitud,
        altitud: dto.altitud,
        precision: dto.precision,
        velocidad: dto.velocidad,
        rumbo: dto.rumbo,
        kilometraje: dto.kilometraje,
        fechaHora: dto.fechaHora ? new Date(dto.fechaHora) : new Date(),
        proveedor: dto.proveedor,
        dispositivoId: dto.dispositivoId,
        bateria: dto.bateria,
        señalGPS: señalGPS,
        appVersion: dto.appVersion,
        sistemaOperativo: dto.sistemaOperativo,
        modeloDispositivo: dto.modeloDispositivo,
        metadata: dto.metadata as Prisma.InputJsonValue,
      };

      // 5. Conectar con ejecución o tramo si se proporcionan
      if (dto.ejecucionId) {
        locationData.ejecucion = { connect: { id: dto.ejecucionId } };
      }
      if (dto.registroTramoId) {
        locationData.registroTramo = { connect: { id: dto.registroTramoId } };
      }

      // 6. Guardar en base de datos
      const ubicacion = await this.prisma.ubicacionGPS.create({
        data: locationData,
      });

      this.logger.debug(
        `📍 Ubicación guardada: Unidad ${dto.unidadId} | ${dto.proveedor} | ` +
        `Lat: ${dto.latitud.toFixed(6)}, Lng: ${dto.longitud.toFixed(6)}`
      );

      // 7. Convertir a DTO de respuesta
      return this.toLocationResponseDto(ubicacion);

    } catch (error) {
      this.logger.error(`❌ Error guardando ubicación: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Guardar múltiples ubicaciones (batch)
   */
  async createLocationsBatch(locations: CreateLocationDto[]): Promise<number> {
    try {
      const validLocations = locations.filter(loc => {
        try {
          this.validateLocationData(loc);
          return true;
        } catch {
          return false;
        }
      });

      if (validLocations.length === 0) {
        throw new BadRequestException('No hay ubicaciones válidas para guardar');
      }

      const data = validLocations.map(dto => ({
        unidadId: dto.unidadId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        altitud: dto.altitud,
        precision: dto.precision,
        velocidad: dto.velocidad,
        rumbo: dto.rumbo,
        kilometraje: dto.kilometraje,
        fechaHora: dto.fechaHora ? new Date(dto.fechaHora) : new Date(),
        proveedor: dto.proveedor,
        dispositivoId: dto.dispositivoId,
        bateria: dto.bateria,
        señalGPS: dto.señalGPS || this.calculateSignalQuality(dto.precision),
        appVersion: dto.appVersion,
        sistemaOperativo: dto.sistemaOperativo,
        modeloDispositivo: dto.modeloDispositivo,
        metadata: dto.metadata as Prisma.InputJsonValue,
      }));

      const result = await this.prisma.ubicacionGPS.createMany({
        data,
        skipDuplicates: true,
      });

      this.logger.log(`📦 Batch guardado: ${result.count} ubicaciones`);
      return result.count;

    } catch (error) {
      this.logger.error(`❌ Error en batch: ${error.message}`);
      throw error;
    }
  }

  // ==========================================
  // CONSULTAR UBICACIONES
  // ==========================================

  /**
   * Obtener última ubicación de una unidad
   */
  async getLastLocation(unidadId: number): Promise<LocationResponseDto | null> {
    const ubicacion = await this.prisma.ubicacionGPS.findFirst({
      where: { unidadId },
      orderBy: { fechaHora: 'desc' },
    });

    return ubicacion ? this.toLocationResponseDto(ubicacion) : null;
  }

  /**
   * Obtener última ubicación con detalles de unidad
   */
  async getCurrentLocation(unidadId: number): Promise<CurrentLocationResponseDto> {
    // 1. Obtener unidad con conductor
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId },
      include: {
        conductorOperador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    // 2. Obtener última ubicación
    const ultimaUbicacion = await this.getLastLocation(unidadId);

    // 3. Calcular tiempo transcurrido y estado
    let tiempoTranscurrido = 0;
    let estado: 'ACTIVO' | 'DETENIDO' | 'INACTIVO' = 'INACTIVO';

    if (ultimaUbicacion) {
      tiempoTranscurrido = Math.floor(
        (Date.now() - new Date(ultimaUbicacion.fechaHora).getTime()) / 1000
      );

      const minutosInactivo = tiempoTranscurrido / 60;

      if (minutosInactivo > this.INACTIVE_THRESHOLD_MINUTES) {
        estado = 'INACTIVO';
      } else if ((ultimaUbicacion.velocidad || 0) < this.STOPPED_THRESHOLD_KMH) {
        estado = 'DETENIDO';
      } else {
        estado = 'ACTIVO';
      }
    }

    // 4. Construir respuesta
    return {
      unidadId: unidad.id,
      placa: unidad.placa,
      ultimaUbicacion,
      tiempoTranscurrido,
      estado,
      conductor: unidad.conductorOperador ? {
        id: unidad.conductorOperador.id,
        nombreCompleto: `${unidad.conductorOperador.nombres} ${unidad.conductorOperador.apellidos}`,
      } : undefined,
    };
  }

  /**
   * Obtener ubicaciones actuales de múltiples unidades
   */
  async getCurrentLocations(
    query: QueryCurrentLocationsDto
  ): Promise<CurrentLocationsListResponseDto> {
    // 1. Construir filtro de unidades
    let unidadesIds: number[] = [];

    if (query.unidadesIds && query.unidadesIds.length > 0) {
      unidadesIds = query.unidadesIds;
    } else if (query.zonaId) {
      // Obtener unidades de la zona
      const unidades = await this.prisma.unidad.findMany({
        where: { 
          zonaOperacionId: query.zonaId,
          activo: true,
        },
        select: { id: true },
      });
      unidadesIds = unidades.map(u => u.id);
    } else {
      // Todas las unidades activas
      const unidades = await this.prisma.unidad.findMany({
        where: { activo: true },
        select: { id: true },
      });
      unidadesIds = unidades.map(u => u.id);
    }

    // 2. Obtener ubicación actual de cada unidad
    const locationsPromises = unidadesIds.map(id => 
      this.getCurrentLocation(id).catch(() => null)
    );
    const locations = (await Promise.all(locationsPromises))
      .filter(loc => loc !== null);

    // 3. Filtrar solo activas si se solicita
    let filteredLocations = locations;
    if (query.soloActivas) {
      filteredLocations = locations.filter(
        loc => loc.estado === 'ACTIVO' || loc.estado === 'DETENIDO'
      );
    }

    // 4. Filtrar por proveedor si se solicita
    if (query.proveedor) {
      filteredLocations = filteredLocations.filter(
        loc => loc.ultimaUbicacion?.proveedor === query.proveedor
      );
    }

    // 5. Contar estados
    const activas = filteredLocations.filter(
      loc => loc.estado === 'ACTIVO' || loc.estado === 'DETENIDO'
    ).length;
    const inactivas = filteredLocations.filter(
      loc => loc.estado === 'INACTIVO'
    ).length;

    return {
      data: filteredLocations,
      total: filteredLocations.length,
      activas,
      inactivas,
    };
  }

  /**
   * Obtener historial de ubicaciones (paginado)
   */
  async getLocationHistory(
    query: QueryLocationHistoryDto
  ): Promise<LocationHistoryResponseDto> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const skip = (page - 1) * pageSize;

    // 1. Construir filtros
    const where: Prisma.UbicacionGPSWhereInput = {};

    if (query.unidadId) {
      where.unidadId = query.unidadId;
    }

    if (query.fechaInicio || query.fechaFin) {
      where.fechaHora = {};
      if (query.fechaInicio) {
        where.fechaHora.gte = new Date(query.fechaInicio);
      }
      if (query.fechaFin) {
        where.fechaHora.lte = new Date(query.fechaFin);
      }
    }

    if (query.proveedor) {
      where.proveedor = query.proveedor;
    }

    // 2. Consultar ubicaciones
    const [ubicaciones, total] = await Promise.all([
      this.prisma.ubicacionGPS.findMany({
        where,
        orderBy: { fechaHora: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.ubicacionGPS.count({ where }),
    ]);

    // 3. Convertir a DTOs
    const data = ubicaciones.map(u => this.toLocationResponseDto(u));

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // ==========================================
  // TRACKING STATUS Y ESTADÍSTICAS
  // ==========================================

  /**
   * Verificar si una unidad está activa
   */
  async isUnitActive(unidadId: number): Promise<boolean> {
    const lastLocation = await this.getLastLocation(unidadId);
    
    if (!lastLocation) {
      return false;
    }

    const minutosInactivo = 
      (Date.now() - new Date(lastLocation.fechaHora).getTime()) / 1000 / 60;

    return minutosInactivo <= this.INACTIVE_THRESHOLD_MINUTES;
  }

  /**
   * Obtener estado de tracking de una unidad
   */
  async getTrackingStatus(unidadId: number): Promise<TrackingStatus> {
    const lastLocation = await this.getLastLocation(unidadId);
    
    if (!lastLocation) {
      return {
        unidadId,
        isOnline: false,
        lastUpdate: new Date(),
        proveedor: GpsProviderType.MOBILE_APP,
        tiempoInactivoMinutos: 999999,
        ultimaUbicacion: undefined,
      };
    }

    const tiempoInactivoMinutos = 
      (Date.now() - new Date(lastLocation.fechaHora).getTime()) / 1000 / 60;

    return {
      unidadId,
      isOnline: tiempoInactivoMinutos <= this.INACTIVE_THRESHOLD_MINUTES,
      lastUpdate: new Date(lastLocation.fechaHora),
      proveedor: lastLocation.proveedor as GpsProviderType,
      tiempoInactivoMinutos,
      ultimaUbicacion: this.toLocationData(lastLocation),
    };
  }

  /**
   * Obtener estadísticas generales de tracking
   */
  async getTrackingStats(): Promise<TrackingStatsDto> {
    // 1. Total de unidades activas
    const totalUnidades = await this.prisma.unidad.count({
      where: { activo: true },
    });

    // 2. Obtener última ubicación de cada unidad
    const ultimasUbicaciones = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT ON (unidad_id) 
        unidad_id,
        fecha_hora,
        proveedor,
        precision
      FROM ubicaciones_gps
      WHERE unidad_id IN (
        SELECT id FROM unidades WHERE activo = true
      )
      ORDER BY unidad_id, fecha_hora DESC
    `;

    // 3. Clasificar unidades
    const now = Date.now();
    const thresholdMs = this.INACTIVE_THRESHOLD_MINUTES * 60 * 1000;

    let unidadesActivas = 0;
    let countGpsDevice = 0;
    let countMobileApp = 0;
    let sumPrecision = 0;
    let countWithPrecision = 0;

    ultimasUbicaciones.forEach(loc => {
      const fechaHora = new Date(loc.fecha_hora).getTime();
      const esActiva = (now - fechaHora) <= thresholdMs;

      if (esActiva) {
        unidadesActivas++;

        if (loc.proveedor === GpsProviderType.GPS_DEVICE || 
            loc.proveedor.startsWith('GPS_DEVICE')) {
          countGpsDevice++;
        } else if (loc.proveedor === GpsProviderType.MOBILE_APP) {
          countMobileApp++;
        }

        if (loc.precision) {
          sumPrecision += parseFloat(loc.precision);
          countWithPrecision++;
        }
      }
    });

    const unidadesInactivas = totalUnidades - unidadesActivas;
    const porcentajeGpsDevice = totalUnidades > 0 
      ? (countGpsDevice / totalUnidades) * 100 
      : 0;
    const porcentajeMobileApp = totalUnidades > 0 
      ? (countMobileApp / totalUnidades) * 100 
      : 0;
    const precisionPromedio = countWithPrecision > 0 
      ? sumPrecision / countWithPrecision 
      : 0;

    return {
      totalUnidades,
      unidadesActivas,
      unidadesInactivas,
      porcentajeGpsDevice: parseFloat(porcentajeGpsDevice.toFixed(2)),
      porcentajeMobileApp: parseFloat(porcentajeMobileApp.toFixed(2)),
      precisionPromedio: parseFloat(precisionPromedio.toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================
  // GESTIÓN DE DISPOSITIVOS GPS
  // ==========================================

  /**
   * Verificar si una unidad tiene GPS vehicular activo
   */
  async hasActiveGpsDevice(unidadId: number): Promise<boolean> {
    const dispositivo = await this.prisma.dispositivoGPS.findFirst({
      where: {
        unidadId,
        estado: 'ACTIVO',
        activo: true,
      },
    });

    if (!dispositivo) {
      return false;
    }

    // Verificar si tiene señal reciente
    if (!dispositivo.fechaUltimaSenal) {
      return false;
    }

    const minutosSinSenal = 
      (Date.now() - dispositivo.fechaUltimaSenal.getTime()) / 1000 / 60;

    return minutosSinSenal <= this.GPS_DEVICE_PRIORITY_MINUTES;
  }

  /**
   * Actualizar fecha de última señal de dispositivo GPS
   */
  async updateDeviceLastSignal(imei: string): Promise<void> {
    try {
      await this.prisma.dispositivoGPS.updateMany({
        where: { imei },
        data: { fechaUltimaSenal: new Date() },
      });
    } catch (error) {
      this.logger.warn(`⚠️ No se pudo actualizar señal del dispositivo ${imei}`);
    }
  }

  // ==========================================
  // LIMPIEZA Y MANTENIMIENTO
  // ==========================================

  /**
   * Limpiar ubicaciones antiguas (más de X días)
   */
  async cleanOldLocations(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.ubicacionGPS.deleteMany({
      where: {
        fechaHora: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(
      `🗑️ Limpieza completada: ${result.count} ubicaciones eliminadas (> ${daysToKeep} días)`
    );

    return result.count;
  }

  /**
   * Obtener unidades sin señal hace más de X minutos
   */
  async getInactiveUnits(minutesThreshold: number = 60): Promise<number[]> {
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - minutesThreshold);

    const ultimasUbicaciones = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT ON (unidad_id) 
        unidad_id,
        fecha_hora
      FROM ubicaciones_gps
      WHERE unidad_id IN (
        SELECT id FROM unidades WHERE activo = true
      )
      ORDER BY unidad_id, fecha_hora DESC
    `;

    const inactiveUnits = ultimasUbicaciones
      .filter(loc => new Date(loc.fecha_hora) < cutoffDate)
      .map(loc => loc.unidad_id);

    return inactiveUnits;
  }

  // ==========================================
  // VALIDACIONES Y UTILIDADES
  // ==========================================

  /**
   * Validar que una unidad existe y está activa
   */
  private async validateUnidadExists(unidadId: number): Promise<void> {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId },
      select: { id: true, activo: true, placa: true },
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${unidadId} no encontrada`);
    }

    if (!unidad.activo) {
      throw new BadRequestException(
        `La unidad ${unidad.placa} está inactiva`
      );
    }
  }

  /**
   * Validar datos de ubicación
   */
  private validateLocationData(dto: CreateLocationDto): void {
    // Validar coordenadas
    if (dto.latitud < -90 || dto.latitud > 90) {
      throw new BadRequestException('Latitud fuera de rango (-90 a 90)');
    }

    if (dto.longitud < -180 || dto.longitud > 180) {
      throw new BadRequestException('Longitud fuera de rango (-180 a 180)');
    }

    // Validar velocidad (no puede ser negativa ni excesiva)
    if (dto.velocidad !== undefined && (dto.velocidad < 0 || dto.velocidad > 200)) {
      throw new BadRequestException('Velocidad fuera de rango (0-200 km/h)');
    }

    // Validar rumbo
    if (dto.rumbo !== undefined && (dto.rumbo < 0 || dto.rumbo > 360)) {
      throw new BadRequestException('Rumbo fuera de rango (0-360 grados)');
    }

    // Validar precisión (no más de 1000m)
    if (dto.precision !== undefined && dto.precision > 1000) {
      this.logger.warn(
        `⚠️ Precisión muy baja: ${dto.precision}m para unidad ${dto.unidadId}`
      );
    }
  }

  /**
   * Calcular calidad de señal GPS según precisión
   */
  private calculateSignalQuality(precision?: number): GpsSignalQuality {
    if (!precision) {
      return GpsSignalQuality.REGULAR;
    }

    if (precision < 5) return GpsSignalQuality.EXCELENTE;
    if (precision < 15) return GpsSignalQuality.BUENA;
    if (precision < 30) return GpsSignalQuality.REGULAR;
    return GpsSignalQuality.POBRE;
  }

  /**
   * Convertir entidad Prisma a DTO de respuesta
   */
  private toLocationResponseDto(ubicacion: any): LocationResponseDto {
    return {
      id: ubicacion.id,
      unidadId: ubicacion.unidadId,
      latitud: parseFloat(ubicacion.latitud),
      longitud: parseFloat(ubicacion.longitud),
      altitud: ubicacion.altitud ? parseFloat(ubicacion.altitud) : undefined,
      precision: ubicacion.precision ? parseFloat(ubicacion.precision) : undefined,
      velocidad: ubicacion.velocidad ? parseFloat(ubicacion.velocidad) : undefined,
      rumbo: ubicacion.rumbo ? parseFloat(ubicacion.rumbo) : undefined,
      kilometraje: ubicacion.kilometraje ? parseFloat(ubicacion.kilometraje) : undefined,
      fechaHora: ubicacion.fechaHora.toISOString(),
      proveedor: ubicacion.proveedor as GpsProviderType,
      dispositivoId: ubicacion.dispositivoId,
      bateria: ubicacion.bateria,
      señalGPS: ubicacion.señalGPS as GpsSignalQuality,
      appVersion: ubicacion.appVersion,
      sistemaOperativo: ubicacion.sistemaOperativo,
      modeloDispositivo: ubicacion.modeloDispositivo,
      metadata: ubicacion.metadata as Record<string, any>,
      createdAt: ubicacion.createdAt.toISOString(),
    };
  }

  /**
   * Convertir DTO de respuesta a LocationData (interface interna)
   */
  private toLocationData(dto: LocationResponseDto): LocationData {
    return {
      unidadId: dto.unidadId,
      latitud: dto.latitud,
      longitud: dto.longitud,
      altitud: dto.altitud,
      precision: dto.precision,
      velocidad: dto.velocidad,
      rumbo: dto.rumbo,
      kilometraje: dto.kilometraje,
      fechaHora: new Date(dto.fechaHora),
      proveedor: dto.proveedor,
      dispositivoId: dto.dispositivoId,
      bateria: dto.bateria,
      señalGPS: dto.señalGPS,
      appVersion: dto.appVersion,
      sistemaOperativo: dto.sistemaOperativo,
      modeloDispositivo: dto.modeloDispositivo,
      metadata: dto.metadata,
    };
  }
}