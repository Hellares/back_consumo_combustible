import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class ZonaBasicInfo {
  @ApiProperty({ description: 'ID de la zona', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre de la zona', example: 'Lima Metropolitana' })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({ description: 'Código de la zona', example: 'LIMA' })
  @Expose()
  codigo?: string;
}

export class SedeResponseDto {
  @ApiProperty({
    description: 'ID único de la sede',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'ID de la zona a la que pertenece',
    example: 1
  })
  @Expose()
  zonaId: number;

  @ApiProperty({
    description: 'Nombre de la sede',
    example: 'Sede Central Lima'
  })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código único de la sede',
    example: 'SEDE01'
  })
  @Expose()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Dirección física de la sede',
    example: 'Av. Principal 123, Lima, Perú'
  })
  @Expose()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de la sede',
    example: '01-1234567'
  })
  @Expose()
  telefono?: string;

  @ApiProperty({
    description: 'Estado activo de la sede',
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
    description: 'Información básica de la zona',
    type: ZonaBasicInfo
  })
  @Expose()
  @Type(() => ZonaBasicInfo)
  zona?: ZonaBasicInfo;

  @ApiPropertyOptional({
    description: 'Número de grifos en esta sede',
    example: 3
  })
  @Expose()
  grifosCount?: number;
}