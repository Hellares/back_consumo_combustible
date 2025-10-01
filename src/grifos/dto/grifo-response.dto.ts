import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class ZonaBasicInfo {
  @ApiProperty({ description: 'ID de la zona', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre de la zona', example: 'Zona Norte' })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({ description: 'Código de la zona', example: 'ZONA01' })
  @Expose()
  codigo?: string;
}

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

  @ApiProperty({ description: 'Información de la zona', type: ZonaBasicInfo })
  @Expose()
  @Type(() => ZonaBasicInfo)  // ✅ Cambiado de Object a ZonaBasicInfo
  zona: ZonaBasicInfo;
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
    description: 'Horario de apertura (formato HH:mm)',
    example: '08:00'
  })
  @Expose()
  horarioApertura?: string;

  @ApiPropertyOptional({
    description: 'Horario de cierre (formato HH:mm)',
    example: '20:00'
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
    description: 'Número de tickets de abastecimiento realizados en este grifo',
    example: 150
  })
  @Expose()
  ticketsAbastecimientoCount?: number;  // ✅ Cambiado nombre

  @ApiPropertyOptional({
    description: 'Indica si está operativo (abierto según horario)',
    example: true
  })
  @Expose()
  estaAbierto?: boolean;
}