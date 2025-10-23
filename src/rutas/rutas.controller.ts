// src/rutas/rutas.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RutasService } from './rutas.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { FiltrosRutaDto } from './dto/filtros-ruta.dto';
import { RutaResponseDto, RutasPaginadasResponseDto } from './dto/ruta-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('Rutas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  /**
   * Crear una nueva ruta
   */
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva ruta',
    description: 'Crea una nueva ruta con la información proporcionada. El código debe ser único.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ruta creada exitosamente',
    type: RutaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o velocidad promedio no coherente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una ruta con este código',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async create(@Body() createRutaDto: CreateRutaDto): Promise<RutaResponseDto> {
    return await this.rutasService.create(createRutaDto);
  }

  /**
   * Listar todas las rutas con paginación y filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar rutas',
    description: 'Obtiene un listado paginado de rutas con opciones de filtrado y ordenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas obtenida exitosamente',
    type: RutasPaginadasResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
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
    description: 'Cantidad de registros por página',
    example: 10,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['ACTIVA', 'INACTIVA', 'EN_REVISION'],
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'nombre',
    required: false,
    type: String,
    description: 'Buscar por nombre (búsqueda parcial)',
  })
  @ApiQuery({
    name: 'codigo',
    required: false,
    type: String,
    description: 'Buscar por código exacto',
  })
  @ApiQuery({
    name: 'origen',
    required: false,
    type: String,
    description: 'Filtrar por ciudad de origen',
  })
  @ApiQuery({
    name: 'destino',
    required: false,
    type: String,
    description: 'Filtrar por ciudad de destino',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    enum: ['nombre', 'codigo', 'distanciaKm', 'createdAt'],
    description: 'Campo por el cual ordenar',
    example: 'nombre',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento',
    example: 'asc',
  })
  async findAll(@Query() filtros: FiltrosRutaDto): Promise<RutasPaginadasResponseDto> {
    return await this.rutasService.findAll(filtros);
  }

  /**
   * Obtener una ruta por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener ruta por ID',
    description: 'Obtiene los detalles completos de una ruta específica',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta encontrada',
    type: RutaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RutaResponseDto> {
    return await this.rutasService.findOne(id);
  }

  /**
   * Buscar ruta por código
   */
  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Buscar ruta por código',
    description: 'Obtiene una ruta mediante su código único',
  })
  @ApiParam({
    name: 'codigo',
    type: String,
    description: 'Código de la ruta',
    example: 'TRU-CHI-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta encontrada',
    type: RutaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async findByCodigo(@Param('codigo') codigo: string): Promise<RutaResponseDto> {
    return await this.rutasService.findByCodigo(codigo);
  }

  /**
   * Actualizar una ruta
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar ruta',
    description: 'Actualiza los datos de una ruta existente. Solo se modifican los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta actualizada exitosamente',
    type: RutaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una ruta con este código',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRutaDto: UpdateRutaDto,
  ): Promise<RutaResponseDto> {
    return await this.rutasService.update(id, updateRutaDto);
  }

  /**
   * Desactivar una ruta (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar ruta',
    description:
      'Desactiva una ruta (soft delete). La ruta cambia a estado INACTIVA pero no se elimina de la base de datos. No se puede desactivar si tiene asignaciones activas o está en itinerarios activos.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta desactivada exitosamente',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Ruta "Trujillo - Chiclayo" desactivada exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede desactivar la ruta porque tiene asignaciones activas o está en uso',
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.rutasService.remove(id);
  }

  /**
   * Reactivar una ruta inactiva
   */
  @Patch(':id/reactivar')
  @ApiOperation({
    summary: 'Reactivar ruta',
    description: 'Reactiva una ruta que estaba en estado INACTIVA',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta reactivada exitosamente',
    type: RutaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La ruta ya está activa',
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async reactivar(@Param('id', ParseIntPipe) id: number): Promise<RutaResponseDto> {
    return await this.rutasService.reactivar(id);
  }

  /**
   * Eliminar permanentemente una ruta (hard delete)
   * USAR CON PRECAUCIÓN
   */
  @Delete(':id/permanente')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar ruta permanentemente',
    description:
      '⚠️ ADVERTENCIA: Elimina permanentemente una ruta de la base de datos. Solo se puede usar si la ruta NO tiene ningún registro relacionado (asignaciones, itinerarios, tickets). Usar con extrema precaución.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta eliminada permanentemente',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Ruta "Trujillo - Chiclayo" eliminada permanentemente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar la ruta porque tiene registros relacionados',
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async removePermanently(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.rutasService.removePermanently(id);
  }
}