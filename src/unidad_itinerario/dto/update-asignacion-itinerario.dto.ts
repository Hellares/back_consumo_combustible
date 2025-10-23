

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAsignacionItinerarioDto } from './create-asignacion-itinerario.dto';

/**
 * DTO para actualizar una asignación de itinerario existente.
 * Excluye unidadId e itinerarioId porque no se pueden cambiar.
 * Permite actualizar frecuencia, días, hora, etc.
 */
export class UpdateAsignacionItinerarioDto extends PartialType(
  OmitType(CreateAsignacionItinerarioDto, ['unidadId', 'itinerarioId'] as const)
) {}