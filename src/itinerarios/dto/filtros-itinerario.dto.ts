// src/itinerarios/dto/filtros-itinerario.dto.ts

import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { EstadoItinerario, TipoItinerario } from './create-itinerario.dto';

/**
 * DTO para filtros de búsqueda y paginación de itinerarios
 */
export class FiltrosItinerarioDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 10,
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoItinerario,
    example: EstadoItinerario.ACTIVO,
  })
  @IsEnum(EstadoItinerario)
  @IsOptional()
  estado?: EstadoItinerario;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de itinerario',
    enum: TipoItinerario,
    example: TipoItinerario.CIRCULAR,
  })
  @IsEnum(TipoItinerario)
  @IsOptional()
  tipoItinerario?: TipoItinerario;

  @ApiPropertyOptional({
    description: 'Buscar por nombre (búsqueda parcial)',
    example: 'Ruta Norte',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Buscar por código',
    example: 'RNC-001',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'nombre',
    enum: ['nombre', 'codigo', 'distanciaTotal', 'createdAt'],
  })
  @IsString()
  @IsOptional()
  orderBy?: string = 'nombre';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  orderDirection?: 'asc' | 'desc' = 'asc';
}