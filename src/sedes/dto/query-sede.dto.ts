import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QuerySedeDto {
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
    description: 'Buscar por nombre, código o dirección',
    example: 'Central'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por zona ID',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de zona debe ser un número entero' })
  @Min(1, { message: 'El ID de zona debe ser mayor a 0' })
  zonaId?: number;

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
    description: 'Ordenar por campo',
    example: 'nombre',
    enum: ['nombre', 'codigo', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  orderBy?: 'nombre' | 'codigo' | 'createdAt' | 'updatedAt' = 'nombre';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'asc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc' = 'asc';
}