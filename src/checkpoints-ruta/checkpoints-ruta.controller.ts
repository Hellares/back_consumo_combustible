// src/checkpoints-ruta/checkpoints-ruta.controller.ts

import { JwtAuthGuard } from "@/auth/jwt/jwt-auth.guard";
import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, Request, } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CheckpointsRutaService } from "./checkpoints-ruta.service";
import { CreateCheckpointDto } from "./dto/create-checkpoints-ruta.dto";

@ApiTags('Checkpoints de Ruta')
@ApiBearerAuth()
@Controller('checkpoints-ruta')
export class CheckpointsRutaController {
  constructor(private readonly checkpointsService: CheckpointsRutaService) {}

  /**
   * Registrar checkpoint manual
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Registrar checkpoint de ruta',
    description: `
      Permite al conductor registrar puntos clave durante el viaje:
      - INICIO: Al comenzar el viaje
      - PARADA: En puntos intermedios (peajes, grifo, etc.)
      - LLEGADA: Al llegar al destino
      - EMERGENCIA: En caso de incidente
      
      Útil cuando no hay tracking GPS automático continuo.
    `
  })
  async registrarCheckpoint(
    @Body() dto: CreateCheckpointDto,
    @Request() req: any
  ) {
    const registradoPorId = req.user.id;
    return this.checkpointsService.registrarCheckpoint(dto, registradoPorId);
  }

  /**
   * Obtener checkpoints de un ticket
   */
  @Get('ticket/:ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener checkpoints de un ticket',
    description: 'Lista todos los checkpoints registrados para un ticket específico'
  })
  async getCheckpointsByTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
  ) {
    return this.checkpointsService.getCheckpointsByTicket(ticketId);
  }
}