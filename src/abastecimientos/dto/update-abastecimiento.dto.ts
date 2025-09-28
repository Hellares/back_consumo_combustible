import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAbastecimientoDto } from './create-abastecimiento.dto';

// Omitimos campos que no se pueden actualizar después de crear
export class UpdateAbastecimientoDto extends PartialType(
  OmitType(CreateAbastecimientoDto, [
    'unidadId', 
    'conductorId', 
    'grifoId'
  ] as const)
) {}