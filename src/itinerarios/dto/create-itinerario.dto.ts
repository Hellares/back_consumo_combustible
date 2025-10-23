// src/itinerarios/dto/create-itinerario.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
  IsBoolean,
  IsPositive,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum TipoItinerario {
  IDA_VUELTA = 'IDA_VUELTA',
  CIRCULAR = 'CIRCULAR',
  LINEAL = 'LINEAL',
}

export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}

export enum EstadoItinerario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
}

export enum TipoTramo {
  IDA = 'IDA',
  VUELTA = 'VUELTA',
  INTERMEDIO = 'INTERMEDIO',
  CIRCULAR = 'CIRCULAR',
}

// DTO para crear un tramo dentro del itinerario
export class CreateTramoDto {
  @ApiProperty({
    description: 'ID de la ruta que corresponde a este tramo',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  rutaId: number;

  @ApiProperty({
    description: 'Orden del tramo en la secuencia (1, 2, 3...)',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  orden: number;

  @ApiProperty({
    description: 'Tipo de tramo',
    enum: TipoTramo,
    example: TipoTramo.IDA,
  })
  @IsEnum(TipoTramo)
  @IsNotEmpty()
  tipoTramo: TipoTramo;

  @ApiProperty({
    description: 'Ciudad de origen del tramo (para validación de secuencia)',
    example: 'Trujillo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  ciudadOrigen: string;

  @ApiProperty({
    description: 'Ciudad de destino del tramo (debe coincidir con origen del siguiente)',
    example: 'Chiclayo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  ciudadDestino: string;

  @ApiPropertyOptional({
    description: 'Punto de parada en este tramo',
    example: 'Terminal de buses Chiclayo',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  puntoParada?: string;

  @ApiPropertyOptional({
    description: 'Dirección exacta de la parada',
    example: 'Av. Bolognesi 638, Chiclayo',
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim())
  direccionParada?: string;

  @ApiPropertyOptional({
    description: 'Coordenadas GPS de la parada (lat,lng)',
    example: '-6.7714,-79.8375',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  coordenadasParada?: string;

  @ApiPropertyOptional({
    description: 'Tiempo estimado de parada en minutos',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  tiempoParadaMinutos?: number;

  @ApiPropertyOptional({
    description: 'Si la parada es obligatoria',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  esParadaObligatoria?: boolean;

  @ApiPropertyOptional({
    description: 'Si requiere inspección en este tramo',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiereInspeccion?: boolean;

  @ApiPropertyOptional({
    description: 'Si requiere abastecimiento en este tramo',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiereAbastecimiento?: boolean;

  @ApiPropertyOptional({
    description: 'Si requiere documentación específica',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiereDocumentacion?: boolean;

  @ApiPropertyOptional({
    description: 'Tolerancia de desviación en kilómetros',
    example: 5.0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  toleranciaKm?: number;

  @ApiPropertyOptional({
    description: 'Tolerancia de desviación en minutos',
    example: 15,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  toleranciaTiempo?: number;

  @ApiPropertyOptional({
    description: 'Horario preferido para este tramo',
    example: '08:00-10:00',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  horarioPreferido?: string;

  @ApiPropertyOptional({
    description: 'Restricciones climáticas',
    example: 'No operar con lluvia intensa',
  })
  @IsString()
  @IsOptional()
  restriccionesClimaticas?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del tramo',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

// DTO principal para crear itinerario
export class CreateItinerarioDto {
  @ApiProperty({
    description: 'Nombre descriptivo del itinerario',
    example: 'Ruta Norte Completa',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(150)
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiProperty({
    description: 'Código único identificador del itinerario',
    example: 'RNC-001',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @MaxLength(30)
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del itinerario',
    example: 'Itinerario circular que cubre Trujillo, Chiclayo y Piura',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de itinerario',
    enum: TipoItinerario,
    example: TipoItinerario.CIRCULAR,
  })
  @IsEnum(TipoItinerario)
  @IsNotEmpty()
  tipoItinerario: TipoItinerario;

  @ApiProperty({
    description: 'Días de operación del itinerario',
    enum: DiaSemana,
    isArray: true,
    example: [DiaSemana.LUNES, DiaSemana.MIERCOLES, DiaSemana.VIERNES],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe especificar al menos un día de operación' })
  @IsEnum(DiaSemana, { each: true })
  diasOperacion: DiaSemana[];

  @ApiPropertyOptional({
    description: 'Hora habitual de inicio (HH:mm)',
    example: '06:00',
  })
  @IsString()
  @IsOptional()
  @MaxLength(5)
  horaInicioHabitual?: string;

  @ApiPropertyOptional({
    description: 'Duración estimada total en horas',
    example: 12.5,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  duracionEstimadaHoras?: number;

  @ApiPropertyOptional({
    description: 'Estado inicial del itinerario',
    enum: EstadoItinerario,
    example: EstadoItinerario.ACTIVO,
    default: EstadoItinerario.ACTIVO,
  })
  @IsEnum(EstadoItinerario)
  @IsOptional()
  estado?: EstadoItinerario;

  @ApiPropertyOptional({
    description: 'Si requiere supervisor para operar',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiereSupervisor?: boolean;

  @ApiProperty({
    description: 'Lista de tramos que componen el itinerario',
    type: [CreateTramoDto],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'El itinerario debe tener al menos un tramo' })
  @ValidateNested({ each: true })
  @Type(() => CreateTramoDto)
  tramos: CreateTramoDto[];
}