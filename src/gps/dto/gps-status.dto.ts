// =============================================
// DTOs para estado y estadísticas
// =============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GpsProviderType } from '../interfaces/location-data.interface';

/**
 * DTO para estado de tracking de unidad
 */
export class TrackingStatusDto {
  @ApiProperty({ example: 1 })
  unidadId: number;

  @ApiProperty({ example: true })
  isOnline: boolean;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  lastUpdate: string;

  @ApiProperty({ enum: GpsProviderType, example: GpsProviderType.MOBILE_APP })
  proveedor: GpsProviderType;

  @ApiProperty({ example: 2.5, description: 'Minutos desde última actualización' })
  tiempoInactivoMinutos: number;

  @ApiPropertyOptional({ example: { latitud: -8.1116778, longitud: -79.0287758 } })
  ultimaUbicacion?: {
    latitud: number;
    longitud: number;
    velocidad?: number;
  };
}

/**
 * DTO para estadísticas generales de tracking
 */
export class TrackingStatsDto {
  @ApiProperty({ example: 50 })
  totalUnidades: number;

  @ApiProperty({ example: 42 })
  unidadesActivas: number;

  @ApiProperty({ example: 8 })
  unidadesInactivas: number;

  @ApiProperty({ example: 35.5, description: 'Porcentaje con GPS vehicular' })
  porcentajeGpsDevice: number;

  @ApiProperty({ example: 64.5, description: 'Porcentaje con GPS móvil' })
  porcentajeMobileApp: number;

  @ApiProperty({ example: 12.8, description: 'Precisión promedio en metros' })
  precisionPromedio: number;

  @ApiProperty({ example: '2025-01-15T10:35:00Z' })
  timestamp: string;
}