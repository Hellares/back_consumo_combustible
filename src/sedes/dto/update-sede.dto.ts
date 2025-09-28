import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSedeDto } from './create-sede.dto';

export class UpdateSedeDto extends PartialType(CreateSedeDto) {
  @ApiPropertyOptional({
    description: 'ID de la zona a la que pertenece la sede',
    example: 2
  })
  zonaId?: number;

  @ApiPropertyOptional({
    description: 'Nombre de la sede',
    example: 'Sede Central Lima Actualizada'
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Código único de la sede',
    example: 'SEDE01_NEW'
  })
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Dirección física de la sede',
    example: 'Av. Principal 456, Lima, Perú'
  })
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de la sede',
    example: '01-7654321'
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la sede',
    example: false
  })
  activo?: boolean;
}
