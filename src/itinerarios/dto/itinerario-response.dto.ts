// src/itinerarios/dto/itinerario-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

// DTO para respuesta de tramo
export class TramoResponseDto {
  @ApiProperty({ description: 'ID del tramo', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID del itinerario', example: 1 })
  itinerarioId: number;

  @ApiProperty({ description: 'ID de la ruta', example: 1 })
  rutaId: number;

  @ApiPropertyOptional({ description: 'Información de la ruta' })
  ruta?: {
    id: number;
    nombre: string;
    codigo: string;
    origen: string;
    destino: string;
    distanciaKm: number | Decimal;
    tiempoEstimadoMinutos: number;
  };

  @ApiProperty({ description: 'Orden del tramo', example: 1 })
  orden: number;

  @ApiProperty({ description: 'Tipo de tramo', example: 'IDA' })
  tipoTramo: string;

  @ApiProperty({ description: 'Ciudad de origen', example: 'Trujillo' })
  ciudadOrigen: string;

  @ApiProperty({ description: 'Ciudad de destino', example: 'Chiclayo' })
  ciudadDestino: string;

  @ApiPropertyOptional({ description: 'Punto de parada' })
  puntoParada?: string;

  @ApiPropertyOptional({ description: 'Dirección de la parada' })
  direccionParada?: string;

  @ApiPropertyOptional({ description: 'Coordenadas GPS' })
  coordenadasParada?: string;

  @ApiPropertyOptional({ description: 'Tiempo de parada en minutos' })
  tiempoParadaMinutos?: number;

  @ApiProperty({ description: 'Es parada obligatoria', example: true })
  esParadaObligatoria: boolean;

  @ApiProperty({ description: 'Requiere inspección', example: false })
  requiereInspeccion: boolean;

  @ApiProperty({ description: 'Requiere abastecimiento', example: true })
  requiereAbastecimiento: boolean;

  @ApiProperty({ description: 'Requiere documentación', example: false })
  requiereDocumentacion: boolean;

  @ApiPropertyOptional({ description: 'Tolerancia en km' })
  toleranciaKm?: number | Decimal;

  @ApiPropertyOptional({ description: 'Tolerancia en minutos' })
  toleranciaTiempo?: number;

  @ApiPropertyOptional({ description: 'Horario preferido' })
  horarioPreferido?: string;

  @ApiPropertyOptional({ description: 'Restricciones climáticas' })
  restriccionesClimaticas?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  observaciones?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}

// DTO para respuesta de itinerario
export class ItinerarioResponseDto {
  @ApiProperty({ description: 'ID del itinerario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del itinerario', example: 'Ruta Norte Completa' })
  nombre: string;

  @ApiProperty({ description: 'Código único', example: 'RNC-001' })
  codigo: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  descripcion?: string;

  @ApiProperty({ description: 'Tipo de itinerario', example: 'CIRCULAR' })
  tipoItinerario: string;

  @ApiProperty({ description: 'Distancia total en km', example: 960.5 })
  distanciaTotal: number | Decimal;

  @ApiProperty({ description: 'Tiempo estimado total en minutos', example: 720 })
  tiempoEstimadoTotal: number;

  @ApiProperty({
    description: 'Días de operación',
    example: ['LUNES', 'MIERCOLES', 'VIERNES'],
    isArray: true,
  })
  diasOperacion: string[];

  @ApiPropertyOptional({ description: 'Hora de inicio habitual', example: '06:00' })
  horaInicioHabitual?: string;

  @ApiPropertyOptional({ description: 'Duración estimada en horas', example: 12.5 })
  duracionEstimadaHoras?: number | Decimal;

  @ApiProperty({ description: 'Estado del itinerario', example: 'ACTIVO' })
  estado: string;

  @ApiProperty({ description: 'Requiere supervisor', example: false })
  requiereSupervisor: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Tramos que componen el itinerario',
    type: [TramoResponseDto],
  })
  tramos?: TramoResponseDto[];

  @ApiPropertyOptional({
    description: 'Cantidad de unidades asignadas',
    example: 3,
  })
  unidadesAsignadas?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de ejecuciones realizadas',
    example: 45,
  })
  ejecucionesRealizadas?: number;
}

// DTO para respuestas paginadas
export class ItinerariosPaginadosResponseDto {
  @ApiProperty({
    description: 'Lista de itinerarios',
    type: [ItinerarioResponseDto],
  })
  data: ItinerarioResponseDto[];

  @ApiProperty({
    description: 'Metadata de paginación',
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