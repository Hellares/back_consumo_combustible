import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
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

import {
  CreateAsignacionItinerarioDto,
  FrecuenciaItinerario,
} from './dto/create-asignacion-itinerario.dto';
import { FiltrosAsignacionItinerarioDto } from './dto/filtros-asignacion-itinerario.dto';
import { UpdateAsignacionItinerarioDto } from './dto/update-asignacion-itinerario.dto';
import {
  AsignacionItinerarioResponseDto,
  AsignacionesItinerarioPaginadasResponseDto,
} from './dto/asignacion-itinerario-response.dto';

// Response para desasignar (simple mensaje)
export class DesasignacionResponseDto {
  message: string;
}

import { AsignacionesItinerarioService } from './asignaciones-itinerario.service';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { DesasignarDto } from './dto/desasignar.dto';


@ApiTags('Asignaciones de Itinerario')
@ApiBearerAuth()  // Si usas auth
@Controller('asignaciones-itinerario')
@UsePipes(new ValidationPipe({ transform: true }))  // Valida y transforma DTOs
export class AsignacionesItinerarioController {
  constructor(
    private readonly asignacionesItinerarioService: AsignacionesItinerarioService,
  ) { }

  /**
   * Crear una nueva asignación de unidad a itinerario
   */
  @Post()
  @ApiOperation({ summary: 'Crear una asignación de itinerario' })
  @ApiBody({ type: CreateAsignacionItinerarioDto })
  @ApiResponse({
    status: 201,
    description: 'Asignación creada exitosamente',
    type: AsignacionItinerarioResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Unidad o itinerario no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto: Asignación duplicada' })
  @UseGuards(JwtAuthGuard)  // Descomenta para auth
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAsignacionDto: CreateAsignacionItinerarioDto,
  ): Promise<AsignacionItinerarioResponseDto> {
    return await this.asignacionesItinerarioService.create(createAsignacionDto);
  }

  /**
   * Listar asignaciones con filtros y paginación (soporte cursor-based)
   */
  @Get()
  @ApiOperation({ summary: 'Listar asignaciones con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (modo offset)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Registros por página' })
  @ApiQuery({ name: 'unidadId', required: false, type: Number })
  @ApiQuery({ name: 'itinerarioId', required: false, type: Number })
  @ApiQuery({ name: 'soloActivas', required: false, type: Boolean })
  @ApiQuery({ name: 'soloPermanentes', required: false, type: Boolean })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor para siguiente página' })
  @ApiQuery({ name: 'prevCursor', required: false, type: String, description: 'Cursor para página anterior' })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaciones paginadas',
    type: AsignacionesItinerarioPaginadasResponseDto,
  })
  // @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() filtros: FiltrosAsignacionItinerarioDto,
  ): Promise<AsignacionesItinerarioPaginadasResponseDto> {
    return await this.asignacionesItinerarioService.findAll(filtros);
  }

  /**
   * Obtener una asignación específica por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la asignación', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Asignación encontrada',
    type: AsignacionItinerarioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  // @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AsignacionItinerarioResponseDto> {
    return await this.asignacionesItinerarioService.findOne(id);
  }

  /**
   * Actualizar una asignación existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación' })
  @ApiParam({ name: 'id', description: 'ID de la asignación', type: Number })
  @ApiBody({ type: UpdateAsignacionItinerarioDto })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada',
    type: AsignacionItinerarioResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsignacionDto: UpdateAsignacionItinerarioDto,
    @Req() req: any,
  ): Promise<AsignacionItinerarioResponseDto> {
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    // Opcional: fallback si DTO tiene asignadoPorId, pero prioriza token
    updateAsignacionDto.asignadoPorId = updateAsignacionDto.asignadoPorId || userId;

    return await this.asignacionesItinerarioService.update(id, updateAsignacionDto, userId);
  }

  /**
   * Desasignar una unidad de un itinerario
   */
  @Post(':id/desasignar')
  @ApiOperation({ summary: 'Desasignar una unidad de un itinerario' })
  @ApiParam({ name: 'id', description: 'ID de la asignación', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Asignación desasignada exitosamente',
    type: DesasignacionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No se puede desasignar (ya desasignada o ejecuciones en curso)' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiBearerAuth() // Documenta el Bearer token en Swagger
  @UseGuards(JwtAuthGuard) // Activado: requiere JWT válido
  @HttpCode(HttpStatus.OK)
  async desasignar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any, // Inyecta req para acceder a user del guard
    @Body() dto: DesasignarDto,
  ): Promise<DesasignacionResponseDto> {
    // Extrae userId del token (asumiendo req.user = { id: number, ... } del guard)
    const userId = req.user.id; // Ajusta la clave si tu guard usa 'sub' o similar (e.g., req.user.sub)

    // Si no hay user (edge case, pero guard ya valida), lanza error
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return await this.asignacionesItinerarioService.desasignar(id, userId, dto.motivo);
  }

  @Patch(':id/obsoleta')
  @ApiOperation({ summary: 'Marcar asignación como obsoleta (permanente)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async marcarObsoleta(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Usuario no autenticado');
    return await this.asignacionesItinerarioService.marcarObsoleta(id, userId);
  }

  @Patch(':id/reactivar')
  @ApiOperation({ summary: 'Reactivar una asignación desasignada' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async reactivar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<AsignacionItinerarioResponseDto> {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Usuario no autenticado');
    return await this.asignacionesItinerarioService.reactivar(id, userId);
  }


//   @Get('historial')
// @ApiOperation({ summary: 'Obtener historial de asignaciones como reporte' })
// @ApiQuery({ name: 'itinerarioId', type: Number, required: false })
// @ApiQuery({ name: 'unidadId', type: Number, required: false })
// @ApiQuery({ name: 'accion', enum: ['ASIGNADO', 'DESASIGNADO', 'ACTUALIZADO', 'OBSOLETA', 'REACTIVADO'], required: false })
// @ApiQuery({ name: 'desde', type: String, description: 'YYYY-MM-DD', required: false })
// @ApiQuery({ name: 'hasta', type: String, description: 'YYYY-MM-DD', required: false })
// @UseGuards(JwtAuthGuard)
// async getHistorial(@Query() filtros: any, @Req() req: any): Promise<{ data: any[]; total: number; }> {
//   const userId = req.user.id;
//   // Opcional: filtro por user si quieres (e.g., solo su historial)
//   return await this.asignacionesItinerarioService.getHistorial({ ...filtros, userId }); // Si agregas filtro
// }

}