import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRutaExcepcionalDto } from './create-ruta-excepcional.dto';

/**
 * DTO para actualizar una ruta excepcional
 * Omite unidadId, rutaId y fechaViajeEspecifico (no se pueden cambiar)
 */
export class UpdateRutaExcepcionalDto extends PartialType(
  OmitType(CreateRutaExcepcionalDto, ['unidadId', 'rutaId', 'fechaViajeEspecifico'] as const),
) {}