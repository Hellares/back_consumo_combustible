// =============================================
// src/zonas/zonas.controller.ts
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

import { ZonasService } from './zonas.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { ZonaResponseDto } from './dto/zona-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { QueryZonaDto } from './dto/query-zona.dto';

@ApiTags('Zonas')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva zona',
    description: 'Crea una nueva zona geográfica para el sistema de control de combustible'
  })
  @ApiCreatedResponse({
    description: 'Zona creada exitosamente',
    type: ZonaResponseDto
  })
  @ApiConflictResponse({
    description: 'Ya existe una zona con el mismo nombre o código'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  async create(@Body() createZonaDto: CreateZonaDto): Promise<ZonaResponseDto> {
    return this.zonasService.create(createZonaDto);
  }

  @Get()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Listar zonas',
    description: 'Obtiene una lista paginada de zonas con filtros opcionales'
  })
  @ApiOkResponse({
    description: 'Lista de zonas obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Zonas obtenidas exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ZonaResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 50 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 5 },
                hasNextPage: { type: 'boolean', example: true },
                hasPreviousPage: { type: 'boolean', example: false }
              }
            }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o código' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo', type: 'boolean' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Ordenar por campo', enum: ['nombre', 'codigo', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Dirección del ordenamiento', enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QueryZonaDto) {
    return this.zonasService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['read'] })
  @ApiOperation({
    summary: 'Estadísticas de zonas',
    description: 'Obtiene estadísticas generales de las zonas'
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
            total: { type: 'number', example: 15 },
            activas: { type: 'number', example: 12 },
            inactivas: { type: 'number', example: 3 },
            conSedes: { type: 'number', example: 10 },
            conUnidades: { type: 'number', example: 8 },
            sinAsignar: { type: 'number', example: 2 }
          }
        }
      }
    }
  })
  async getStats() {
    return this.zonasService.getStats();
  }

  @Get('codigo/:codigo')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar zona por código',
    description: 'Obtiene una zona específica por su código único'
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código único de la zona',
    example: 'LIMA'
  })
  @ApiOkResponse({
    description: 'Zona encontrada exitosamente',
    type: ZonaResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Zona no encontrada'
  })
  async findByCode(@Param('codigo') codigo: string): Promise<ZonaResponseDto> {
    return this.zonasService.findByCode(codigo);
  }

  @Get(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener zona por ID',
    description: 'Obtiene una zona específica por su ID, incluyendo información de sedes asociadas'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Zona encontrada exitosamente',
    type: ZonaResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Zona no encontrada'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ZonaResponseDto> {
    return this.zonasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar zona',
    description: 'Actualiza los datos de una zona existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Zona actualizada exitosamente',
    type: ZonaResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Zona no encontrada'
  })
  @ApiConflictResponse({
    description: 'Conflicto con nombre o código existente'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateZonaDto: UpdateZonaDto
  ): Promise<ZonaResponseDto> {
    return this.zonasService.update(id, updateZonaDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['update'] })
  @ApiOperation({
    summary: 'Cambiar estado de zona',
    description: 'Activa o desactiva una zona (toggle del estado activo)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Estado de zona cambiado exitosamente',
    type: ZonaResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Zona no encontrada'
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<ZonaResponseDto> {
    return this.zonasService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'zonas', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar zona',
    description: 'Elimina una zona del sistema. No se puede eliminar si tiene sedes o unidades asociadas.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Zona eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Zona eliminada exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Zona "Lima Metropolitana" eliminada exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Zona no encontrada'
  })
  @ApiConflictResponse({
    description: 'No se puede eliminar la zona porque tiene dependencias'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonasService.remove(id);
  }
}