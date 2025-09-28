import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateZonaDto } from './create-zona.dto';

export class UpdateZonaDto extends PartialType(CreateZonaDto) {
  @ApiPropertyOptional({
    description: 'Nombre de la zona',
    example: 'Lima Metropolitana Actualizada'
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Código único de la zona',
    example: 'LIMA_NEW'
  })
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la zona',
    example: 'Zona de operaciones actualizada'
  })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la zona',
    example: false
  })
  activo?: boolean;
}
