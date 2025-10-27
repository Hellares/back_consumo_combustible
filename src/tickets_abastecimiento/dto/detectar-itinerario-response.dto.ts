import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO para información básica de una ruta detectada
 */
export class RutaDetectadaDto {
  @ApiProperty({ description: 'ID de la ruta', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre de la ruta', example: 'Lima - Arequipa' })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({ description: 'Código de la ruta', example: 'RT-001' })
  @Expose()
  codigo?: string;

  @ApiPropertyOptional({ description: 'Origen', example: 'Lima' })
  @Expose()
  origen?: string;

  @ApiPropertyOptional({ description: 'Destino', example: 'Arequipa' })
  @Expose()
  destino?: string;

  @ApiPropertyOptional({ description: 'Distancia en km', example: 1025.5 })
  @Expose()
  distanciaKm?: number;
}

/**
 * DTO para información básica de un itinerario detectado
 */
export class ItinerarioDetectadoInfoDto {
  @ApiProperty({ description: 'ID del itinerario', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del itinerario', example: 'Ruta Norte Completa' })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Código del itinerario', example: 'RNC-001' })
  @Expose()
  codigo: string;

  @ApiProperty({ description: 'Tipo de itinerario', example: 'CIRCULAR' })
  @Expose()
  tipoItinerario: string;

  @ApiProperty({ description: 'Distancia total en km', example: 960.5 })
  @Expose()
  distanciaTotal: number;

  @ApiProperty({ 
    description: 'Días de operación', 
    example: ['LUNES', 'MIERCOLES', 'VIERNES'],
    isArray: true 
  })
  @Expose()
  diasOperacion: string[];

  @ApiPropertyOptional({ 
    description: 'Hora de inicio habitual', 
    example: '06:00' 
  })
  @Expose()
  horaInicioHabitual?: string;
}

/**
 * DTO principal de respuesta para detección de itinerario/ruta
 */
export class ItinerarioDetectadoResponseDto {
  @ApiPropertyOptional({ 
    description: 'Información del itinerario detectado',
    type: ItinerarioDetectadoInfoDto 
  })
  @Expose()
  @Type(() => ItinerarioDetectadoInfoDto)
  itinerario?: ItinerarioDetectadoInfoDto;

  @ApiPropertyOptional({ 
    description: 'Información de la ruta detectada (si es ruta simple)',
    type: RutaDetectadaDto 
  })
  @Expose()
  @Type(() => RutaDetectadaDto)
  ruta?: RutaDetectadaDto;

  @ApiPropertyOptional({ 
    description: 'ID de la ejecución activa (si existe)',
    example: 15 
  })
  @Expose()
  ejecucionItinerarioId?: number;

  @ApiProperty({ 
    description: 'Origen de la detección',
    enum: ['EJECUCION_ACTIVA', 'ITINERARIO_PERMANENTE', 'RUTA_EXCEPCIONAL', 'NINGUNO'],
    example: 'ITINERARIO_PERMANENTE'
  })
  @Expose()
  origen: 'EJECUCION_ACTIVA' | 'ITINERARIO_PERMANENTE' | 'RUTA_EXCEPCIONAL' | 'NINGUNO';

  @ApiProperty({ 
    description: 'Mensaje descriptivo de la detección',
    example: 'Itinerario permanente: "Ruta Norte Completa" opera los LUNES'
  })
  @Expose()
  mensaje: string;

  @ApiProperty({ 
    description: 'Indica si el controlador puede modificar la asignación',
    example: true 
  })
  @Expose()
  puedeModificar: boolean;

  @ApiProperty({ 
    description: 'Indica si se detectó alguna asignación',
    example: true 
  })
  @Expose()
  detectado: boolean;

  @ApiPropertyOptional({ 
    description: 'Día de la semana para la detección',
    example: 'LUNES' 
  })
  @Expose()
  diaSemana?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha usada para la detección',
    example: '2024-01-15'
  })
  @Expose()
  fecha?: string;
}