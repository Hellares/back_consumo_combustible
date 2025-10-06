// src/detalles-abastecimiento/dto/concluir-detalle.dto.ts

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoDetalleEnum {
  EN_PROGRESO = 'EN_PROGRESO',
  CONCLUIDO = 'CONCLUIDO'
}

export class ConcluirDetalleDto {
  @ApiProperty({ 
    description: 'Estado del detalle',
    enum: EstadoDetalleEnum,
    example: 'CONCLUIDO'
  })
  @IsEnum(EstadoDetalleEnum)
  estado: EstadoDetalleEnum;
}