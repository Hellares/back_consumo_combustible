import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateGrifoDto } from './create-grifo.dto';

export class UpdateGrifoDto extends PartialType(CreateGrifoDto) {
  @ApiPropertyOptional({
    description: 'ID de la sede a la que pertenece el grifo',
    example: 2
  })
  sedeId?: number;

  @ApiPropertyOptional({
    description: 'Nombre del grifo',
    example: 'Grifo Central A - Actualizado'
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Código único del grifo',
    example: 'GRF001_NEW'
  })
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del grifo',
    example: 'Av. Secundaria 789, Lima, Perú'
  })
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del grifo',
    example: '01-1111111'
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Horario de apertura (formato HH:MM)',
    example: '05:30'
  })
  horarioApertura?: string;

  @ApiPropertyOptional({
    description: 'Horario de cierre (formato HH:MM)',
    example: '23:00'
  })
  horarioCierre?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del grifo',
    example: false
  })
  activo?: boolean;
}
