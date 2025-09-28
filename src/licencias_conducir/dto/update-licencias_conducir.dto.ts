import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLicenciaConducirDto } from './create-licencias_conducir.dto';

export class UpdateLicenciaConducirDto extends PartialType(CreateLicenciaConducirDto) {
  @ApiPropertyOptional({
    description: 'ID del usuario al que pertenece la licencia',
    example: 2
  })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Número de la licencia de conducir',
    example: 'Q98765432'
  })
  numeroLicencia?: string;

  @ApiPropertyOptional({
    description: 'Categoría de la licencia',
    example: 'A-III'
  })
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Fecha de emisión de la licencia (YYYY-MM-DD)',
    example: '2023-06-15'
  })
  fechaEmision?: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración de la licencia (YYYY-MM-DD)',
    example: '2030-06-15'
  })
  fechaExpiracion?: string;

  @ApiPropertyOptional({
    description: 'Entidad que emitió la licencia',
    example: 'MTC - Lima'
  })
  entidadEmisora?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la licencia',
    example: false
  })
  activo?: boolean;
}
