// =============================================
// src/tickets_abastecimiento/tickets_abastecimiento.controller.ts
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
  HttpCode,
  Request,
  ForbiddenException,
  BadRequestException
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
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { TicketsAbastecimientoService } from './tickets_abastecimiento.service';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { TicketAbastecimientoResponseDto } from './dto/ticket-response.dto';

// Guards de autenticación y permisos
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtPermissionsGuard } from '../auth/jwt/jwt-permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateTicketAbastecimientoDto } from './dto/create-tickets_abastecimiento.dto';
import { UpdateTicketAbastecimientoDto } from './dto/update-tickets_abastecimiento.dto';
import { JwtRolesGuard } from '@/auth/jwt/jwt-roles.guard';
import { HasRoles } from '@/auth/jwt/has-roles';
import { JwtRole } from '@/auth/jwt/jwt-role';
// import { HasRoles } from 'src/auth/jwt/has-roles';
// import { JwtRole } from 'src/auth/jwt/jwt-role';
// import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';

@ApiTags('Tickets de Abastecimiento')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('tickets-abastecimiento')
export class TicketsAbastecimientoController {
  constructor(private readonly ticketsService: TicketsAbastecimientoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo ticket de abastecimiento',
    description: 'Registra una nueva solicitud de abastecimiento de combustible en el sistema con validaciones completas'
  })
  @ApiCreatedResponse({
    description: 'Ticket creado exitosamente',
    type: TicketAbastecimientoResponseDto
  })
  @ApiConflictResponse({
    description: 'Ya existe un ticket con el mismo precinto o referencias inválidas'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, referencias inactivas o inconsistencias en kilometraje'
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token JWT requerido'
  })
  async create(
    @Body() createTicketDto: CreateTicketAbastecimientoDto,
    @Request() req: any
  ): Promise<TicketAbastecimientoResponseDto> {
    const solicitadoPorId = req.user.id;
    return this.ticketsService.create(createTicketDto, solicitadoPorId);
  }

  @Get()
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['read'] })
  @ApiOperation({
    summary: 'Listar tickets de abastecimiento',
    description: 'Obtiene una lista paginada de tickets con filtros avanzados y búsqueda'
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
    description: 'Cantidad de registros por página (por defecto: 20, máximo: 100)',
    example: 20
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Texto de búsqueda (número de ticket, placa, conductor)',
    example: 'TK-2024-01-000001'
  })
  @ApiQuery({
    name: 'unidadId',
    required: false,
    description: 'Filtrar por ID de unidad',
    example: 5
  })
  @ApiQuery({
    name: 'conductorId',
    required: false,
    description: 'Filtrar por ID de conductor',
    example: 3
  })
  @ApiQuery({
    name: 'grifoId',
    required: false,
    description: 'Filtrar por ID de grifo',
    example: 1
  })
  @ApiQuery({
    name: 'estadoId',
    required: false,
    description: 'Filtrar por ID de estado (1=SOLICITADO, 2=APROBADO, 3=RECHAZADO)',
    example: 1
  })
  @ApiQuery({
    name: 'tipoCombustible',
    required: false,
    description: 'Filtrar por tipo de combustible',
    example: 'DIESEL'
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Fecha de inicio del rango de búsqueda (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fecha de fin del rango de búsqueda (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @ApiQuery({
    name: 'solosPendientes',
    required: false,
    description: 'Filtrar solo tickets pendientes de aprobación',
    example: true
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo por el cual ordenar los resultados',
    enum: ['fecha', 'numeroTicket', 'unidad', 'conductor', 'cantidad', 'estado']
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc']
  })
  @ApiOkResponse({
    description: 'Lista de tickets obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tickets obtenidos exitosamente' },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/TicketAbastecimientoResponseDto' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 150 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 20 },
                totalPages: { type: 'number', example: 8 },
                hasNextPage: { type: 'boolean', example: true },
                hasPreviousPage: { type: 'boolean', example: false }
              }
            }
          }
        }
      }
    }
  })
  async findAll(@Query() queryDto: QueryTicketDto) {
    return this.ticketsService.findAll(queryDto);
  }

  @Get('estadisticas')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener estadísticas de tickets',
    description: 'Retorna estadísticas generales de todos los tickets de abastecimiento'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Estadísticas obtenidas exitosamente' },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            pendientes: { type: 'number', example: 25 },
            aprobados: { type: 'number', example: 120 },
            rechazados: { type: 'number', example: 5 },
            hoy: { type: 'number', example: 8 },
            porcentajeAprobacion: { type: 'number', example: 80.0 }
          }
        }
      }
    }
  })
  async getEstadisticas() {
    return this.ticketsService.getEstadisticas();
  }

  @Get('unidad/:unidadId')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener tickets por unidad',
    description: 'Retorna los últimos tickets de una unidad específica'
  })
  @ApiParam({
    name: 'unidadId',
    description: 'ID de la unidad',
    example: 5
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de tickets a retornar (por defecto: 10)',
    example: 10
  })
  @ApiOkResponse({
    description: 'Tickets de la unidad obtenidos exitosamente',
    type: [TicketAbastecimientoResponseDto]
  })
  @ApiNotFoundResponse({
    description: 'Unidad no encontrada'
  })
  async findByUnidad(
    @Param('unidadId', ParseIntPipe) unidadId: number,
  ): Promise<TicketAbastecimientoResponseDto[]> {
    return this.ticketsService.findByUnidad(unidadId);
  }

  @Get('conductor/:conductorId')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener tickets por conductor',
    description: 'Retorna los últimos tickets de un conductor específico'
  })
  @ApiParam({
    name: 'conductorId',
    description: 'ID del conductor',
    example: 3
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de tickets a retornar (por defecto: 10)',
    example: 10
  })
  @ApiOkResponse({
    description: 'Tickets del conductor obtenidos exitosamente',
    type: [TicketAbastecimientoResponseDto]
  })
  @ApiNotFoundResponse({
    description: 'Conductor no encontrado'
  })
  async findByConductor(
    @Param('conductorId', ParseIntPipe) conductorId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<TicketAbastecimientoResponseDto[]> {
    return this.ticketsService.findByConductor(conductorId, limit);
  }

  @Get(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['read'] })
  @ApiOperation({
    summary: 'Obtener ticket por ID',
    description: 'Retorna un ticket específico con todos sus detalles'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ticket',
    example: 1
  })
  @ApiOkResponse({
    description: 'Ticket encontrado exitosamente',
    type: TicketAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['update'] })
  @ApiOperation({
    summary: 'Actualizar ticket de abastecimiento',
    description: 'Actualiza un ticket existente. Solo permitido si está en estado SOLICITADO y solo por el solicitante'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ticket a actualizar',
    example: 1
  })
  @ApiOkResponse({
    description: 'Ticket actualizado exitosamente',
    type: TicketAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'No se puede modificar un ticket que no está en estado SOLICITADO'
  })
  @ApiForbiddenResponse({
    description: 'Solo el solicitante puede modificar este ticket'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketAbastecimientoDto,
    @Request() req: any
  ): Promise<TicketAbastecimientoResponseDto> {
    const userId = req.user.id;
    return this.ticketsService.update(id, updateTicketDto, userId);
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['approve'] })
  @ApiOperation({
    summary: 'Aprobar ticket de abastecimiento',
    description: 'Aprueba un ticket cambiando su estado a APROBADO y creando el detalle de abastecimiento'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ticket a aprobar',
    example: 1
  })
  @ApiOkResponse({
    description: 'Ticket aprobado exitosamente',
    type: TicketAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'No se puede aprobar un ticket que no está en estado SOLICITADO'
  })
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TicketAbastecimientoResponseDto> {
    const aprobadoPorId = req.user.id;
    return this.ticketsService.aprobar(id, aprobadoPorId);
  }

  @Patch(':id/rechazar')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  @ApiOperation({
    summary: 'Rechazar ticket de abastecimiento',
    description: 'Rechaza un ticket cambiando su estado a RECHAZADO con motivo obligatorio'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ticket a rechazar',
    example: 1
  })
  @ApiOkResponse({
    description: 'Ticket rechazado exitosamente',
    type: TicketAbastecimientoResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'No se puede rechazar un ticket que no está en estado SOLICITADO'
  })
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivoRechazo') motivoRechazo: string,
    @Request() req: any
  ): Promise<TicketAbastecimientoResponseDto> {
    if (!motivoRechazo || motivoRechazo.trim().length === 0) {
      throw new BadRequestException('El motivo del rechazo es obligatorio');
    }
    if (motivoRechazo.length > 500) {
      throw new BadRequestException('El motivo no puede exceder 500 caracteres');
    }
    const rechazadoPorId = req.user.id;

    return this.ticketsService.rechazar(id, motivoRechazo.trim(), rechazadoPorId);
  }

  @Delete(':id')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['delete'] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar ticket de abastecimiento',
    description: 'Elimina un ticket existente. Solo permitido si está en estado SOLICITADO y solo por el solicitante'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ticket a eliminar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Ticket eliminado exitosamente'
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  @ApiBadRequestResponse({
    description: 'No se puede eliminar un ticket que no está en estado SOLICITADO'
  })
  @ApiForbiddenResponse({
    description: 'Solo el solicitante puede eliminar este ticket'
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<void> {
    const userId = req.user.id;
    return this.ticketsService.remove(id, userId);
  }

  // ========== ENDPOINTS ADICIONALES PARA ADMINISTRACIÓN ==========

  @Get('admin/pendientes')
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['approve'] })
  @ApiOperation({
    summary: 'Obtener tickets pendientes de aprobación',
    description: 'Retorna todos los tickets en estado SOLICITADO para revisión de supervisores'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de tickets a retornar (por defecto: 50)',
    example: 50
  })
  @ApiOkResponse({
    description: 'Tickets pendientes obtenidos exitosamente',
    type: [TicketAbastecimientoResponseDto]
  })
  async getTicketsPendientes(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50
  ) {
    const queryDto: QueryTicketDto = {
      page: 1,
      limit: Math.min(limit, 100),
      solosPendientes: true,
      orderBy: 'fecha' as any,
      orderDirection: 'asc' as any
    };
    
    const result = await this.ticketsService.findAll(queryDto);
    return result.data; // Retornar solo los tickets, no la estructura paginada
  }

  @Post('admin/aprobar-lote')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  // @UseGuards(JwtPermissionsGuard)
  // @Permissions({ resource: 'tickets_abastecimiento', actions: ['approve'] })
  @ApiOperation({
    summary: 'Aprobar múltiples tickets en lote',
    description: 'Aprueba múltiples tickets de una vez para optimizar el proceso de supervisión'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tickets procesados exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tickets procesados exitosamente' },
        data: {
          type: 'object',
          properties: {
            aprobados: { type: 'number', example: 8 },
            errores: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ticketId: { type: 'number', example: 15 },
                  error: { type: 'string', example: 'Ticket no encontrado' }
                }
              }
            }
          }
        }
      }
    }
  })
  async aprobarLote(
    @Body('ids') ids: number[],
  @Request() req: any
  ) {
    const aprobadoPorId = req.user.id;
    // Aceptar tanto ticketIds como ids para mayor flexibilidad
    

    // Validaciones
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestException('Debe proporcionar al menos un ID de ticket');
  }

  if (ids.length > 20) {
    throw new BadRequestException('No se pueden aprobar más de 20 tickets a la vez');
  }
    const resultados = {
    exitosos: 0,
    fallidos: 0,
    errores: []
  };

    for (const ticketId of ids) {
    try {
      await this.ticketsService.aprobar(ticketId, aprobadoPorId);
      resultados.exitosos++;
    } catch (error) {
      resultados.fallidos++;
      resultados.errores.push({
        ticketId,
        error: error.message
      });
    }
  }

    return resultados;
  }

  @Get('mis-tickets')
  @ApiOperation({
    summary: 'Obtener mis tickets solicitados',
    description: 'Retorna todos los tickets solicitados por el usuario autenticado'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de tickets a retornar (por defecto: 20)',
    example: 20
  })
  @ApiQuery({
    name: 'estadoId',
    required: false,
    description: 'Filtrar por estado específico',
    example: 1
  })
  @ApiOkResponse({
    description: 'Mis tickets obtenidos exitosamente',
    type: [TicketAbastecimientoResponseDto]
  })
  async getMisTickets(
    @Request() req: any,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('estadoId', new ParseIntPipe({ optional: true })) estadoId?: number
  ) {
    const solicitadoPorId = req.user.id;
    
    const queryDto: QueryTicketDto = {
      page: 1,
      limit: Math.min(limit, 100),
      estadoId,
      orderBy: 'fecha' as any,
      orderDirection: 'desc' as any
    };

    // Crear una consulta personalizada para mis tickets
    const tickets = await this.ticketsService.findAll({
      ...queryDto,
      // Aquí necesitaríamos extender el service para filtrar por solicitadoPorId
      // Por ahora usamos el método existente y filtramos en el controller
    });

    // Filtrar solo los tickets del usuario (idealmente esto debería estar en el service)
    const misTickets = tickets.data.filter(
      (ticket: any) => ticket.solicitadoPor.id === solicitadoPorId
    );

    return misTickets;
  }

  @Get('estado/:estadoNombre')
  async findByEstado(
  @Param('estadoNombre') estadoNombre: string,
  @Query() queryDto: QueryTicketDto
  ) {
    return this.ticketsService.findByEstado(estadoNombre, queryDto);
  }
}