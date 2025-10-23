// src/rutas/dto/ruta-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoRuta } from './create-ruta.dto';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * DTO para las respuestas de rutas.
 * Define la estructura de datos que se enviará al cliente.
 */
export class RutaResponseDto {
  @ApiProperty({
    description: 'ID único de la ruta',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la ruta',
    example: 'Trujillo - Chiclayo',
  })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código único de la ruta',
    example: 'TRU-CHI-01',
  })
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la ruta',
    example: 'Ruta directa por Panamericana Norte',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Ciudad o punto de origen',
    example: 'Trujillo',
  })
  origen?: string;

  @ApiPropertyOptional({
    description: 'Ciudad o punto de destino',
    example: 'Chiclayo',
  })
  destino?: string;

  @ApiPropertyOptional({
    description: 'Distancia en kilómetros',
    example: 210.5,
  })
  distanciaKm?: number | Decimal;

  @ApiPropertyOptional({
    description: 'Tiempo estimado en minutos',
    example: 180,
  })
  tiempoEstimadoMinutos?: number;

  @ApiProperty({
    description: 'Estado de la ruta',
    enum: EstadoRuta,
    example: EstadoRuta.ACTIVA,
  })
  estado: EstadoRuta;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-10-22T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-10-22T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Cantidad de asignaciones excepcionales activas',
    example: 3,
  })
  asignacionesActivas?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de veces que esta ruta se usa en itinerarios',
    example: 5,
  })
  usosEnItinerarios?: number;
}

/**
 * DTO para respuestas paginadas de rutas
 */
export class RutasPaginadasResponseDto {
  @ApiProperty({
    description: 'Lista de rutas',
    type: [RutaResponseDto],
  })
  data: RutaResponseDto[];

  @ApiProperty({
    description: 'Metadata de paginación',
    example: {
      total: 50,
      page: 1,
      pageSize: 10,
      totalPages: 5,
      offset: 0,
      limit: 10,
      nextOffset: 10,
      prevOffset: null,
      hasNext: true,
      hasPrevious: false,
    },
  })
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    offset: number;
    limit: number;
    nextOffset: number | null;
    prevOffset: number | null;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}