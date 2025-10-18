// =============================================
// DTOs de respuesta
// =============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GpsProviderType, GpsSignalQuality } from '../interfaces/location-data.interface';

/**
 * DTO para respuesta de ubicación individual
 */
export class LocationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  unidadId: number;

  @ApiProperty({ example: -8.1116778 })
  latitud: number;

  @ApiProperty({ example: -79.0287758 })
  longitud: number;

  @ApiPropertyOptional({ example: 23.5 })
  altitud?: number;

  @ApiPropertyOptional({ example: 8.5 })
  precision?: number;

  @ApiPropertyOptional({ example: 65.5 })
  velocidad?: number;

  @ApiPropertyOptional({ example: 180.5 })
  rumbo?: number;

  @ApiPropertyOptional({ example: 125678.5 })
  kilometraje?: number;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  fechaHora: string;

  @ApiProperty({ enum: GpsProviderType, example: GpsProviderType.MOBILE_APP })
  proveedor: GpsProviderType;

  @ApiPropertyOptional({ example: '860585006067195' })
  dispositivoId?: string;

  @ApiPropertyOptional({ example: 85 })
  bateria?: number;

  @ApiPropertyOptional({ enum: GpsSignalQuality, example: GpsSignalQuality.BUENA })
  señalGPS?: GpsSignalQuality;

  @ApiPropertyOptional({ example: '1.2.3' })
  appVersion?: string;

  @ApiPropertyOptional({ example: 'Android 13' })
  sistemaOperativo?: string;

  @ApiPropertyOptional({ example: 'Samsung Galaxy S21' })
  modeloDispositivo?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: string;
}

/**
 * DTO para respuesta de ubicación actual de unidad
 */
export class CurrentLocationResponseDto {
  @ApiProperty({ example: 1 })
  unidadId: number;

  @ApiProperty({ example: 'ABC-123' })
  placa: string;

  @ApiPropertyOptional({ type: LocationResponseDto })
  ultimaUbicacion: LocationResponseDto | null;

  @ApiProperty({ example: 45, description: 'Segundos desde última actualización' })
  tiempoTranscurrido: number;

  @ApiProperty({ example: 'ACTIVO', enum: ['ACTIVO', 'DETENIDO', 'INACTIVO'] })
  estado: string;

  @ApiPropertyOptional({
    description: 'Información del conductor',
    example: { id: 1, nombreCompleto: 'Juan Pérez' },
  })
  conductor?: {
    id: number;
    nombreCompleto: string;
  };
}

/**
 * DTO para respuesta de lista de ubicaciones actuales
 */
export class CurrentLocationsListResponseDto {
  @ApiProperty({ type: [CurrentLocationResponseDto] })
  data: CurrentLocationResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 8 })
  activas: number;

  @ApiProperty({ example: 2 })
  inactivas: number;
}

/**
 * DTO para respuesta paginada de historial
 */
export class LocationHistoryResponseDto {
  @ApiProperty({ type: [LocationResponseDto] })
  data: LocationResponseDto[];

  @ApiProperty({
    example: {
      total: 1500,
      page: 1,
      pageSize: 50,
      totalPages: 30,
    },
  })
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}