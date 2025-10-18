// =============================================
// GPS Controller - Endpoints REST
// =============================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { GpsService } from './gps.service';
// import {
//   CreateLocationDto,
//   QueryLocationHistoryDto,
//   QueryCurrentLocationsDto,
//   LocationResponseDto,
//   CurrentLocationResponseDto,
//   LocationHistoryResponseDto,
//   TrackingStatsDto,
//   CurrentLocationsListResponseDto,
// } from './dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard';
import { HasRoles } from '../auth/jwt/has-roles';
import { JwtRole } from '../auth/jwt/jwt-role';
import { CurrentLocationResponseDto, CurrentLocationsListResponseDto, LocationHistoryResponseDto, LocationResponseDto } from './dto/location-response.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { QueryCurrentLocationsDto, QueryLocationHistoryDto } from './dto/query-location.dto';
import { TrackingStatsDto } from './dto/gps-status.dto';
import { JwtAuthGuardWithPublic } from '@/auth/guards/public-endpoints.guard';
import { Public } from '@/auth/decorators/public.decorator';

@ApiTags('GPS Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(JwtAuthGuardWithPublic)
@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  // ==========================================
  // ENDPOINTS PARA ENVIAR UBICACIÓN (BACKUP)
  // ==========================================

  @Post('location')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar ubicación (Backup HTTP)',
    description:
      'Endpoint de respaldo para enviar ubicación cuando WebSocket no está disponible. ' +
      'Conductores solo pueden enviar ubicación de su unidad asignada.',
  })
  @ApiCreatedResponse({
    description: 'Ubicación guardada exitosamente',
    type: LocationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'Datos de ubicación inválidos o fuera de rango',
  })
  @ApiForbiddenResponse({
    description: 'No tienes permiso para enviar ubicación de esta unidad',
  })
  async sendLocation(
    @Body() createLocationDto: CreateLocationDto,
    @Request() req: any,
  ): Promise<LocationResponseDto> {
    // Validar permisos: conductores solo su unidad, admins cualquiera
    const user = req.user;
    const hasAdminRole = user.roles?.some(
      (r: any) => r.nombre === 'ADMIN' || r.nombre === 'SUPERVISOR',
    );

    if (!hasAdminRole) {
      // Si no es admin, debe ser conductor de la unidad
      const isConductor = user.roles?.some((r: any) => r.nombre === 'CONDUCTOR');
      
      if (!isConductor || user.unidadAsignada !== createLocationDto.unidadId) {
        throw new BadRequestException(
          'No tienes permiso para enviar ubicación de esta unidad',
        );
      }
    }

    return this.gpsService.createLocation(createLocationDto);
  }

  @Post('location/batch')
  @UseGuards(JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar múltiples ubicaciones (Batch)',
    description: 'Solo para administradores. Útil para importar datos históricos.',
  })
  @ApiCreatedResponse({
    description: 'Ubicaciones guardadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Ubicaciones guardadas exitosamente' },
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 50 },
          },
        },
      },
    },
  })
  async sendLocationBatch(@Body() locations: CreateLocationDto[]) {
    if (!Array.isArray(locations) || locations.length === 0) {
      throw new BadRequestException('Debe enviar un array de ubicaciones');
    }

    if (locations.length > 1000) {
      throw new BadRequestException('Máximo 1000 ubicaciones por batch');
    }

    const count = await this.gpsService.createLocationsBatch(locations);

    return {
      success: true,
      message: 'Ubicaciones guardadas exitosamente',
      data: { count },
    };
  }

  // ==========================================
  // CONSULTAR UBICACIONES ACTUALES
  // ==========================================

  @Get('current')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tracking', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener ubicaciones actuales de múltiples unidades',
    description:
      'Obtiene la última ubicación conocida de unidades según filtros. ' +
      'Puede filtrar por IDs de unidades, zona, o todas las unidades activas.',
  })
  @ApiQuery({
    name: 'unidadesIds',
    required: false,
    type: [Number],
    description: 'IDs de las unidades a consultar',
    example: [1, 2, 3],
  })
  @ApiQuery({
    name: 'zonaId',
    required: false,
    type: Number,
    description: 'ID de la zona',
    example: 1,
  })
  @ApiQuery({
    name: 'soloActivas',
    required: false,
    type: Boolean,
    description: 'Solo unidades con señal reciente',
    example: true,
  })
  @ApiQuery({
    name: 'proveedor',
    required: false,
    enum: ['MOBILE_APP', 'GPS_DEVICE'],
    description: 'Filtrar por tipo de proveedor',
  })
  @ApiOkResponse({
    description: 'Lista de ubicaciones actuales',
    type: CurrentLocationsListResponseDto,
  })
  async getCurrentLocations(
    @Query() query: QueryCurrentLocationsDto,
  ): Promise<CurrentLocationsListResponseDto> {
    return this.gpsService.getCurrentLocations(query);
  }

  @Get('current/:unidadId')
  @ApiOperation({
    summary: 'Obtener ubicación actual de una unidad',
    description: 'Obtiene la última ubicación conocida de una unidad específica con detalles.',
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ubicación actual de la unidad',
    type: CurrentLocationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada',
  })
  async getCurrentLocation(
    @Param('unidadId', ParseIntPipe) unidadId: number,
  ): Promise<CurrentLocationResponseDto> {
    return this.gpsService.getCurrentLocation(unidadId);
  }

  @Get('last/:unidadId')
  @ApiOperation({
    summary: 'Obtener última ubicación de una unidad (simple)',
    description: 'Obtiene solo los datos de la última ubicación sin información adicional.',
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Última ubicación de la unidad',
    type: LocationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró ubicación para esta unidad',
  })
  async getLastLocation(
    @Param('unidadId', ParseIntPipe) unidadId: number,
  ): Promise<LocationResponseDto | null> {
    return this.gpsService.getLastLocation(unidadId);
  }

  // ==========================================
  // HISTORIAL DE UBICACIONES
  // ==========================================

  @Get('history')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tracking', actions: ['read', 'history'] })
  @ApiOperation({
    summary: 'Obtener historial de ubicaciones (paginado)',
    description:
      'Obtiene el historial de ubicaciones con filtros y paginación. ' +
      'Útil para análisis, reportes y reproducción de rutas.',
  })
  @ApiQuery({
    name: 'unidadId',
    required: false,
    type: Number,
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    type: String,
    description: 'Fecha de inicio (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    type: String,
    description: 'Fecha de fin (ISO 8601)',
    example: '2025-01-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'proveedor',
    required: false,
    enum: ['MOBILE_APP', 'GPS_DEVICE'],
    description: 'Filtrar por tipo de proveedor',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Elementos por página (máximo 1000)',
    example: 50,
  })
  @ApiOkResponse({
    description: 'Historial de ubicaciones',
    type: LocationHistoryResponseDto,
  })
  async getLocationHistory(
    @Query() query: QueryLocationHistoryDto,
  ): Promise<LocationHistoryResponseDto> {
    return this.gpsService.getLocationHistory(query);
  }

  // ==========================================
  // ESTADO Y ESTADÍSTICAS
  // ==========================================

  @Get('stats')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tracking', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener estadísticas generales de tracking',
    description:
      'Obtiene estadísticas del sistema de tracking: ' +
      'unidades activas/inactivas, distribución por proveedor, precisión promedio.',
  })
  @ApiOkResponse({
    description: 'Estadísticas de tracking',
    type: TrackingStatsDto,
  })
  async getTrackingStats(): Promise<TrackingStatsDto> {
    return this.gpsService.getTrackingStats();
  }

  @Get('status/:unidadId')
  @ApiOperation({
    summary: 'Obtener estado de tracking de una unidad',
    description:
      'Obtiene el estado de tracking de una unidad: ' +
      'si está online, última actualización, tiempo inactivo, etc.',
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Estado de tracking de la unidad',
    schema: {
      type: 'object',
      properties: {
        unidadId: { type: 'number', example: 1 },
        isOnline: { type: 'boolean', example: true },
        lastUpdate: { type: 'string', example: '2025-01-15T10:30:00Z' },
        proveedor: { type: 'string', example: 'MOBILE_APP' },
        tiempoInactivoMinutos: { type: 'number', example: 2.5 },
      },
    },
  })
  async getTrackingStatus(@Param('unidadId', ParseIntPipe) unidadId: number) {
    return this.gpsService.getTrackingStatus(unidadId);
  }

  @Get('inactive')
  @UseGuards(JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener unidades inactivas',
    description: 'Obtiene IDs de unidades sin señal GPS hace más de X minutos.',
  })
  @ApiQuery({
    name: 'minutes',
    required: false,
    type: Number,
    description: 'Minutos de umbral de inactividad',
    example: 60,
  })
  @ApiOkResponse({
    description: 'Lista de IDs de unidades inactivas',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            unidadesIds: { type: 'array', items: { type: 'number' }, example: [1, 5, 8] },
            count: { type: 'number', example: 3 },
            minutesThreshold: { type: 'number', example: 60 },
          },
        },
      },
    },
  })
  async getInactiveUnits(@Query('minutes') minutes?: number) {
    const threshold = minutes || 60;
    const unidadesIds = await this.gpsService.getInactiveUnits(threshold);

    return {
      success: true,
      data: {
        unidadesIds,
        count: unidadesIds.length,
        minutesThreshold: threshold,
      },
    };
  }

  // ==========================================
  // VERIFICACIONES
  // ==========================================

  @Get('active/:unidadId')
  @ApiOperation({
    summary: 'Verificar si una unidad está activa',
    description: 'Verifica si la unidad ha enviado señal recientemente (últimos 5 minutos).',
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Estado de actividad',
    schema: {
      type: 'object',
      properties: {
        unidadId: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2025-01-15T10:30:00Z' },
      },
    },
  })
  async isUnitActive(@Param('unidadId', ParseIntPipe) unidadId: number) {
    const isActive = await this.gpsService.isUnitActive(unidadId);

    return {
      unidadId,
      isActive,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('device/:unidadId')
  @ApiOperation({
    summary: 'Verificar si unidad tiene GPS vehicular activo',
    description:
      'Verifica si la unidad tiene un dispositivo GPS vehicular instalado y activo.',
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Estado del GPS vehicular',
    schema: {
      type: 'object',
      properties: {
        unidadId: { type: 'number', example: 1 },
        hasGpsDevice: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2025-01-15T10:30:00Z' },
      },
    },
  })
  async hasActiveGpsDevice(@Param('unidadId', ParseIntPipe) unidadId: number) {
    const hasGpsDevice = await this.gpsService.hasActiveGpsDevice(unidadId);

    return {
      unidadId,
      hasGpsDevice,
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================
  // MANTENIMIENTO Y ADMINISTRACIÓN
  // ==========================================

  @Delete('cleanup')
  @UseGuards(JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Limpiar ubicaciones antiguas',
    description:
      'Elimina ubicaciones GPS más antiguas que X días. ' +
      'Solo para administradores. Útil para mantenimiento de base de datos.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Días a mantener (default: 30)',
    example: 30,
  })
  @ApiOkResponse({
    description: 'Ubicaciones eliminadas',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Ubicaciones limpiadas exitosamente' },
        data: {
          type: 'object',
          properties: {
            deletedCount: { type: 'number', example: 15000 },
            daysKept: { type: 'number', example: 30 },
          },
        },
      },
    },
  })
  async cleanOldLocations(@Query('days') days?: number) {
    const daysToKeep = days || 30;

    if (daysToKeep < 7) {
      throw new BadRequestException('Mínimo 7 días deben mantenerse');
    }

    if (daysToKeep > 365) {
      throw new BadRequestException('Máximo 365 días pueden especificarse');
    }

    const deletedCount = await this.gpsService.cleanOldLocations(daysToKeep);

    return {
      success: true,
      message: 'Ubicaciones limpiadas exitosamente',
      data: {
        deletedCount,
        daysKept: daysToKeep,
      },
    };
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Health check del sistema GPS',
    description: 'Verifica el estado de salud del módulo GPS.',
  })
  @ApiOkResponse({
    description: 'Estado del sistema',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-01-15T10:30:00Z' },
        checks: {
          type: 'object',
          properties: {
            database: { type: 'boolean', example: true },
            recentData: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  async healthCheck() {
    try {
      // Verificar que podemos consultar la BD
      const stats = await this.gpsService.getTrackingStats();
      const hasRecentData = stats.unidadesActivas > 0;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: true,
          recentData: hasRecentData,
        },
        stats: {
          totalUnidades: stats.totalUnidades,
          unidadesActivas: stats.unidadesActivas,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}