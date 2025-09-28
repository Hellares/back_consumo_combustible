import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ZonaResponseDto {
  @ApiProperty({
    description: 'ID único de la zona',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Nombre de la zona',
    example: 'Lima Metropolitana'
  })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código único de la zona',
    example: 'LIMA'
  })
  @Expose()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la zona',
    example: 'Zona de operaciones en Lima y alrededores'
  })
  @Expose()
  descripcion?: string;

  @ApiProperty({
    description: 'Estado activo de la zona',
    example: true
  })
  @Expose()
  activo: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-15T10:30:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-15T10:30:00.000Z'
  })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Número de sedes en esta zona',
    example: 5
  })
  @Expose()
  sedesCount?: number;

  @ApiPropertyOptional({
    description: 'Número de unidades operando en esta zona',
    example: 12
  })
  @Expose()
  unidadesCount?: number;
}