// =============================================
// src/turnos/dto/create-turno.dto.ts
// =============================================

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, IsOptional } from 'class-validator';

export class CreateTurnoDto {
  @ApiProperty({
    description: 'Nombre del turno',
    example: 'MAÑANA',
    minLength: 2,
    maxLength: 30
  })
  @IsNotEmpty({ message: 'El nombre del turno es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(2, 30, { message: 'El nombre debe tener entre 2 y 30 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Hora de inicio del turno (formato HH:mm:ss)',
    example: '06:00:00'
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'La hora de inicio debe tener formato HH:mm:ss válido'
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin del turno (formato HH:mm:ss)',
    example: '14:00:00'
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @IsString({ message: 'La hora de fin debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'La hora de fin debe tener formato HH:mm:ss válido'
  })
  horaFin: string;
}
