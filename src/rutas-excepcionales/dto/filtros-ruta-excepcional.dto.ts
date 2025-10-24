import { IsOptional, IsInt, IsBoolean, IsDateString, IsString, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrioridadRutaExcepcional } from './create-ruta-excepcional.dto';

/**
 * DTO para filtrar rutas excepcionales
 */
export class FiltrosRutaExcepcionalDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de unidad',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unidadId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ruta',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rutaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar solo rutas activas',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  soloActivas?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por prioridad',
    enum: PrioridadRutaExcepcional,
    example: PrioridadRutaExcepcional.URGENTE,
  })
  @IsOptional()
  @IsEnum(PrioridadRutaExcepcional)
  prioridad?: PrioridadRutaExcepcional;

  @ApiPropertyOptional({
    description: 'Fecha desde (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (YYYY-MM-DD)',
    example: '2025-10-31',
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Buscar por motivo de asignación',
    example: 'EMERGENCIA',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  motivoAsignacion?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Registros por página',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}