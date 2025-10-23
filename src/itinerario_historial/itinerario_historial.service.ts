import { Injectable } from '@nestjs/common';
import { ItinerarioHistorial, Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ItinerarioHistorialService {
  constructor(private prisma: PrismaService) { }
  
  async getHistorial(
  filtros: { itinerarioId?: number; unidadId?: number; accion?: string; desde?: Date; hasta?: Date; },
): Promise<{ data: ItinerarioHistorial[]; total: number; }> {
  const where: Prisma.ItinerarioHistorialWhereInput = {
    ...(filtros.itinerarioId && { itinerarioId: filtros.itinerarioId }),
    ...(filtros.unidadId && { unidadId: filtros.unidadId }),
    ...(filtros.accion && { accion: filtros.accion }),
    fechaCambio: { gte: filtros.desde, lte: filtros.hasta },
  };

  const [historial, total] = await Promise.all([
    this.prisma.itinerarioHistorial.findMany({
      where,
      include: { itinerario: true, unidad: true, modificadoPor: { select: { id: true, nombres: true, apellidos: true } } },
      orderBy: { fechaCambio: 'desc' },
    }),
    this.prisma.itinerarioHistorial.count({ where }),
  ]);

  return { data: historial, total };
}
}
