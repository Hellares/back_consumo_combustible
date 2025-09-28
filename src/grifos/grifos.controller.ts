// =============================================
// src/grifos/grifos.controller.ts
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

import { GrifosService } from './grifos.service';
import { CreateGrifoDto } from './dto/create-grifo.dto';
import { UpdateGrifoDto } from './dto/update-grifo.dto';
import { QueryGrifoDto } from './dto/query-grifo.dto';
import { GrifoResponseDto } from './dto/grifo-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';

@ApiTags('Grifos')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('grifos')
export class GrifosController {
  constructor(private readonly grifosService: GrifosService) {}

  @Post()
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nuevo grifo',
    description: 'Crea un nuevo punto de abastecimiento (grifo) asociado a una sede específica'
  })
  @ApiCreatedResponse({
    description: 'Grifo creado exitosamente',
    type: GrifoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Sede no encontrada'
  })
  @ApiConflictResponse({
    description: 'Ya existe un grifo con el mismo nombre o código'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, sede inactiva o horarios inválidos'
  })
  async create(@Body() createGrifoDto: CreateGrifoDto): Promise<GrifoResponseDto> {
    return this.grifosService.create(createGrifoDto);
  }

  @Get()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Listar grifos',
    description: 'Obtiene una lista paginada de grifos con filtros opcionales'
  })
  @ApiOkResponse({
    description: 'Lista de grifos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Grifos obtenidos exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/GrifoResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 45 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 5 },
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
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, código o dirección' })
  @ApiQuery({ name: 'sedeId', required: false, description: 'Filtrar por sede ID', type: 'number' })
  @ApiQuery({ name: 'zonaId', required: false, description: 'Filtrar por zona ID', type: 'number' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo', type: 'boolean' })
  @ApiQuery({ name: 'soloAbiertos', required: false, description: 'Mostrar solo grifos abiertos', type: 'boolean' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Ordenar por campo', enum: ['nombre', 'codigo', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Dirección del ordenamiento', enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QueryGrifoDto) {
    return this.grifosService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({
    summary: 'Estadísticas de grifos',
    description: 'Obtiene estadísticas generales de los grifos'
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
            total: { type: 'number', example: 45 },
            activos: { type: 'number', example: 40 },
            inactivos: { type: 'number', example: 5 },
            conAbastecimientos: { type: 'number', example: 35 },
            sinAbastecimientos: { type: 'number', example: 10 },
            abiertos: { type: 'number', example: 28 },
            cerrados: { type: 'number', example: 12 },
            distribucePorSede: { type: 'array', example: [] }
          }
        }
      }
    }
  })
  // async getStats() {
  //   return this.grifosService.getStats();
  // }

  @Get('abiertos')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener grifos abiertos',
    description: 'Obtiene todos los grifos que están actualmente abiertos según su horario'
  })
  @ApiOkResponse({
    description: 'Grifos abiertos obtenidos exitosamente',
    type: [GrifoResponseDto]
  })
  async findAbiertos(): Promise<GrifoResponseDto[]> {
    return this.grifosService.findAbiertos();
  }

  @Get('sede/:sedeId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener grifos por sede',
    description: 'Obtiene todos los grifos activos de una sede específica'
  })
  @ApiParam({
    name: 'sedeId',
    description: 'ID único de la sede',
    example: 1
  })
  @ApiOkResponse({
    description: 'Grifos de la sede obtenidos exitosamente',
    type: [GrifoResponseDto]
  })
  async findBySede(@Param('sedeId', ParseIntPipe) sedeId: number): Promise<GrifoResponseDto[]> {
    return this.grifosService.findBySede(sedeId);
  }

  @Get('zona/:zonaId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener grifos por zona',
    description: 'Obtiene todos los grifos activos de una zona específica'
  })
  @ApiParam({
    name: 'zonaId',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Grifos de la zona obtenidos exitosamente',
    type: [GrifoResponseDto]
  })
  async findByZona(@Param('zonaId', ParseIntPipe) zonaId: number): Promise<GrifoResponseDto[]> {
    return this.grifosService.findByZona(zonaId);
  }

  @Get('codigo/:codigo')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar grifo por código',
    description: 'Obtiene un grifo específico por su código único'
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código único del grifo',
    example: 'GRF001'
  })
  @ApiOkResponse({
    description: 'Grifo encontrado exitosamente',
    type: GrifoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Grifo no encontrado'
  })
  async findByCode(@Param('codigo') codigo: string): Promise<GrifoResponseDto> {
    return this.grifosService.findByCode(codigo);
  }

  @Get(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener grifo por ID',
    description: 'Obtiene un grifo específico por su ID, incluyendo información de sede y zona'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grifo',
    example: 1
  })
  @ApiOkResponse({
    description: 'Grifo encontrado exitosamente',
    type: GrifoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Grifo no encontrado'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GrifoResponseDto> {
    return this.grifosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar grifo',
    description: 'Actualiza los datos de un grifo existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grifo',
    example: 1
  })
  @ApiOkResponse({
    description: 'Grifo actualizado exitosamente',
    type: GrifoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Grifo no encontrado'
  })
  @ApiConflictResponse({
    description: 'Conflicto con nombre o código existente'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, sede inactiva o horarios inválidos'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGrifoDto: UpdateGrifoDto
  ): Promise<GrifoResponseDto> {
    return this.grifosService.update(id, updateGrifoDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['update'] })
  @ApiOperation({
    summary: 'Cambiar estado de grifo',
    description: 'Activa o desactiva un grifo (toggle del estado activo)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grifo',
    example: 1
  })
  @ApiOkResponse({
    description: 'Estado de grifo cambiado exitosamente',
    type: GrifoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Grifo no encontrado'
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<GrifoResponseDto> {
    return this.grifosService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'grifos', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar grifo',
    description: 'Elimina un grifo del sistema. No se puede eliminar si tiene abastecimientos registrados.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grifo',
    example: 1
  })
  @ApiOkResponse({
    description: 'Grifo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Grifo eliminado exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Grifo "Central A" eliminado exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Grifo no encontrado'
  })
  @ApiConflictResponse({
    description: 'No se puede eliminar el grifo porque tiene abastecimientos registrados'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.grifosService.remove(id);
  }
}
