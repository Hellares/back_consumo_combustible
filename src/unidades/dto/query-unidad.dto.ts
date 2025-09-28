import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryUnidadDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Buscar por placa, marca, modelo o conductor',
    example: 'ABC'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por conductor ID',
    example: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del conductor debe ser un número entero' })
  @Min(1, { message: 'El ID del conductor debe ser mayor a 0' })
  conductorOperadorId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por zona de operación ID',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de zona debe ser un número entero' })
  @Min(1, { message: 'El ID de zona debe ser mayor a 0' })
  zonaOperacionId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por marca',
    example: 'Volvo'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  marca?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de combustible',
    example: 'DIESEL',
    enum: ['DIESEL', 'GASOLINA', 'GLP', 'GNV', 'ELECTRICO', 'HIBRIDO']
  })
  @IsOptional()
  @IsString()
  @IsIn(['DIESEL', 'GASOLINA', 'GLP', 'GNV', 'ELECTRICO', 'HIBRIDO'])
  tipoCombustible?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado operativo',
    example: 'OPERATIVO',
    enum: ['OPERATIVO', 'MANTENIMIENTO', 'AVERIADO', 'FUERA_SERVICIO', 'EN_REVISION']
  })
  @IsOptional()
  @IsString()
  @IsIn(['OPERATIVO', 'MANTENIMIENTO', 'AVERIADO', 'FUERA_SERVICIO', 'EN_REVISION'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo unidades sin conductor asignado',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  sinConductor?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo unidades que pueden operar',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  soloOperativas?: boolean;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    example: 'placa',
    enum: ['placa', 'marca', 'modelo', 'anio', 'estado', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  orderBy?: 'placa' | 'marca' | 'modelo' | 'anio' | 'estado' | 'createdAt' | 'updatedAt' = 'placa';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'asc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc' = 'asc';
}