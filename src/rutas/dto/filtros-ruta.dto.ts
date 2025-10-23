// src/rutas/dto/filtros-ruta.dto.ts

import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { EstadoRuta } from './create-ruta.dto';

/**
 * DTO para filtros de búsqueda y paginación de rutas
 */
export class FiltrosRutaDto {
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
    description: 'Filtrar por estado de ruta',
    enum: EstadoRuta,
    example: EstadoRuta.ACTIVA,
  })
  @IsEnum(EstadoRuta)
  @IsOptional()
  estado?: EstadoRuta;

  @ApiPropertyOptional({
    description: 'Buscar por nombre de ruta (búsqueda parcial)',
    example: 'Trujillo',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Buscar por código de ruta',
    example: 'TRU-CHI-01',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad de origen',
    example: 'Trujillo',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  origen?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad de destino',
    example: 'Chiclayo',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  destino?: string;

  @ApiPropertyOptional({
    description: 'Ordenar resultados por campo',
    example: 'nombre',
    enum: ['nombre', 'codigo', 'distanciaKm', 'createdAt'],
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