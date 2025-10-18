// =============================================
// DTO para crear/enviar ubicación
// =============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNumber, 
  IsString, 
  IsOptional, 
  IsEnum, 
  Min, 
  Max, 
  IsDateString,
  IsObject,
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { GpsProviderType, GpsSignalQuality } from '../interfaces/location-data.interface';

export class CreateLocationDto {
  @ApiProperty({
    description: 'ID de la unidad',
    example: 1,
  })
  @IsInt()
  @Min(1)
  unidadId: number;

  @ApiPropertyOptional({
    description: 'ID de la ejecución de itinerario (si aplica)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  ejecucionId?: number;

  @ApiPropertyOptional({
    description: 'ID del registro de tramo (si aplica)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  registroTramoId?: number;

  // ===== COORDENADAS =====

  @ApiProperty({
    description: 'Latitud en grados decimales',
    example: -8.1116778,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @ApiProperty({
    description: 'Longitud en grados decimales',
    example: -79.0287758,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @ApiPropertyOptional({
    description: 'Altitud en metros sobre el nivel del mar',
    example: 23.5,
  })
  @IsOptional()
  @IsNumber()
  altitud?: number;

  @ApiPropertyOptional({
    description: 'Precisión de la ubicación en metros',
    example: 8.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precision?: number;

  // ===== DATOS DEL VEHÍCULO =====

  @ApiPropertyOptional({
    description: 'Velocidad actual en km/h',
    example: 65.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  velocidad?: number;

  @ApiPropertyOptional({
    description: 'Rumbo en grados (0-360)',
    example: 180.5,
    minimum: 0,
    maximum: 360,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  rumbo?: number;

  @ApiPropertyOptional({
    description: 'Kilometraje actual del vehículo',
    example: 125678.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  kilometraje?: number;

  // ===== TIMESTAMP =====

  @ApiPropertyOptional({
    description: 'Fecha y hora de la ubicación (ISO 8601). Si no se envía, se usa el timestamp del servidor',
    example: '2025-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaHora?: string;

  // ===== PROVEEDOR =====

  @ApiProperty({
    description: 'Tipo de proveedor de GPS',
    enum: GpsProviderType,
    example: GpsProviderType.MOBILE_APP,
  })
  @IsEnum(GpsProviderType)
  proveedor: GpsProviderType;

  @ApiPropertyOptional({
    description: 'ID del dispositivo (IMEI para GPS vehicular, deviceId para app móvil)',
    example: '860585006067195',
  })
  @IsOptional()
  @IsString()
  dispositivoId?: string;

  // ===== ESTADO DEL DISPOSITIVO =====

  @ApiPropertyOptional({
    description: 'Nivel de batería del dispositivo (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  bateria?: number;

  @ApiPropertyOptional({
    description: 'Calidad de señal GPS',
    enum: GpsSignalQuality,
    example: GpsSignalQuality.BUENA,
  })
  @IsOptional()
  @IsEnum(GpsSignalQuality)
  señalGPS?: GpsSignalQuality;

  // ===== INFORMACIÓN DEL DISPOSITIVO (MOBILE_APP) =====

  @ApiPropertyOptional({
    description: 'Versión de la app móvil',
    example: '1.2.3',
  })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({
    description: 'Sistema operativo del dispositivo',
    example: 'Android 13',
  })
  @IsOptional()
  @IsString()
  sistemaOperativo?: string;

  @ApiPropertyOptional({
    description: 'Modelo del dispositivo móvil',
    example: 'Samsung Galaxy S21',
  })
  @IsOptional()
  @IsString()
  modeloDispositivo?: string;

  // ===== METADATA =====

  @ApiPropertyOptional({
    description: 'Metadata adicional flexible (específica por proveedor)',
    example: {
      networkType: '4G',
      isCharging: true,
      isFallback: false,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}