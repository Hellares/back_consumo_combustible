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

import { SedesService } from './sedes.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { QuerySedeDto } from './dto/query-sede.dto';
import { SedeResponseDto } from './dto/sede-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';

@ApiTags('Sedes')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Post()
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva sede',
    description: 'Crea una nueva sede asociada a una zona específica'
  })
  @ApiCreatedResponse({
    description: 'Sede creada exitosamente',
    type: SedeResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Zona no encontrada'
  })
  @ApiConflictResponse({
    description: 'Ya existe una sede con el mismo nombre o código'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o zona inactiva'
  })
  async create(@Body() createSedeDto: CreateSedeDto): Promise<SedeResponseDto> {
    return this.sedesService.create(createSedeDto);
  }


  
  @Get()
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['read'] })
  
  @ApiOperation({ 
    summary: 'Listar sedes',
    description: 'Obtiene una lista paginada de sedes con filtros opcionales'
  })
  @ApiOkResponse({
    description: 'Lista de sedes obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Sedes obtenidas exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/SedeResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 25 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 3 },
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
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, código o dirección' })
  @ApiQuery({ name: 'zonaId', required: false, description: 'Filtrar por zona ID', type: 'number' })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo', type: 'boolean' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Ordenar por campo', enum: ['nombre', 'codigo', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Dirección del ordenamiento', enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QuerySedeDto) {
    return this.sedesService.findAll(queryDto);
  }

  // @Get('stats')
  // @UseGuards(JwtPermissionsGuard)
  // // @Permissions({ resource: 'sedes', actions: ['read'] })
  // @ApiOperation({
  //   summary: 'Estadísticas de sedes',
  //   description: 'Obtiene estadísticas generales de las sedes'
  // })
  // @ApiOkResponse({
  //   description: 'Estadísticas obtenidas exitosamente',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       success: { type: 'boolean', example: true },
  //       message: { type: 'string' },
  //       data: {
  //         type: 'object',
  //         properties: {
  //           total: { type: 'number', example: 25 },
  //           activas: { type: 'number', example: 22 },
  //           inactivas: { type: 'number', example: 3 },
  //           conGrifos: { type: 'number', example: 18 },
  //           sinGrifos: { type: 'number', example: 7 },
  //           distribucePorZona: { type: 'array', example: [] }
  //         }
  //       }
  //     }
  //   }
  // })
  // async getStats() {
  //   return this.sedesService.getStats();
  // }

  @Get('zona/:zonaId')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener sedes por zona',
    description: 'Obtiene todas las sedes activas de una zona específica'
  })
  @ApiParam({
    name: 'zonaId',
    description: 'ID único de la zona',
    example: 1
  })
  @ApiOkResponse({
    description: 'Sedes de la zona obtenidas exitosamente',
    type: [SedeResponseDto]
  })
  async findByZona(@Param('zonaId', ParseIntPipe) zonaId: number): Promise<SedeResponseDto[]> {
    return this.sedesService.findByZona(zonaId);
  }

  @Get('codigo/:codigo')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['read'] })
  @ApiOperation({
    summary: 'Buscar sede por código',
    description: 'Obtiene una sede específica por su código único'
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código único de la sede',
    example: 'SEDE01'
  })
  @ApiOkResponse({
    description: 'Sede encontrada exitosamente',
    type: SedeResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Sede no encontrada'
  })
  async findByCode(@Param('codigo') codigo: string): Promise<SedeResponseDto> {
    return this.sedesService.findByCode(codigo);
  }

  @Get(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener sede por ID',
    description: 'Obtiene una sede específica por su ID, incluyendo información de zona y grifos asociados'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la sede',
    example: 1
  })
  @ApiOkResponse({
    description: 'Sede encontrada exitosamente',
    type: SedeResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Sede no encontrada'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SedeResponseDto> {
    return this.sedesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar sede',
    description: 'Actualiza los datos de una sede existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la sede',
    example: 1
  })
  @ApiOkResponse({
    description: 'Sede actualizada exitosamente',
    type: SedeResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Sede no encontrada'
  })
  @ApiConflictResponse({
    description: 'Conflicto con nombre o código existente'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o zona inactiva'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto
  ): Promise<SedeResponseDto> {
    return this.sedesService.update(id, updateSedeDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['update'] })
  @ApiOperation({
    summary: 'Cambiar estado de sede',
    description: 'Activa o desactiva una sede (toggle del estado activo)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la sede',
    example: 1
  })
  @ApiOkResponse({
    description: 'Estado de sede cambiado exitosamente',
    type: SedeResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Sede no encontrada'
  })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<SedeResponseDto> {
    return this.sedesService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'sedes', actions: ['delete'] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar sede',
    description: 'Elimina una sede del sistema. No se puede eliminar si tiene grifos asociados.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la sede',
    example: 1
  })
  @ApiOkResponse({
    description: 'Sede eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Sede eliminada exitosamente' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Sede "Central Lima" eliminada exitosamente' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Sede no encontrada'
  })
  @ApiConflictResponse({
    description: 'No se puede eliminar la sede porque tiene grifos asociados'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.remove(id);
  }
}