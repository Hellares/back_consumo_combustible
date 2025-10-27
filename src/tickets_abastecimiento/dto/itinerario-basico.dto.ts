import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

export class ItinerarioBasicoDto {
  @ApiProperty({ description: 'ID del itinerario', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del itinerario', example: 'Ruta Norte Completa' })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Código del itinerario', example: 'RNC-001' })
  @Expose()
  codigo: string;

  @ApiProperty({ description: 'Tipo de itinerario', example: 'CIRCULAR' })
  @Expose()
  tipoItinerario: string;

  @ApiPropertyOptional({ description: 'Distancia total en km', example: 960.5 })
  @Expose()
  @Transform(({ value }) => value ? Number(value) : null)
  distanciaTotal?: number;

  @ApiPropertyOptional({ 
    description: 'Días de operación',
    example: ['LUNES', 'MIERCOLES', 'VIERNES'],
    isArray: true 
  })
  @Expose()
  diasOperacion?: string[];
}