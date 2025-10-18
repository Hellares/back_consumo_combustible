// =============================================
// DTOs para consultas de ubicación
// =============================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsInt, 
  Min, 
  Max, 
  IsDateString, 
  IsEnum,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';
import { GpsProviderType } from '../interfaces/location-data.interface';

/**
 * DTO para consultar historial de ubicaciones
 */
export class QueryLocationHistoryDto {
  @ApiPropertyOptional({
    description: 'ID de la unidad',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  unidadId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO 8601)',
    example: '2025-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor',
    enum: GpsProviderType,
  })
  @IsOptional()
  @IsEnum(GpsProviderType)
  proveedor?: GpsProviderType;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 50,
    minimum: 1,
    maximum: 1000,
    default: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  pageSize?: number = 50;
}

/**
 * DTO para consultar ubicaciones actuales de múltiples unidades
 */
export class QueryCurrentLocationsDto {
  @ApiPropertyOptional({
    description: 'IDs de las unidades a consultar',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  unidadesIds?: number[];

  @ApiPropertyOptional({
    description: 'ID de la zona',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  zonaId?: number;

  @ApiPropertyOptional({
    description: 'Solo unidades activas (con señal reciente)',
    example: true,
    default: false,
  })
  @IsOptional()
  soloActivas?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor',
    enum: GpsProviderType,
  })
  @IsOptional()
  @IsEnum(GpsProviderType)
  proveedor?: GpsProviderType;
}