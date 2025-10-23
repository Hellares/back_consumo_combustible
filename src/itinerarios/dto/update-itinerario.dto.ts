// src/itinerarios/dto/update-itinerario.dto.ts

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateItinerarioDto } from './create-itinerario.dto';

/**
 * DTO para actualizar un itinerario existente.
 * Excluye 'tramos' porque los tramos se gestionan por endpoints separados.
 * Hereda todos los demás campos de CreateItinerarioDto pero los hace opcionales.
 */
export class UpdateItinerarioDto extends PartialType(
  OmitType(CreateItinerarioDto, ['tramos'] as const)
) {}