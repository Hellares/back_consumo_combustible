// =============================================
// src/licencias-conducir/licencias-conducir.controller.ts
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


import { QueryLicenciaConducirDto } from './dto/query-licencia-conducir.dto';
import { LicenciaConducirResponseDto } from './dto/licencia-conducir-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { LicenciasConducirService } from './licencias_conducir.service';
import { CreateLicenciaConducirDto } from './dto/create-licencias_conducir.dto';
import { UpdateLicenciaConducirDto } from './dto/update-licencias_conducir.dto';

@ApiTags('Licencias de Conducir')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('licencias-conducir')
export class LicenciasConducirController {
  constructor(private readonly licenciasConducirService: LicenciasConducirService) {}

  @Post()
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva licencia de conducir',
    description: 'Registra una nueva licencia de conducir para un usuario específico'
  })
  @ApiCreatedResponse({
    description: 'Licencia de conducir creada exitosamente',
    type: LicenciaConducirResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado'
  })
  @ApiConflictResponse({
    description: 'Ya existe una licencia con el mismo número'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, usuario inactivo o fechas incorrectas'
  })
  async create(@Body() createLicenciaConducirDto: CreateLicenciaConducirDto): Promise<LicenciaConducirResponseDto> {
    return this.licenciasConducirService.create(createLicenciaConducirDto);
  }

  @Get()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Listar licencias de conducir',
    description: 'Obtiene una lista paginada de licencias de conducir con filtros opcionales'
  })
  @ApiOkResponse({
    description: 'Lista de licencias obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Licencias obtenidas exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/LicenciaConducirResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 120 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 12 },
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
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por número, categoría o datos del usuario' })
  @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por usuario ID', type: 'number' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría de licencia' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo', type: 'boolean' })
  @ApiQuery({ name: 'estadoVigencia', required: false, description: 'Filtrar por estado de vigencia', enum: ['VIGENTE', 'PRÓXIMO_VENCIMIENTO', 'VENCIDA'] })
  @ApiQuery({ name: 'soloVencidas', required: false, description: 'Mostrar solo licencias vencidas', type: 'boolean' })
  @ApiQuery({ name: 'proximasVencer', required: false, description: 'Mostrar solo licencias próximas a vencer', type: 'boolean' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Ordenar por campo', enum: ['numeroLicencia', 'categoria', 'fechaEmision', 'fechaExpiracion', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Dirección del ordenamiento', enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QueryLicenciaConducirDto) {
    return this.licenciasConducirService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Estadísticas de licencias',
    description: 'Obtiene estadísticas generales de las licencias de conducir'
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
            total: { type: 'number', example: 120 },
            activas: { type: 'number', example: 110 },
            inactivas: { type: 'number', example: 10 },
            vencidas: { type: 'number', example: 15 },
            vigentes: { type: 'number', example: 80 },
            proximasVencer30: { type: 'number', example: 8 },
            proximasVencer90: { type: 'number', example: 15 },
            distribucePorCategoria: { 
              type: 'array', 
              items: {
                type: 'object',
                properties: {
                  categoria: { type: 'string', example: 'A-IIb' },
                  cantidad: { type: 'number', example: 45 }
                }
              }
            }
          }
        }
      }
    }
  })
  async getStats() {
    return this.licenciasConducirService.getStats();
  }

  @Get('vencidas')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener licencias vencidas',
    description: 'Obtiene todas las licencias que ya han expirado'
  })
  @ApiOkResponse({
    description: 'Licencias vencidas obtenidas exitosamente',
    type: [LicenciaConducirResponseDto]
  })
  async findVencidas(): Promise<LicenciaConducirResponseDto[]> {
    return this.licenciasConducirService.findVencidas();
  }

  @Get('proximas-vencer')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener licencias próximas a vencer',
    description: 'Obtiene licencias que vencen en los próximos días (por defecto 90 días)'
  })
  @ApiQuery({ name: 'dias', required: false, description: 'Días de anticipación', example: 90, type: 'number' })
  @ApiOkResponse({
    description: 'Licencias próximas a vencer obtenidas exitosamente',
    type: [LicenciaConducirResponseDto]
  })
  async findProximasVencer(@Query('dias', ParseIntPipe) dias: number = 90): Promise<LicenciaConducirResponseDto[]> {
    return this.licenciasConducirService.findProximasVencer(dias);
  }

  @Get('categoria/:categoria')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener licencias por categoría',
    description: 'Obtiene todas las licencias activas de una categoría específica'
  })
  @ApiParam({
    name: 'categoria',
    description: 'Categoría de la licencia',
    example: 'A-IIb'
  })
  @ApiOkResponse({
    description: 'Licencias de la categoría obtenidas exitosamente',
    type: [LicenciaConducirResponseDto]
  })
  async findByCategoria(@Param('categoria') categoria: string): Promise<LicenciaConducirResponseDto[]> {
    return this.licenciasConducirService.findByCategoria(categoria);
  }

  @Get('usuario/:usuarioId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener licencias por usuario',
    description: 'Obtiene todas las licencias activas de un usuario específico'
  })
  @ApiParam({
    name: 'usuarioId',
    description: 'ID único del usuario',
    example: 1
  })
  @ApiOkResponse({
    description: 'Licencias del usuario obtenidas exitosamente',
    type: [LicenciaConducirResponseDto]
  })
  async findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<LicenciaConducirResponseDto[]> {
    return this.licenciasConducirService.findByUsuario(usuarioId);
  }

  @Get('numero/:numeroLicencia')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar licencia por número',
    description: 'Obtiene una licencia específica por su número único'
  })
  @ApiParam({
    name: 'numeroLicencia',
    description: 'Número único de la licencia',
    example: 'Q12345678'
  })
  @ApiOkResponse({
    description: 'Licencia encontrada exitosamente',
    type: LicenciaConducirResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Licencia no encontrada'
  })
  async findByNumero(@Param('numeroLicencia') numeroLicencia: string): Promise<LicenciaConducirResponseDto> {
    return this.licenciasConducirService.findByNumero(numeroLicencia);
  }

  @Get(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener licencia por ID',
    description: 'Obtiene una licencia específica por su ID, incluyendo información del usuario'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la licencia',
    example: 1
  })
  @ApiOkResponse({
    description: 'Licencia encontrada exitosamente',
    type: LicenciaConducirResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Licencia no encontrada'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LicenciaConducirResponseDto> {
    return this.licenciasConducirService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar licencia de conducir',
    description: 'Actualiza los datos de una licencia de conducir existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la licencia',
    example: 1
  })
  @ApiOkResponse({
    description: 'Licencia actualizada exitosamente',
    type: LicenciaConducirResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Licencia no encontrada'
  })
  @ApiConflictResponse({
    description: 'Conflicto con número de licencia existente'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, usuario inactivo o fechas incorrectas'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLicenciaConducirDto: UpdateLicenciaConducirDto
  ): Promise<LicenciaConducirResponseDto> {
    return this.licenciasConducirService.update(id, updateLicenciaConducirDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['update'] })
  @ApiOperation({
    summary: 'Cambiar estado de licencia',
    description: 'Activa o desactiva una licencia de conducir (toggle del estado activo)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la licencia',
    example: 1
  })
  @ApiOkResponse({
    description: 'Estado de licencia cambiado exitosamente',
    type: LicenciaConducirResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Licencia no encontrada'
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<LicenciaConducirResponseDto> {
    return this.licenciasConducirService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'licencias', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar licencia de conducir',
    description: 'Elimina una licencia de conducir del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la licencia',
    example: 1
  })
  @ApiOkResponse({
    description: 'Licencia eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Licencia eliminada exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Licencia Q12345678 de Juan García eliminada exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Licencia no encontrada'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasConducirService.remove(id);
  }
}