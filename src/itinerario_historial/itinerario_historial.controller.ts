import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ItinerarioHistorialService } from './itinerario_historial.service';
import { CreateItinerarioHistorialDto } from './dto/create-itinerario_historial.dto';
import { UpdateItinerarioHistorialDto } from './dto/update-itinerario_historial.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';

@Controller('itinerario-historial')
export class ItinerarioHistorialController {
  constructor(private readonly itinerarioHistorialService: ItinerarioHistorialService) {}

  @Get('historial')
@ApiOperation({ summary: 'Obtener historial de asignaciones como reporte' })
@ApiQuery({ name: 'itinerarioId', type: Number, required: false })
@ApiQuery({ name: 'unidadId', type: Number, required: false })
@ApiQuery({ name: 'accion', enum: ['ASIGNADO', 'DESASIGNADO', 'ACTUALIZADO', 'OBSOLETA', 'REACTIVADO'], required: false })
@ApiQuery({ name: 'desde', type: String, description: 'YYYY-MM-DD', required: false })
@ApiQuery({ name: 'hasta', type: String, description: 'YYYY-MM-DD', required: false })
@UseGuards(JwtAuthGuard)
async getHistorial(@Query() filtros: any, @Req() req: any): Promise<{ data: any[]; total: number; }> {
  const userId = req.user.id;
  // Opcional: filtro por user si quieres (e.g., solo su historial)
  return await this.itinerarioHistorialService.getHistorial({ ...filtros, userId }); // Si agregas filtro
}
}
