// =============================================
// src/unidades/unidades.controller.ts
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
  HttpCode
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

import { UnidadesService } from './unidades.service';
import { QueryUnidadDto } from './dto/query-unidad.dto';
import { UnidadResponseDto } from './dto/unidad-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { CreateUnidadDto } from './dto/create-unidade.dto';
import { UpdateUnidadDto } from './dto/update-unidade.dto';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';

@ApiTags('Unidades')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva unidad',
    description: 'Registra una nueva unidad vehicular en el sistema'
  })
  @ApiCreatedResponse({
    description: 'Unidad creada exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Conductor o zona no encontrados'
  })
  @ApiConflictResponse({
    description: 'Ya existe una unidad con la misma placa, VIN o número de motor, o el conductor ya tiene una unidad asignada'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, conductor inactivo, zona inactiva o fecha incorrecta'
  })
  async create(@Body() createUnidadDto: CreateUnidadDto): Promise<UnidadResponseDto> {
    return this.unidadesService.create(createUnidadDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Listar unidades',
    description: 'Obtiene una lista paginada de unidades con filtros opcionales'
  })
  @ApiOkResponse({
    description: 'Lista de unidades obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Unidades obtenidas exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UnidadResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 85 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 9 },
                offset: { type: 'number', example: 0 },
                limit: { type: 'number', example: 10 },
                nextOffset: { type: 'number', example: 10, nullable: true },
                prevOffset: { type: 'number', example: null, nullable: true },
                hasNext: { type: 'boolean', example: true },
                hasPrevious: { type: 'boolean', example: false }
              }
            }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por placa, marca, modelo o conductor' })
  @ApiQuery({ name: 'conductorOperadorId', required: false, description: 'Filtrar por conductor ID', type: 'number' })
  @ApiQuery({ name: 'zonaOperacionId', required: false, description: 'Filtrar por zona ID', type: 'number' })
  @ApiQuery({ name: 'marca', required: false, description: 'Filtrar por marca' })
  @ApiQuery({ name: 'tipoCombustible', required: false, description: 'Filtrar por tipo de combustible', enum: ['DIESEL', 'GASOLINA', 'GLP', 'GNV', 'ELECTRICO', 'HIBRIDO'] })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado operativo', enum: ['OPERATIVO', 'MANTENIMIENTO', 'AVERIADO', 'FUERA_SERVICIO', 'EN_REVISION'] })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo', type: 'boolean' })
  @ApiQuery({ name: 'sinConductor', required: false, description: 'Mostrar solo unidades sin conductor', type: 'boolean' })
  @ApiQuery({ name: 'soloOperativas', required: false, description: 'Mostrar solo unidades operativas', type: 'boolean' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Ordenar por campo', enum: ['placa', 'marca', 'modelo', 'anio', 'estado', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Dirección del ordenamiento', enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QueryUnidadDto) {
    return this.unidadesService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({
    summary: 'Estadísticas de unidades',
    description: 'Obtiene estadísticas generales de las unidades'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 85 },
            activas: { type: 'number', example: 78 },
            sinConductor: { type: 'number', example: 12 },
            conConductor: { type: 'number', example: 66 },
            distribucePorEstado: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  estado: { type: 'string', example: 'OPERATIVO' },
                  cantidad: { type: 'number', example: 65 }
                }
              }
            },
            distribucePorTipoCombustible: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  tipoCombustible: { type: 'string', example: 'DIESEL' },
                  cantidad: { type: 'number', example: 72 }
                }
              }
            },
            distribucePorZona: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  zonaId: { type: 'number', example: 1 },
                  cantidad: { type: 'number', example: 40 }
                }
              }
            },
            topMarcas: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  marca: { type: 'string', example: 'Volvo' },
                  cantidad: { type: 'number', example: 25 }
                }
              }
            }
          }
        }
      }
    }
  })
  async getStats() {
    return this.unidadesService.getStats();
  }

  @Get('sin-conductor')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener unidades sin conductor',
    description: 'Obtiene todas las unidades operativas que no tienen conductor asignado'
  })
  @ApiOkResponse({
    description: 'Unidades sin conductor obtenidas exitosamente',
    type: [UnidadResponseDto]
  })
  async findSinConductor(): Promise<UnidadResponseDto[]> {
    return this.unidadesService.findSinConductor();
  }

  @Get('zona/:zonaId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener unidades por zona',
    description: 'Obtiene todas las unidades activas de una zona específica'
  })
  @ApiParam({
    name: 'zonaId',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Unidades de la zona obtenidas exitosamente',
    type: [UnidadResponseDto]
  })
  async findByZona(@Param('zonaId', ParseIntPipe) zonaId: number): Promise<UnidadResponseDto[]> {
    return this.unidadesService.findByZona(zonaId);
  }

  @Get('conductor/:conductorId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener unidad por conductor',
    description: 'Obtiene la unidad asignada a un conductor específico'
  })
  @ApiParam({
    name: 'conductorId',
    description: 'ID único del conductor',
    example: 5
  })
  @ApiOkResponse({
    description: 'Unidad del conductor obtenida exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'El conductor no tiene unidad asignada'
  })
  async findByConductor(@Param('conductorId', ParseIntPipe) conductorId: number): Promise<UnidadResponseDto | null> {
    return this.unidadesService.findByConductor(conductorId);
  }

  @Get('placa/:placa')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar unidad por placa',
    description: 'Obtiene una unidad específica por su número de placa'
  })
  @ApiParam({
    name: 'placa',
    description: 'Número de placa de la unidad',
    example: 'ABC-123'
  })
  @ApiOkResponse({
    description: 'Unidad encontrada exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  async findByPlaca(@Param('placa') placa: string): Promise<UnidadResponseDto> {
    return this.unidadesService.findByPlaca(placa);
  }

  @Get(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener unidad por ID',
    description: 'Obtiene una unidad específica por su ID, incluyendo información detallada'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la unidad',
    example: 1
  })
  @ApiOkResponse({
    description: 'Unidad encontrada exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UnidadResponseDto> {
    return this.unidadesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar unidad',
    description: 'Actualiza los datos de una unidad existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la unidad',
    example: 1
  })
  @ApiOkResponse({
    description: 'Unidad actualizada exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  @ApiConflictResponse({
    description: 'Conflicto con placa, VIN, número de motor o conductor ya asignado'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, conductor inactivo, zona inactiva o fecha incorrecta'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadDto: UpdateUnidadDto
  ): Promise<UnidadResponseDto> {
    return this.unidadesService.update(id, updateUnidadDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['update'] })
  @ApiOperation({
    summary: 'Cambiar estado de unidad',
    description: 'Activa o desactiva una unidad (toggle del estado activo)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la unidad',
    example: 1
  })
  @ApiOkResponse({
    description: 'Estado de unidad cambiado exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<UnidadResponseDto> {
    return this.unidadesService.toggleStatus(id);
  }

  @Patch(':id/asignar-conductor/:conductorId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['update'] })
  @ApiOperation({
    summary: 'Asignar conductor a unidad',
    description: 'Asigna un conductor específico a una unidad'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la unidad',
    example: 1
  })
  @ApiParam({
    name: 'conductorId',
    description: 'ID único del conductor',
    example: 5
  })
  @ApiOkResponse({
    description: 'Conductor asignado exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Unidad o conductor no encontrados'
  })
  @ApiConflictResponse({
    description: 'El conductor ya tiene una unidad asignada'
  })
  @ApiBadRequestResponse({
    description: 'Conductor inactivo'
  })
  async asignarConductor(
    @Param('id', ParseIntPipe) unidadId: number,
    @Param('conductorId', ParseIntPipe) conductorId: number
  ): Promise<UnidadResponseDto> {
    return this.unidadesService.asignarConductor(unidadId, conductorId);
  }

  @Patch(':id/desasignar-conductor')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['update'] })
  @ApiOperation({
    summary: 'Desasignar conductor de unidad',
    description: 'Remueve el conductor asignado de una unidad'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la unidad',
    example: 1
  })
  @ApiOkResponse({
    description: 'Conductor desasignado exitosamente',
    type: UnidadResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  async desasignarConductor(@Param('id', ParseIntPipe) unidadId: number): Promise<UnidadResponseDto> {
    return this.unidadesService.desasignarConductor(unidadId);
  }

  @Delete(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'unidades', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar unidad',
    description: 'Elimina una unidad del sistema. No se puede eliminar si tiene registros históricos asociados.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la unidad',
    example: 1
  })
  @ApiOkResponse({
    description: 'Unidad eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Unidad eliminada exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Unidad "ABC-123" (Volvo FH 460) eliminada exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  @ApiConflictResponse({
    description: 'No se puede eliminar la unidad porque tiene registros históricos asociados'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.unidadesService.remove(id);
  }
}
