import { PartialType } from '@nestjs/swagger';
import { CreateTicketsAbastecimientoDto } from './create-tickets_abastecimiento.dto';

export class UpdateTicketsAbastecimientoDto extends PartialType(CreateTicketsAbastecimientoDto) {}
