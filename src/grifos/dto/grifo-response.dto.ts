import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class SedeBasicInfo {
  @ApiProperty({ description: 'ID de la sede', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre de la sede', example: 'Sede Central Lima' })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({ description: 'Código de la sede', example: 'SEDE01' })
  @Expose()
  codigo?: string;

  @ApiProperty({ description: 'Información de la zona' })
  @Expose()
  @Type(() => Object)
  zona: {
    id: number;
    nombre: string;
    codigo?: string;
  };
}

export class GrifoResponseDto {
  @ApiProperty({
    description: 'ID único del grifo',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'ID de la sede a la que pertenece',
    example: 1
  })
  @Expose()
  sedeId: number;

  @ApiProperty({
    description: 'Nombre del grifo',
    example: 'Grifo Central A'
  })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código único del grifo',
    example: 'GRF001'
  })
  @Expose()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del grifo',
    example: 'Av. Secundaria 456, Lima, Perú'
  })
  @Expose()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del grifo',
    example: '01-9876543'
  })
  @Expose()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Horario de apertura',
    example: '06:00:00'
  })
  @Expose()
  horarioApertura?: string;

  @ApiPropertyOptional({
    description: 'Horario de cierre',
    example: '22:00:00'
  })
  @Expose()
  horarioCierre?: string;

  @ApiProperty({
    description: 'Estado activo del grifo',
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
    description: 'Información básica de la sede',
    type: SedeBasicInfo
  })
  @Expose()
  @Type(() => SedeBasicInfo)
  sede?: SedeBasicInfo;

  @ApiPropertyOptional({
    description: 'Número de abastecimientos realizados en este grifo',
    example: 150
  })
  @Expose()
  abastecimientosCount?: number;

  @ApiPropertyOptional({
    description: 'Indica si está operativo (abierto según horario)',
    example: true
  })
  @Expose()
  estaAbierto?: boolean;
}