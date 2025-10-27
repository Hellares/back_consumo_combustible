// src/checkpoints-ruta/checkpoints-ruta.service.ts

import { PrismaService } from "@/database/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCheckpointDto } from "./dto/create-checkpoints-ruta.dto";

@Injectable()
export class CheckpointsRutaService {
  constructor(private prisma: PrismaService) {}

  async registrarCheckpoint(
    dto: CreateCheckpointDto, 
    registradoPorId: number
  ) {
    // Validar que el ticket existe
    const ticket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id: dto.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${dto.ticketId} no encontrado`);
    }

    // Registrar checkpoint
    const checkpoint = await this.prisma.checkpointRuta.create({
      data: {
        ticketId: dto.ticketId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        tipoCheckpoint: dto.tipoCheckpoint,
        descripcion: dto.descripcion,
        observaciones: dto.observaciones,
        kilometrajeActual: dto.kilometrajeActual,
        urlFoto: dto.urlFoto,
        origenRegistro: 'MANUAL',
        registradoPorId,
      },
      include: {
        registradoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          }
        }
      }
    });

    return {
      success: true,
      message: 'Checkpoint registrado exitosamente',
      data: checkpoint,
    };
  }

  async getCheckpointsByTicket(ticketId: number) {
    const checkpoints = await this.prisma.checkpointRuta.findMany({
      where: { ticketId },
      orderBy: { horaRegistro: 'asc' },
      include: {
        registradoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          }
        }
      }
    });

    return {
      success: true,
      data: checkpoints,
      total: checkpoints.length,
    };
  }
}