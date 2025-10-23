// src/rutas/dto/create-ruta.dto.ts

import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Enum para estados de ruta
export enum EstadoRuta {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  EN_REVISION = 'EN_REVISION',
}

export class CreateRutaDto {
  @ApiProperty({
    description: 'Nombre descriptivo de la ruta',
    example: 'Trujillo - Chiclayo',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código único identificador de la ruta',
    example: 'TRU-CHI-01',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'El código no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la ruta',
    example: 'Ruta directa por Panamericana Norte, incluye peaje',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Ciudad o punto de origen',
    example: 'Trujillo',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'El origen no puede exceder 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  origen?: string;

  @ApiPropertyOptional({
    description: 'Ciudad o punto de destino',
    example: 'Chiclayo',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'El destino no puede exceder 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  destino?: string;

  @ApiPropertyOptional({
    description: 'Distancia total de la ruta en kilómetros',
    example: 210.5,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La distancia debe ser un número con máximo 2 decimales' },
  )
  @IsOptional()
  @IsPositive({ message: 'La distancia debe ser un número positivo' })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  distanciaKm?: number;

  @ApiPropertyOptional({
    description: 'Tiempo estimado de viaje en minutos',
    example: 180,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El tiempo estimado debe ser un número entero' })
  @IsOptional()
  @IsPositive({ message: 'El tiempo estimado debe ser un número positivo' })
  @Min(1, { message: 'El tiempo estimado debe ser al menos 1 minuto' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  tiempoEstimadoMinutos?: number;

  @ApiPropertyOptional({
    description: 'Estado de la ruta',
    enum: EstadoRuta,
    example: EstadoRuta.ACTIVA,
    default: EstadoRuta.ACTIVA,
  })
  @IsEnum(EstadoRuta, {
    message: 'El estado debe ser: ACTIVA, INACTIVA o EN_REVISION',
  })
  @IsOptional()
  estado?: EstadoRuta;
}
