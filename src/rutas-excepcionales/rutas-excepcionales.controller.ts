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
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RutasExcepcionalesService } from './rutas-excepcionales.service';
import { CreateRutaExcepcionalDto } from './dto/create-ruta-excepcional.dto';
import { UpdateRutaExcepcionalDto } from './dto/update-ruta-excepcional.dto';
import { FiltrosRutaExcepcionalDto } from './dto/filtros-ruta-excepcional.dto';
import {
  RutaExcepcionalResponseDto,
} from './dto/ruta-excepcional-response.dto';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';

@ApiTags('Rutas Excepcionales')
@ApiBearerAuth()
@Controller('rutas-excepcionales')
@UsePipes(new ValidationPipe({ transform: true }))
export class RutasExcepcionalesController {
  constructor(private readonly rutasExcepcionalesService: RutasExcepcionalesService) {}

  /**
   * Asignar una ruta excepcional a una unidad
   */
  @Post('asignar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asignar ruta excepcional a una unidad',
    description: `Asigna una ruta excepcional (viaje único) a una unidad para una fecha específica.
    
    **Características:**
    - ✅ Permite asignar sin desasignar el itinerario permanente
    - ✅ Prioridad automática: Ruta excepcional > Itinerario permanente
    - ✅ Validación inteligente de disponibilidad
    - ✅ Sistema de advertencias
    - ✅ Control de autorización
    
    **Casos de uso:**
    - Emergencias
    - Reemplazos temporales
    - Cargas especiales
    - Viajes puntuales`,
  })
  @ApiBody({ type: CreateRutaExcepcionalDto })
  @ApiResponse({
    status: 201,
    description: 'Ruta excepcional asignada exitosamente',
    // type: RutaExcepcionalCreatedDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o fecha pasada',
  })
  @ApiResponse({
    status: 404,
    description: 'Unidad o ruta no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: Ya existe una ruta excepcional para esa fecha',
  })
  @UseGuards(JwtAuthGuard)
  async asignar(
    @Body() createDto: CreateRutaExcepcionalDto,
    @Req() req: any,
  ): Promise<RutaExcepcionalResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return await this.rutasExcepcionalesService.asignarRutaExcepcional(createDto, userId);
  }

  /**
   * Listar todas las rutas excepcionales con filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Listar rutas excepcionales',
    description: 'Obtiene una lista paginada de rutas excepcionales con filtros opcionales',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'unidadId', required: false, type: Number })
  @ApiQuery({ name: 'rutaId', required: false, type: Number })
  @ApiQuery({ name: 'soloActivas', required: false, type: Boolean })
  @ApiQuery({ name: 'prioridad', required: false, enum: ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, example: '2025-10-01' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, example: '2025-10-31' })
  @ApiQuery({ name: 'motivoAsignacion', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas excepcionales',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/RutaExcepcionalResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() filtros: FiltrosRutaExcepcionalDto) {
    return await this.rutasExcepcionalesService.findAll(filtros);
  }

  /**
   * Obtener una ruta excepcional específica
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener ruta excepcional por ID',
    description: 'Obtiene los detalles completos de una ruta excepcional',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta excepcional',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta excepcional encontrada',
    type: RutaExcepcionalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta excepcional no encontrada',
  })
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RutaExcepcionalResponseDto> {
    return await this.rutasExcepcionalesService.findOne(id);
  }

  /**
   * Obtener rutas excepcionales de una unidad en un rango de fechas
   */
  @Get('unidad/:unidadId/rango')
  @ApiOperation({
    summary: 'Obtener rutas excepcionales de una unidad en rango de fechas',
    description: 'Lista todas las rutas excepcionales activas de una unidad en un período',
  })
  @ApiParam({
    name: 'unidadId',
    type: Number,
    description: 'ID de la unidad',
    example: 5,
  })
  @ApiQuery({
    name: 'fechaInicio',
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'fechaFin',
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2025-10-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas excepcionales en el rango',
    type: [RutaExcepcionalResponseDto],
  })
  @UseGuards(JwtAuthGuard)
  async obtenerPorUnidadYRango(
    @Param('unidadId', ParseIntPipe) unidadId: number,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<RutaExcepcionalResponseDto[]> {
    return await this.rutasExcepcionalesService.obtenerPorUnidadYRango(
      unidadId,
      fechaInicio,
      fechaFin,
    );
  }

  /**
   * Actualizar una ruta excepcional
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar ruta excepcional',
    description: `Actualiza los datos de una ruta excepcional.
    
    **NOTA:** No se puede cambiar la unidad, ruta o fecha del viaje.`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta excepcional',
    example: 1,
  })
  @ApiBody({ type: UpdateRutaExcepcionalDto })
  @ApiResponse({
    status: 200,
    description: 'Ruta excepcional actualizada exitosamente',
    type: RutaExcepcionalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta excepcional no encontrada',
  })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRutaExcepcionalDto,
    @Req() req: any,
  ): Promise<RutaExcepcionalResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return await this.rutasExcepcionalesService.update(id, updateDto, userId);
  }

  /**
   * Cancelar una ruta excepcional
   */
  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar ruta excepcional',
    description: 'Cancela (desactiva) una ruta excepcional. No se puede cancelar si la fecha ya pasó.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la ruta excepcional',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta excepcional cancelada exitosamente',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Ruta excepcional "Trujillo - Piura" cancelada exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'La ruta ya está cancelada o la fecha ya pasó',
  })
  @ApiResponse({
    status: 404,
    description: 'Ruta excepcional no encontrada',
  })
  @UseGuards(JwtAuthGuard)
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return await this.rutasExcepcionalesService.cancelar(id, userId);
  }
}