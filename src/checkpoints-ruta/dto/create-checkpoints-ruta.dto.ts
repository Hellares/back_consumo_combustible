// src/checkpoints-ruta/dto/create-checkpoint.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCheckpointDto {
  @ApiProperty({ description: 'ID del ticket' })
  @IsInt()
  ticketId: number;

  @ApiProperty({ description: 'Latitud', example: -8.112179 })
  @IsNumber()
  latitud: number;

  @ApiProperty({ description: 'Longitud', example: -79.029503 })
  @IsNumber()
  longitud: number;

  @ApiProperty({ 
    description: 'Tipo de checkpoint',
    enum: ['INICIO', 'PARADA', 'LLEGADA', 'EMERGENCIA', 'OTRO']
  })
  @IsEnum(['INICIO', 'PARADA', 'LLEGADA', 'EMERGENCIA', 'OTRO'])
  tipoCheckpoint: string;

  @ApiProperty({ description: 'Descripción del lugar', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'Observaciones', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ description: 'Kilometraje actual', required: false })
  @IsOptional()
  @IsNumber()
  kilometrajeActual?: number;

  @ApiProperty({ description: 'URL de foto evidencia', required: false })
  @IsOptional()
  @IsString()
  urlFoto?: string;
}
