import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryLicenciaConducirDto {
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
    description: 'Buscar por número de licencia, categoría o datos del usuario',
    example: 'Q12345'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por usuario ID',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Min(1, { message: 'El ID de usuario debe ser mayor a 0' })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría de licencia',
    example: 'A-IIb'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  categoria?: string;

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
    description: 'Filtrar por estado de vigencia',
    example: 'VIGENTE',
    enum: ['VIGENTE', 'PRÓXIMO_VENCIMIENTO', 'VENCIDA']
  })
  @IsOptional()
  @IsString()
  @IsIn(['VIGENTE', 'PRÓXIMO_VENCIMIENTO', 'VENCIDA'], {
    message: 'El estado de vigencia debe ser: VIGENTE, PRÓXIMO_VENCIMIENTO o VENCIDA'
  })
  estadoVigencia?: 'VIGENTE' | 'PRÓXIMO_VENCIMIENTO' | 'VENCIDA';

  @ApiPropertyOptional({
    description: 'Filtrar solo licencias vencidas',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  soloVencidas?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo licencias próximas a vencer',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  proximasVencer?: boolean;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    example: 'fechaExpiracion',
    enum: ['numeroLicencia', 'categoria', 'fechaEmision', 'fechaExpiracion', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  orderBy?: 'numeroLicencia' | 'categoria' | 'fechaEmision' | 'fechaExpiracion' | 'createdAt' | 'updatedAt' = 'fechaExpiracion';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'asc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc' = 'asc';
}