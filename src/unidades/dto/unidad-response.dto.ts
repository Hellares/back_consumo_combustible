import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class ConductorBasicInfo {
  @ApiProperty({ description: 'ID del conductor', example: 5 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombres del conductor', example: 'Juan Carlos' })
  @Expose()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del conductor', example: 'García López' })
  @Expose()
  apellidos: string;

  @ApiPropertyOptional({ description: 'DNI del conductor', example: '12345678' })
  @Expose()
  dni?: string;

  @ApiPropertyOptional({ description: 'Código de empleado', example: 'COND001' })
  @Expose()
  codigoEmpleado?: string;
}

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

export class UnidadResponseDto {
  @ApiProperty({
    description: 'ID único de la unidad',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Número de placa',
    example: 'ABC-123'
  })
  @Expose()
  placa: string;

  @ApiPropertyOptional({
    description: 'ID del conductor/operador asignado',
    example: 5
  })
  @Expose()
  conductorOperadorId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de operación',
    example: 'Transporte de Carga'
  })
  @Expose()
  operacion?: string;

  @ApiProperty({
    description: 'Marca del vehículo',
    example: 'Volvo'
  })
  @Expose()
  marca: string;

  @ApiProperty({
    description: 'Modelo del vehículo',
    example: 'FH 460'
  })
  @Expose()
  modelo: string;

  @ApiPropertyOptional({
    description: 'Año de fabricación',
    example: 2020
  })
  @Expose()
  anio?: number;

  @ApiPropertyOptional({
    description: 'Número VIN',
    example: 'YV2A1234567890123'
  })
  @Expose()
  nroVin?: string;

  @ApiPropertyOptional({
    description: 'Número de motor',
    example: 'D13F460EC06'
  })
  @Expose()
  nroMotor?: string;

  @ApiPropertyOptional({
    description: 'ID de zona de operación',
    example: 1
  })
  @Expose()
  zonaOperacionId?: number;

  @ApiPropertyOptional({
    description: 'Capacidad del tanque en galones',
    example: 400.00,
    type: 'number'
  })
  @Expose()
  capacidadTanque?: number;

  @ApiProperty({
    description: 'Tipo de combustible',
    example: 'DIESEL'
  })
  @Expose()
  tipoCombustible: string;

  @ApiProperty({
    description: 'Odómetro inicial en kilómetros',
    example: 50000.00,
    type: 'number'
  })
  @Expose()
  odometroInicial: number;

  @ApiProperty({
    description: 'Horómetro inicial en horas',
    example: 5000.00,
    type: 'number'
  })
  @Expose()
  horometroInicial: number;

  @ApiPropertyOptional({
    description: 'Fecha de adquisición',
    example: '2020-03-15'
  })
  @Expose()
  fechaAdquisicion?: string;

  @ApiProperty({
    description: 'Estado operativo',
    example: 'OPERATIVO'
  })
  @Expose()
  estado: string;

  @ApiProperty({
    description: 'Estado activo',
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
    description: 'Información del conductor asignado',
    type: ConductorBasicInfo
  })
  @Expose()
  @Type(() => ConductorBasicInfo)
  conductorOperador?: ConductorBasicInfo;

  @ApiPropertyOptional({
    description: 'Información de la zona de operación',
    type: ZonaBasicInfo
  })
  @Expose()
  @Type(() => ZonaBasicInfo)
  zonaOperacion?: ZonaBasicInfo;

  @ApiPropertyOptional({
    description: 'Número de abastecimientos registrados',
    example: 125
  })
  @Expose()
  abastecimientosCount?: number;

  @ApiPropertyOptional({
    description: 'Número de mantenimientos registrados',
    example: 8
  })
  @Expose()
  mantenimientosCount?: number;

  @ApiPropertyOptional({
    description: 'Número de fallas registradas',
    example: 3
  })
  @Expose()
  fallasCount?: number;

  @ApiProperty({
    description: 'Antigüedad de la unidad en años',
    example: 5
  })
  @Expose()
  antiguedadAnios?: number;

  @ApiProperty({
    description: 'Indica si puede operar según su estado',
    example: true
  })
  @Expose()
  puedeOperar?: boolean;
}