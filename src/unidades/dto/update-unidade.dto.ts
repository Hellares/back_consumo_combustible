import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUnidadDto } from './create-unidade.dto';

export class UpdateUnidadDto extends PartialType(CreateUnidadDto) {
  @ApiPropertyOptional({
    description: 'Número de placa del vehículo',
    example: 'DEF-456'
  })
  placa?: string;

  @ApiPropertyOptional({
    description: 'ID del conductor/operador asignado',
    example: 3
  })
  conductorOperadorId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de operación',
    example: 'Transporte de Personal'
  })
  operacion?: string;

  @ApiPropertyOptional({
    description: 'Marca del vehículo',
    example: 'Mercedes-Benz'
  })
  marca?: string;

  @ApiPropertyOptional({
    description: 'Modelo del vehículo',
    example: 'Sprinter 515'
  })
  modelo?: string;

  @ApiPropertyOptional({
    description: 'Año de fabricación',
    example: 2021
  })
  anio?: number;

  @ApiPropertyOptional({
    description: 'Número VIN',
    example: 'WDB9066631B123456'
  })
  nroVin?: string;

  @ApiPropertyOptional({
    description: 'Número de motor',
    example: 'OM651955'
  })
  nroMotor?: string;

  @ApiPropertyOptional({
    description: 'ID de zona de operación',
    example: 2
  })
  zonaOperacionId?: number;

  @ApiPropertyOptional({
    description: 'Capacidad del tanque en galones',
    example: 75.00
  })
  capacidadTanque?: number;

  @ApiPropertyOptional({
    description: 'Tipo de combustible',
    example: 'GASOLINA'
  })
  tipoCombustible?: string;

  @ApiPropertyOptional({
    description: 'Estado operativo',
    example: 'MANTENIMIENTO'
  })
  estado?: string;

  @ApiPropertyOptional({
    description: 'Estado activo',
    example: false
  })
  activo?: boolean;
}