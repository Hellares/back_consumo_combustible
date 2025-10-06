import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request as Req 
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';

import { DetallesAbastecimientoService } from './detalles-abastecimiento.service';
import { QueryDetalleDto } from './dto/query-detalle.dto';
import { DetalleAbastecimientoResponseDto } from './dto/detalle-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { UpdateDetalleDto } from './dto/update-detalles-abastecimiento.dto';
import { ConcluirDetalleDto } from './dto/concluir-detalle.dto';

@ApiTags('Detalles de Abastecimiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('detalles-abastecimiento')
export class DetallesAbastecimientoController {
  constructor(
    private readonly detallesAbastecimientoService: DetallesAbastecimientoService
  ) {}

  @Get()
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Listar detalles de abastecimiento con filtros de ubicación',
    description: `Obtiene lista paginada de detalles de abastecimiento.
    
    **Filtros de Ubicación (jerarquía):**
    - grifoId: Filtra por un grifo específico
    - sedeId: Filtra por todos los grifos de una sede
    - zonaId: Filtra por todos los grifos de una zona
    
    **Nota:** Si se envía grifoId, se ignora sedeId y zonaId.
    Si se envía sedeId, se ignora zonaId.`
  })
  @ApiOkResponse({
    description: 'Lista de detalles obtenida exitosamente',
    type: [DetalleAbastecimientoResponseDto]
  })
  @ApiQuery({ 
    name: 'grifoId', 
    required: false, 
    type: Number,
    example: 1, 
    description: '🏢 Filtrar por grifo específico (prioridad 1)' 
  })
  @ApiQuery({ 
    name: 'sedeId', 
    required: false, 
    type: Number,
    example: 2, 
    description: '🏛️ Filtrar por todos los grifos de una sede (prioridad 2)' 
  })
  @ApiQuery({ 
    name: 'zonaId', 
    required: false, 
    type: Number,
    example: 1, 
    description: '🗺️ Filtrar por todos los grifos de una zona (prioridad 3)' 
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'ticketId', required: false, type: Number, example: 123 })
  @ApiQuery({ name: 'placa', required: false, type: String, example: 'ABC-123' })
  @ApiQuery({ name: 'controladorId', required: false, type: Number, example: 5 })
  @ApiQuery({ name: 'aprobadoPorId', required: false, type: Number, example: 2 })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, example: '2025-12-31' })
  @ApiQuery({ name: 'numeroTicketGrifo', required: false, type: String, example: 'TG-12345' })
  @ApiQuery({ name: 'numeroFactura', required: false, type: String, example: 'F001-00123' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'fechaAprobacion' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  async findAll(
    @Query() queryDto: QueryDetalleDto,
    @Query('grifoId') grifoId?: string,
    @Query('sedeId') sedeId?: string,
    @Query('zonaId') zonaId?: string
  ) {
    // Convertir a número si existen
    const grifoIdNum = grifoId ? Number(grifoId) : undefined;
    const sedeIdNum = sedeId ? Number(sedeId) : undefined;
    const zonaIdNum = zonaId ? Number(zonaId) : undefined;

    return await this.detallesAbastecimientoService.findAll(
      queryDto,
      grifoIdNum,
      zonaIdNum,
      sedeIdNum
    );
  }

  @Get('estadisticas')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'reportes', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Obtener estadísticas de detalles con filtros de ubicación',
    description: 'Obtiene estadísticas agregadas (total, costos, promedios) filtradas por ubicación y fechas'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        totalDetalles: 150,
        costoTotalAcumulado: '45678.50',
        costoPromedioUnidad: '15.25',
        totalUnidadesAbastecidas: 35
      }
    }
  })
  @ApiQuery({ 
    name: 'fechaDesde', 
    required: false, 
    type: String,
    example: '2025-01-01',
    description: 'Fecha desde para filtrar estadísticas (ISO format)' 
  })
  @ApiQuery({ 
    name: 'fechaHasta', 
    required: false, 
    type: String,
    example: '2025-12-31',
    description: 'Fecha hasta para filtrar estadísticas (ISO format)'
  })
  @ApiQuery({ 
    name: 'grifoId', 
    required: false, 
    type: Number,
    example: 1,
    description: 'Filtrar estadísticas por grifo específico' 
  })
  @ApiQuery({ 
    name: 'sedeId', 
    required: false, 
    type: Number,
    example: 2,
    description: 'Filtrar estadísticas por sede' 
  })
  @ApiQuery({ 
    name: 'zonaId', 
    required: false, 
    type: Number,
    example: 1,
    description: 'Filtrar estadísticas por zona' 
  })
  async getEstadisticas(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('grifoId') grifoId?: string,
    @Query('sedeId') sedeId?: string,
    @Query('zonaId') zonaId?: string
  ) {
    const grifoIdNum = grifoId ? Number(grifoId) : undefined;
    const sedeIdNum = sedeId ? Number(sedeId) : undefined;
    const zonaIdNum = zonaId ? Number(zonaId) : undefined;

    return await this.detallesAbastecimientoService.getEstadisticas(
      fechaDesde,
      fechaHasta,
      grifoIdNum,
      zonaIdNum,
      sedeIdNum
    );
  }

  @Get('ticket/:ticketId')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Obtener detalle por Ticket ID',
    description: 'Obtiene el detalle de abastecimiento asociado a un ticket específico'
  })
  @ApiParam({ 
    name: 'ticketId', 
    description: 'ID del ticket de abastecimiento',
    type: Number,
    example: 123 
  })
  @ApiOkResponse({
    description: 'Detalle encontrado exitosamente',
    type: DetalleAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'No existe detalle para el ticket especificado'
  })
  async findByTicketId(
    @Param('ticketId', ParseIntPipe) ticketId: number
  ): Promise<DetalleAbastecimientoResponseDto> {
    return await this.detallesAbastecimientoService.findByTicketId(ticketId);
  }

  @Get(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['read'] })
  @ApiOperation({ 
    summary: 'Obtener detalle por ID',
    description: 'Obtiene un detalle de abastecimiento específico por su ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del detalle de abastecimiento',
    type: Number,
    example: 1 
  })
  @ApiOkResponse({
    description: 'Detalle encontrado exitosamente',
    type: DetalleAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Detalle de abastecimiento no encontrado'
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<DetalleAbastecimientoResponseDto> {
    return await this.detallesAbastecimientoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'abastecimientos', actions: ['update'] })
  @ApiOperation({ 
    summary: 'Actualizar detalle de abastecimiento',
    description: 'Actualiza la información de un detalle de abastecimiento existente. Permite completar datos faltantes del registro.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del detalle de abastecimiento a actualizar',
    type: Number,
    example: 1 
  })
  @ApiOkResponse({
    description: 'Detalle actualizado exitosamente',
    type: DetalleAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Detalle de abastecimiento no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o controlador no encontrado'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetalleDto: UpdateDetalleDto
  ): Promise<DetalleAbastecimientoResponseDto> {
    return await this.detallesAbastecimientoService.update(id, updateDetalleDto);
  }

  @Patch(':id/estado')
  // @UseGuards(JwtPermissionsGuard)
  @ApiOperation({ 
    summary: 'Cambiar estado del detalle (Concluir/Reabrir)',
    description: 'Cambia el estado del detalle entre EN_PROGRESO y CONCLUIDO'
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Estado cambiado exitosamente',
    type: DetalleAbastecimientoResponseDto
  })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() concluirDto: ConcluirDetalleDto,
    @Req() req: any
  ): Promise<DetalleAbastecimientoResponseDto> {
    const usuarioId = req.user?.id;
    return await this.detallesAbastecimientoService.cambiarEstado(
      id, 
      concluirDto.estado, 
      usuarioId
    );
  }
}