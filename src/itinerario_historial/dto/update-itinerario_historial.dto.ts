import { PartialType } from '@nestjs/swagger';
import { CreateItinerarioHistorialDto } from './create-itinerario_historial.dto';

export class UpdateItinerarioHistorialDto extends PartialType(CreateItinerarioHistorialDto) {}
