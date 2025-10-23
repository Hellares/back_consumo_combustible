// src/rutas/dto/update-ruta.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateRutaDto } from './create-ruta.dto';

/**
 * DTO para actualizar una ruta existente.
 * Hereda todos los campos de CreateRutaDto pero los hace opcionales.
 * Esto permite actualizar solo los campos que se deseen modificar.
 */
export class UpdateRutaDto extends PartialType(CreateRutaDto) {}
