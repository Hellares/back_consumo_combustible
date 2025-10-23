
import { IsOptional, IsInt, IsBoolean, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para filtros de búsqueda de asignaciones de itinerario
 */
export class FiltrosAsignacionItinerarioDto {
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
    description: 'Filtrar por ID de unidad',
    example: 25,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  unidadId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de itinerario',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  itinerarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar solo asignaciones activas (no desasignadas)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  soloActivas?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo asignaciones permanentes',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  soloPermanentes?: boolean;

  @ApiPropertyOptional({
    description: 'Cursor para paginación continua (base64 del último ID)',
    example: 'MTIzNDU2',  // Ejemplo: base64 de "123456"
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Cursor para página anterior (base64 del primer ID de la página actual)',
    example: 'MTEyMzQ1',  // base64 de "112345"
  })
  @IsString()
  @IsOptional()
  prevCursor?: string;  // O usa un solo 'cursor' y un flag 'direction'

}