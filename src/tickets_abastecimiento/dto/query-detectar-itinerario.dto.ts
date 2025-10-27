import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para validar query params del endpoint de detección
 */
export class QueryDetectarItinerarioDto {
  @ApiProperty({
    description: 'ID de la unidad para detectar el itinerario',
    example: 5
  })
  @IsInt({ message: 'El ID de la unidad debe ser un número entero' })
  @Type(() => Number)
  unidadId: number;

  @ApiPropertyOptional({
    description: 'Fecha para la cual detectar el itinerario (YYYY-MM-DD). Si no se envía, usa la fecha actual',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha?: string;
}