// =============================================
// src/turnos/turnos.controller.ts
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

import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { QueryTurnoDto } from './dto/query-turno.dto';
import { TurnoResponseDto } from './dto/turno-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
// import { Permissions } from '../auth/jwt/permissions.decorator';

@ApiTags('Turnos')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo turno',
    description: 'Crea un nuevo turno de trabajo con horarios específicos'
  })
  @ApiCreatedResponse({
    description: 'Turno creado exitosamente',
    type: TurnoResponseDto
  })
  @ApiConflictResponse({
    description: 'Ya existe un turno con el mismo nombre'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  async create(@Body() createTurnoDto: CreateTurnoDto): Promise<TurnoResponseDto> {
    return this.turnosService.create(createTurnoDto);
  }

  @Get()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['read'] })
  @ApiOperation({
    summary: 'Listar turnos',
    description: 'Obtiene una lista paginada de turnos con filtros opcionales'
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
    description: 'Cantidad de registros por página (por defecto: 10, máximo: 100)',
    example: 10
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Texto de búsqueda para filtrar por nombre',
    example: 'MAÑANA'
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por estado activo (true/false)',
    example: true
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo para ordenar (id, nombre, horaInicio, horaFin, createdAt)',
    example: 'nombre'
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Dirección de ordenamiento (asc/desc)',
    example: 'asc'
  })
  @ApiOkResponse({
    description: 'Lista de turnos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Turnos obtenidos exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/TurnoResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 25 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 3 },
                hasNext: { type: 'boolean', example: true },
                hasPrevious: { type: 'boolean', example: false }
              }
            }
          }
        }
      }
    }
  })
  async findAll(@Query() queryDto: QueryTurnoDto) {
    return this.turnosService.findAll(queryDto);
  }

  @Get('activos')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['read'] })
  @ApiOperation({
    summary: 'Listar turnos activos',
    description: 'Obtiene todos los turnos activos sin paginación, útil para selects y listas desplegables'
  })
  @ApiOkResponse({
    description: 'Turnos activos obtenidos exitosamente',
    type: [TurnoResponseDto]
  })
  async findAllActive(): Promise<TurnoResponseDto[]> {
    return this.turnosService.findAllActive();
  }

  @Get('estadisticas')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener estadísticas de turnos',
    description: 'Obtiene estadísticas generales sobre los turnos del sistema'
  })
  @ApiOkResponse({
    description: 'Estadísticas de turnos obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 10 },
        activos: { type: 'number', example: 8 },
        inactivos: { type: 'number', example: 2 },
        conAbastecimientos: { type: 'number', example: 6 },
        sinAbastecimientos: { type: 'number', example: 4 }
      }
    }
  })
  // async getStats() {
  //   return this.turnosService.getStats();
  // }

  @Get('nombre/:nombre')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar turno por nombre',
    description: 'Obtiene un turno específico por su nombre'
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del turno',
    example: 'MAÑANA'
  })
  @ApiOkResponse({
    description: 'Turno encontrado exitosamente',
    type: TurnoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Turno no encontrado'
  })
  async findByNombre(@Param('nombre') nombre: string): Promise<TurnoResponseDto> {
    return this.turnosService.findByNombre(nombre);
  }

  @Get(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener turno por ID',
    description: 'Obtiene un turno específico por su ID único'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del turno',
    example: 1
  })
  @ApiOkResponse({
    description: 'Turno encontrado exitosamente',
    type: TurnoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Turno no encontrado'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TurnoResponseDto> {
    return this.turnosService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar turno',
    description: 'Actualiza los datos de un turno existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del turno',
    example: 1
  })
  @ApiOkResponse({
    description: 'Turno actualizado exitosamente',
    type: TurnoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Turno no encontrado'
  })
  @ApiConflictResponse({
    description: 'Ya existe un turno con el mismo nombre'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTurnoDto: UpdateTurnoDto
  ): Promise<TurnoResponseDto> {
    return this.turnosService.update(id, updateTurnoDto);
  }

  @Patch(':id/toggle-status')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['update'] })
  @ApiOperation({
    summary: 'Cambiar estado de turno',
    description: 'Activa o desactiva un turno (toggle del estado activo)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del turno',
    example: 1
  })
  @ApiOkResponse({
    description: 'Estado del turno cambiado exitosamente',
    type: TurnoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Turno no encontrado'
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<TurnoResponseDto> {
    return this.turnosService.toggleStatus(id);
  }

  @Delete(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'turnos', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar turno',
    description: 'Elimina un turno del sistema. No se puede eliminar si tiene abastecimientos asociados.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del turno',
    example: 1
  })
  @ApiOkResponse({
    description: 'Turno eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Turno eliminado exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Turno MAÑANA eliminado exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Turno no encontrado'
  })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque tiene abastecimientos asociados'
  })
  @ApiBadRequestResponse({
    description: 'Error al eliminar el turno'
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.turnosService.remove(id);
  }
}