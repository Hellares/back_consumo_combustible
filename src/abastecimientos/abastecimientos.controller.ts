// =============================================
// src/abastecimientos/abastecimientos.controller.ts
// =============================================

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Request
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
  ApiConflictResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';

import { AbastecimientosService } from './abastecimientos.service';
import { CreateAbastecimientoDto } from './dto/create-abastecimiento.dto';
import { UpdateAbastecimientoDto } from './dto/update-abastecimiento.dto';
import { QueryAbastecimientoDto } from './dto/query-abastecimiento.dto';
import { AbastecimientoResponseDto } from './dto/abastecimiento-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { AprobarAbastecimientoDto } from './dto/aprobar-abastecimiento.dto';
import { RechazarAbastecimientoDto } from './dto/rechazar-abastecimiento.dto';
// import { Permissions } from '../auth/jwt/permissions.decorator';

@ApiTags('Abastecimientos')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('abastecimientos')
export class AbastecimientosController {
  constructor(private readonly abastecimientosService: AbastecimientosService) {}

  @Post()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo abastecimiento',
    description: 'Registra un nuevo abastecimiento de combustible en el sistema con validaciones completas'
  })
  @ApiCreatedResponse({
    description: 'Abastecimiento creado exitosamente',
    type: AbastecimientoResponseDto
  })
  @ApiConflictResponse({
    description: 'Ya existe un abastecimiento con el mismo precinto'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, referencias inactivas o inconsistencias en kilometraje'
  })
  async create(@Body() createAbastecimientoDto: CreateAbastecimientoDto): Promise<AbastecimientoResponseDto> {
    return this.abastecimientosService.create(createAbastecimientoDto);
  }

  @Get()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({
    summary: 'Listar abastecimientos',
    description: 'Obtiene una lista paginada de abastecimientos con filtros avanzados y búsqueda'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (por defecto: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de registros por página (por defecto: 20, máximo: 100)',
    example: 20
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Texto de búsqueda (número de abastecimiento, placa, conductor)',
    example: 'ABC-123'
  })
  @ApiQuery({
    name: 'unidadId',
    required: false,
    description: 'Filtrar por ID de unidad',
    example: 5
  })
  @ApiQuery({
    name: 'conductorId',
    required: false,
    description: 'Filtrar por ID de conductor',
    example: 3
  })
  @ApiQuery({
    name: 'grifoId',
    required: false,
    description: 'Filtrar por ID de grifo',
    example: 1
  })
  @ApiQuery({
    name: 'turnoId',
    required: false,
    description: 'Filtrar por ID de turno',
    example: 2
  })
  @ApiQuery({
    name: 'estadoId',
    required: false,
    description: 'Filtrar por ID de estado (1=PENDIENTE, 2=APROBADO, 3=RECHAZADO)',
    example: 1
  })
  @ApiQuery({
    name: 'tipoCombustible',
    required: false,
    description: 'Filtrar por tipo de combustible',
    example: 'DIESEL'
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Fecha de inicio del rango de búsqueda (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fecha de fin del rango de búsqueda (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @ApiQuery({
    name: 'solosPendientes',
    required: false,
    description: 'Filtrar solo abastecimientos pendientes de aprobación',
    example: true
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo para ordenar (id, fecha, hora, numeroAbastecimiento, cantidad, costoTotal, kilometrajeActual, createdAt)',
    example: 'fecha'
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Dirección de ordenamiento (asc/desc)',
    example: 'desc'
  })
  @ApiOkResponse({
    description: 'Lista de abastecimientos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abastecimientos obtenidos exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/AbastecimientoResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 150 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 20 },
                totalPages: { type: 'number', example: 8 },
                hasNext: { type: 'boolean', example: true },
                hasPrevious: { type: 'boolean', example: false },
                nextPage: { type: 'number', example: 2 },
                prevPage: { type: 'number', example: null }
              }
            }
          }
        }
      }
    }
  })
  async findAll(@Query() queryDto: QueryAbastecimientoDto) {
    return this.abastecimientosService.findAll(queryDto);
  }

  @Get('estadisticas')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener estadísticas generales',
    description: 'Obtiene estadísticas generales de todos los abastecimientos del sistema'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Estadísticas obtenidas exitosamente' },
        data: {
          type: 'object',
          properties: {
            resumen: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 1250 },
                pendientes: { type: 'number', example: 15 },
                aprobados: { type: 'number', example: 1200 },
                rechazados: { type: 'number', example: 35 }
              }
            },
            combustible: {
              type: 'object',
              properties: {
                totalGalones: { type: 'number', example: 32500.75 },
                promedioGalones: { type: 'number', example: 26.0 }
              }
            },
            costos: {
              type: 'object',
              properties: {
                costoTotal: { type: 'number', example: 406259.38 },
                promedioCosto: { type: 'number', example: 325.01 }
              }
            }
          }
        }
      }
    }
  })
  async getStats() {
    return this.abastecimientosService.getStats();
  }

  @Get('unidad/:unidadId/estadisticas')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener estadísticas por unidad',
    description: 'Obtiene estadísticas detalladas de abastecimientos para una unidad específica incluyendo eficiencia'
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID único de la unidad',
    example: 5
  })
  @ApiOkResponse({
    description: 'Estadísticas de la unidad obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        unidad: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 5 },
            placa: { type: 'string', example: 'ABC-123' },
            marca: { type: 'string', example: 'Volvo' },
            modelo: { type: 'string', example: 'FH 460' }
          }
        },
        estadisticas: {
          type: 'object',
          properties: {
            totalAbastecimientos: { type: 'number', example: 45 },
            totalGalones: { type: 'number', example: 1250.75 },
            costoTotal: { type: 'number', example: 15634.38 },
            eficienciaPromedio: { type: 'number', example: 7.85 },
            ultimoAbastecimiento: {
              type: 'object',
              properties: {
                fecha: { type: 'string', example: '2024-01-15' },
                cantidad: { type: 'number', example: 25.5 },
                conductor: { type: 'string', example: 'Juan Pérez' }
              }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  async getStatsByUnidad(@Param('unidadId', ParseIntPipe) unidadId: number) {
    return this.abastecimientosService.getStatsByUnidad(unidadId);
  }

  @Get('conductor/:conductorId')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener abastecimientos por conductor',
    description: 'Obtiene los últimos abastecimientos registrados por un conductor específico'
  })
  @ApiParam({
    name: 'conductorId',
    description: 'ID único del conductor',
    example: 3
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de registros a retornar (por defecto: 10, máximo: 50)',
    example: 10
  })
  @ApiOkResponse({
    description: 'Abastecimientos del conductor obtenidos exitosamente',
    type: [AbastecimientoResponseDto]
  })
  @ApiNotFoundResponse({
    description: 'Conductor no encontrado'
  })
  async findByConductor(
    @Param('conductorId', ParseIntPipe) conductorId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ): Promise<AbastecimientoResponseDto[]> {
    // Validar límite máximo
    const validLimit = Math.min(limit, 50);
    return this.abastecimientosService.findByConductor(conductorId, validLimit);
  }

  @Get('numero/:numeroAbastecimiento')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar abastecimiento por número',
    description: 'Obtiene un abastecimiento específico por su número único generado automáticamente'
  })
  @ApiParam({
    name: 'numeroAbastecimiento',
    description: 'Número único del abastecimiento',
    example: 'AB-2024-01-000001'
  })
  @ApiOkResponse({
    description: 'Abastecimiento encontrado exitosamente',
    type: AbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Abastecimiento no encontrado'
  })
  async findByNumero(@Param('numeroAbastecimiento') numeroAbastecimiento: string): Promise<AbastecimientoResponseDto> {
    return this.abastecimientosService.findByNumero(numeroAbastecimiento);
  }

  @Get(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener abastecimiento por ID',
    description: 'Obtiene un abastecimiento específico por su ID único con toda la información relacionada'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del abastecimiento',
    example: 1
  })
  @ApiOkResponse({
    description: 'Abastecimiento encontrado exitosamente',
    type: AbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Abastecimiento no encontrado'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AbastecimientoResponseDto> {
    return this.abastecimientosService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar abastecimiento',
    description: 'Actualiza los datos de un abastecimiento que esté en estado PENDIENTE. No se pueden modificar unidad, conductor o grifo.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del abastecimiento',
    example: 1
  })
  @ApiOkResponse({
    description: 'Abastecimiento actualizado exitosamente',
    type: AbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Abastecimiento no encontrado'
  })
  @ApiConflictResponse({
    description: 'Conflicto con precinto duplicado'
  })
  @ApiBadRequestResponse({
    description: 'Solo se pueden modificar abastecimientos en estado PENDIENTE'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAbastecimientoDto: UpdateAbastecimientoDto
  ): Promise<AbastecimientoResponseDto> {
    return this.abastecimientosService.update(id, updateAbastecimientoDto);
  }

  @Patch(':id/aprobar')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['approve'] })
  @ApiOperation({
    summary: 'Aprobar abastecimiento',
    description: 'Aprueba un abastecimiento que esté en estado PENDIENTE, cambiándolo a estado APROBADO'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del abastecimiento',
    example: 1
  })
  @ApiOkResponse({
    description: 'Abastecimiento aprobado exitosamente',
    type: AbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Abastecimiento no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'Solo se pueden aprobar abastecimientos en estado PENDIENTE'
  })
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobarDto: AprobarAbastecimientoDto,
    @Request() req: any // Para obtener el usuario autenticado del JWT
  ): Promise<AbastecimientoResponseDto> {
    // En un escenario real, obtendrías el ID del usuario del token JWT
    // const aprobadoPorId = req.user?.id;
    const aprobadoPorId = req.user?.id || 1; // Temporal para testing sin auth
    return this.abastecimientosService.aprobar(id, aprobarDto, aprobadoPorId);
  }

  @Patch(':id/rechazar')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['approve'] })
  @ApiOperation({
    summary: 'Rechazar abastecimiento',
    description: 'Rechaza un abastecimiento que esté en estado PENDIENTE, cambiándolo a estado RECHAZADO con motivo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del abastecimiento',
    example: 1
  })
  @ApiOkResponse({
    description: 'Abastecimiento rechazado exitosamente',
    type: AbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Abastecimiento no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'Solo se pueden rechazar abastecimientos en estado PENDIENTE'
  })
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() rechazarDto: RechazarAbastecimientoDto,
    @Request() req: any // Para obtener el usuario autenticado del JWT
  ): Promise<AbastecimientoResponseDto> {
    // En un escenario real, obtendrías el ID del usuario del token JWT
    // const rechazadoPorId = req.user?.id;
    const rechazadoPorId = req.user?.id || 1; // Temporal para testing sin auth
    return this.abastecimientosService.rechazar(id, rechazarDto, rechazadoPorId);
  }

  @Delete(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar abastecimiento',
    description: 'Elimina físicamente un abastecimiento del sistema. Solo se pueden eliminar abastecimientos en estado PENDIENTE o RECHAZADO.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del abastecimiento',
    example: 1
  })
  @ApiOkResponse({
    description: 'Abastecimiento eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abastecimiento eliminado exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Abastecimiento AB-2024-01-000001 eliminado exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Abastecimiento no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'Solo se pueden eliminar abastecimientos PENDIENTES o RECHAZADOS'
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.abastecimientosService.remove(id);
  }
}