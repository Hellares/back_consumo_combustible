// src/itinerarios/itinerarios.controller.ts

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
import { ItinerariosService } from './itinerarios.service';
import { CreateItinerarioDto, CreateTramoDto } from './dto/create-itinerario.dto';
import { UpdateItinerarioDto } from './dto/update-itinerario.dto';
import { FiltrosItinerarioDto } from './dto/filtros-itinerario.dto';
import { 
  ItinerarioResponseDto, 
  ItinerariosPaginadosResponseDto,
  TramoResponseDto 
} from './dto/itinerario-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('Itinerarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('itinerarios')
export class ItinerariosController {
  constructor(private readonly itinerariosService: ItinerariosService) {}

  /**
   * Crear un nuevo itinerario con sus tramos
   */
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo itinerario',
    description: `Crea un itinerario completo con múltiples tramos. 
    
    **Validaciones automáticas:**
    - Código único
    - Secuencia correcta de tramos (destino N = origen N+1)
    - Todas las rutas existen
    - Órdenes consecutivos (1, 2, 3...)
    
    **Cálculos automáticos:**
    - Distancia total (suma de todas las rutas)
    - Tiempo total (suma de rutas + paradas)`,
  })
  @ApiResponse({
    status: 201,
    description: 'Itinerario creado exitosamente',
    type: ItinerarioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o secuencia de tramos incorrecta',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un itinerario con este código',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async create(@Body() createItinerarioDto: CreateItinerarioDto): Promise<ItinerarioResponseDto> {
    return await this.itinerariosService.create(createItinerarioDto);
  }

  /**
   * Listar todos los itinerarios con paginación y filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar itinerarios',
    description: 'Obtiene un listado paginado de itinerarios con opciones de filtrado y ordenamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de itinerarios obtenida exitosamente',
    type: ItinerariosPaginadosResponseDto,
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
    enum: ['ACTIVO', 'INACTIVO', 'EN_MANTENIMIENTO'],
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'tipoItinerario',
    required: false,
    enum: ['IDA_VUELTA', 'CIRCULAR', 'LINEAL'],
    description: 'Filtrar por tipo de itinerario',
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
  async findAll(@Query() filtros: FiltrosItinerarioDto): Promise<ItinerariosPaginadosResponseDto> {
    return await this.itinerariosService.findAll(filtros);
  }

  /**
   * Obtener un itinerario por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener itinerario por ID',
    description: 'Obtiene los detalles completos de un itinerario específico, incluyendo todos sus tramos ordenados',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del itinerario',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerario encontrado',
    type: ItinerarioResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerario no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ItinerarioResponseDto> {
    return await this.itinerariosService.findOne(id);
  }

  /**
   * Buscar itinerario por código
   */
  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Buscar itinerario por código',
    description: 'Obtiene un itinerario mediante su código único',
  })
  @ApiParam({
    name: 'codigo',
    type: String,
    description: 'Código del itinerario',
    example: 'RNC-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerario encontrado',
    type: ItinerarioResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerario no encontrado',
  })
  async findByCodigo(@Param('codigo') codigo: string): Promise<ItinerarioResponseDto> {
    return await this.itinerariosService.findByCodigo(codigo);
  }

  /**
   * Actualizar un itinerario (sin modificar tramos)
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar itinerario',
    description: `Actualiza los datos generales de un itinerario. 
    
    **Nota:** Para modificar tramos, usar los endpoints específicos de tramos.`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del itinerario',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerario actualizado exitosamente',
    type: ItinerarioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un itinerario con este código',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItinerarioDto: UpdateItinerarioDto,
  ): Promise<ItinerarioResponseDto> {
    return await this.itinerariosService.update(id, updateItinerarioDto);
  }

  /**
   * Desactivar un itinerario (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar itinerario',
    description: `Desactiva un itinerario (soft delete). 
    
    **Validaciones:**
    - No se puede desactivar si tiene asignaciones activas
    - No se puede desactivar si tiene ejecuciones en curso`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del itinerario',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Itinerario desactivado exitosamente',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Itinerario "Ruta Norte Completa" desactivado exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede desactivar el itinerario porque tiene asignaciones activas o ejecuciones en curso',
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerario no encontrado',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.itinerariosService.remove(id);
  }

  // ==================== ENDPOINTS DE TRAMOS ====================

  /**
   * Agregar un tramo a un itinerario existente
   */
  @Post(':id/tramos')
  @ApiOperation({
    summary: 'Agregar tramo al itinerario',
    description: `Agrega un nuevo tramo a un itinerario existente.
    
    **Validaciones automáticas:**
    - La ruta existe
    - No existe otro tramo con el mismo orden
    - La secuencia es correcta (ciudad origen coincide con destino del tramo anterior)
    
    **Acciones automáticas:**
    - Recalcula distancia total del itinerario
    - Recalcula tiempo total del itinerario`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del itinerario',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Tramo agregado exitosamente',
    type: TramoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Secuencia inválida o datos incorrectos',
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerario o ruta no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tramo con ese orden',
  })
  async agregarTramo(
    @Param('id', ParseIntPipe) id: number,
    @Body() createTramoDto: CreateTramoDto,
  ): Promise<TramoResponseDto> {
    return await this.itinerariosService.agregarTramo(id, createTramoDto);
  }

  /**
   * Eliminar un tramo de un itinerario
   */
  @Delete(':id/tramos/:tramoId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar tramo del itinerario',
    description: `Elimina un tramo específico de un itinerario.
    
    **Acciones automáticas:**
    - Reordena los tramos subsiguientes
    - Recalcula distancia total del itinerario
    - Recalcula tiempo total del itinerario`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del itinerario',
    example: 1,
  })
  @ApiParam({
    name: 'tramoId',
    type: Number,
    description: 'ID del tramo a eliminar',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Tramo eliminado exitosamente',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Tramo 2 eliminado exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerario o tramo no encontrado',
  })
  async eliminarTramo(
    @Param('id', ParseIntPipe) id: number,
    @Param('tramoId', ParseIntPipe) tramoId: number,
  ): Promise<{ message: string }> {
    return await this.itinerariosService.eliminarTramo(id, tramoId);
  }
}