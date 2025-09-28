import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateTicketAbastecimientoDto } from './create-tickets_abastecimiento.dto';

export class UpdateTicketAbastecimientoDto extends PartialType(
  OmitType(CreateTicketAbastecimientoDto, [
    'unidadId', 
    'conductorId', 
    'grifoId'
  ] as const)
) {
  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre la solicitud',
    example: 'Actualización: cambio de prioridad',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  observacionesSolicitud?: string;
}