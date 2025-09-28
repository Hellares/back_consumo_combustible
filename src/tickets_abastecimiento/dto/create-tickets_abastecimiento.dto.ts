import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Matches,
  IsDecimal,
  Min,
  Max,
  MaxLength,
  IsEnum,
  IsPositive
} from 'class-validator';

export enum TipoCombustibleTicket {
  DIESEL = 'DIESEL',
  GASOLINA_84 = 'GASOLINA_84',
  GASOLINA_90 = 'GASOLINA_90',
  GASOLINA_95 = 'GASOLINA_95',
  GASOLINA_97 = 'GASOLINA_97',
  GAS_NATURAL = 'GAS_NATURAL'
}

export class CreateTicketAbastecimientoDto {
  @ApiProperty({
    description: 'Fecha del ticket (YYYY-MM-DD), por defecto la fecha actual',
    example: '2024-01-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD válido' })
  fecha?: string;

  @ApiProperty({
    description: 'Hora del ticket (HH:mm:ss), por defecto la hora actual',
    example: '14:30:00',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'La hora debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'La hora debe tener formato HH:mm:ss válido'
  })
  hora?: string;

  @ApiProperty({
    description: 'ID del turno',
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del turno debe ser un número' })
  @IsPositive({ message: 'El ID del turno debe ser positivo' })
  turnoId?: number;

  @ApiProperty({
    description: 'ID de la unidad',
    example: 5
  })
  @IsNotEmpty({ message: 'El ID de la unidad es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de la unidad debe ser un número' })
  @IsPositive({ message: 'El ID de la unidad debe ser positivo' })
  unidadId: number;

  @ApiProperty({
    description: 'ID del conductor',
    example: 3
  })
  @IsNotEmpty({ message: 'El ID del conductor es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del conductor debe ser un número' })
  @IsPositive({ message: 'El ID del conductor debe ser positivo' })
  conductorId: number;

  @ApiProperty({
    description: 'ID del grifo donde se realizará el abastecimiento',
    example: 2
  })
  @IsNotEmpty({ message: 'El ID del grifo es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del grifo debe ser un número' })
  @IsPositive({ message: 'El ID del grifo debe ser positivo' })
  grifoId: number;

  @ApiProperty({
    description: 'ID de la ruta (opcional)',
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de la ruta debe ser un número' })
  @IsPositive({ message: 'El ID de la ruta debe ser positivo' })
  rutaId?: number;

  @ApiProperty({
    description: 'Kilometraje actual de la unidad',
    example: 125420.50,
    type: 'number',
    format: 'decimal'
  })
  @IsNotEmpty({ message: 'El kilometraje actual es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El kilometraje actual debe ser un número' })
  @Min(0, { message: 'El kilometraje actual no puede ser negativo' })
  @Max(9999999.99, { message: 'El kilometraje actual excede el máximo permitido' })
  kilometrajeActual: number;

  @ApiProperty({
    description: 'Kilometraje anterior de la unidad (opcional)',
    example: 125380.25,
    type: 'number',
    format: 'decimal',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El kilometraje anterior debe ser un número' })
  @Min(0, { message: 'El kilometraje anterior no puede ser negativo' })
  @Max(9999999.99, { message: 'El kilometraje anterior excede el máximo permitido' })
  kilometrajeAnterior?: number;

  @ApiProperty({
    description: 'Número del precinto nuevo que se colocará',
    example: 'PR-2024-001234',
    maxLength: 50
  })
  @IsNotEmpty({ message: 'El precinto nuevo es obligatorio' })
  @IsString({ message: 'El precinto nuevo debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El precinto nuevo no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  precintoNuevo: string;

  @ApiProperty({
    description: 'Tipo de combustible solicitado',
    enum: TipoCombustibleTicket,
    example: TipoCombustibleTicket.DIESEL,
    default: TipoCombustibleTicket.DIESEL
  })
  @IsOptional()
  @IsEnum(TipoCombustibleTicket, { message: 'Tipo de combustible inválido' })
  tipoCombustible: TipoCombustibleTicket = TipoCombustibleTicket.DIESEL;

  @ApiProperty({
    description: 'Cantidad de combustible solicitada',
    example: 25.500,
    type: 'number',
    format: 'decimal'
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.001, { message: 'La cantidad debe ser mayor a 0' })
  @Max(9999.999, { message: 'La cantidad excede el máximo permitido' })
  cantidad: number;

  @ApiProperty({
    description: 'Observaciones de la solicitud (opcional)',
    example: 'Solicitud urgente para ruta de emergencia',
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  observacionesSolicitud?: string;
}