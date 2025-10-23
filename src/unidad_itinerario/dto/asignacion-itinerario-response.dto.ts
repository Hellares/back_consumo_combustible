import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para respuesta de asignación de itinerario
 */
export class AsignacionItinerarioResponseDto {
  @ApiProperty({ description: 'ID de la asignación', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID de la unidad', example: 25 })
  unidadId: number;

  @ApiPropertyOptional({ description: 'Información de la unidad' })
  unidad?: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
    tipoCombustible: string;
  };

  @ApiProperty({ description: 'ID del itinerario', example: 1 })
  itinerarioId: number;

  @ApiPropertyOptional({ description: 'Información del itinerario' })
  itinerario?: {
    id: number;
    nombre: string;
    codigo: string;
    tipoItinerario: string;
    distanciaTotal: number;
    diasOperacion: string[];
  };

  @ApiProperty({ description: 'Fecha de asignación' })
  fechaAsignacion: Date;

  @ApiPropertyOptional({ description: 'Fecha de desasignación' })
  fechaDesasignacion?: Date;

  @ApiProperty({ 
    description: 'Frecuencia de operación',
    example: 'PERSONALIZADO'
  })
  frecuencia: string;

  @ApiProperty({
    description: 'Días específicos de operación',
    example: ['LUNES', 'MIERCOLES', 'VIERNES'],
    isArray: true,
  })
  diasEspecificos: string[];

  @ApiPropertyOptional({ 
    description: 'Hora de inicio personalizada',
    example: '06:00'
  })
  horaInicioPersonalizada?: string;

  @ApiProperty({ 
    description: 'Si es asignación permanente',
    example: true
  })
  esPermanente: boolean;

  @ApiPropertyOptional({ description: 'ID de quien asignó', example: 5 })
  asignadoPorId?: number;

  @ApiPropertyOptional({ description: 'Información de quien asignó' })
  asignadoPor?: {
    id: number;
    nombres: string;
    apellidos: string;
  };

  @ApiPropertyOptional({ description: 'Motivo del cambio' })
  motivoCambio?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  observaciones?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Cantidad de ejecuciones realizadas',
    example: 15,
  })
  ejecucionesRealizadas?: number;

  @ApiPropertyOptional({
    description: 'Estado actual (activa o desasignada)',
    example: 'ACTIVA',
  })
  estadoAsignacion?: string;
}

/**
 * DTO para respuestas paginadas
 */
export class AsignacionesItinerarioPaginadasResponseDto {
  @ApiProperty({
    description: 'Lista de asignaciones',
    type: [AsignacionItinerarioResponseDto],
  })
  data: AsignacionItinerarioResponseDto[];

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
    nextCursor: string | null;
    previousCursor: string | null;
    hasNext: boolean;
    hasPrevious: boolean;
    isFallback: boolean;
  };
}