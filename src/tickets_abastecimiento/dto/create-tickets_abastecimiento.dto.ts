// import { ApiProperty } from '@nestjs/swagger';
// import { Transform, Type } from 'class-transformer';
// import {
//   IsNotEmpty,
//   IsNumber,
//   IsOptional,
//   IsString,
//   IsDateString,
//   Matches,
//   IsDecimal,
//   Min,
//   Max,
//   MaxLength,
//   IsEnum,
//   IsPositive
// } from 'class-validator';

export enum TipoCombustibleTicket {
  DIESEL = 'DIESEL',
  GASOLINA_84 = 'GASOLINA_84',
  GASOLINA_90 = 'GASOLINA_90',
  GASOLINA_95 = 'GASOLINA_95',
  GASOLINA_97 = 'GASOLINA_97',
  GLP = 'GLP',
  GNV = 'GNV',
  ELECTRICO = 'ELECTRICO'
}

// export class CreateTicketAbastecimientoDto {
//   @ApiProperty({
//     description: 'Fecha del ticket (YYYY-MM-DD), por defecto la fecha actual',
//     example: '2024-01-15',
//     required: false
//   })
//   @IsOptional()
//   @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD válido' })
//   fecha?: string;

//   @ApiProperty({
//     description: 'Hora del ticket (HH:mm:ss), por defecto la hora actual',
//     example: '14:30:00',
//     required: false
//   })
//   @IsOptional()
//   @IsString({ message: 'La hora debe ser una cadena de texto' })
//   @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
//     message: 'La hora debe tener formato HH:mm:ss válido'
//   })
//   hora?: string;

//   @ApiProperty({
//     description: 'ID del turno',
//     example: 1,
//     required: false
//   })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El ID del turno debe ser un número' })
//   @IsPositive({ message: 'El ID del turno debe ser positivo' })
//   turnoId?: number;

//   @ApiProperty({
//     description: 'ID de la unidad',
//     example: 5
//   })
//   @IsNotEmpty({ message: 'El ID de la unidad es obligatorio' })
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El ID de la unidad debe ser un número' })
//   @IsPositive({ message: 'El ID de la unidad debe ser positivo' })
//   unidadId: number;

//   @ApiProperty({
//     description: 'ID del conductor',
//     example: 3
//   })
//   @IsNotEmpty({ message: 'El ID del conductor es obligatorio' })
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El ID del conductor debe ser un número' })
//   @IsPositive({ message: 'El ID del conductor debe ser positivo' })
//   conductorId: number;

//   @ApiProperty({
//     description: 'ID del grifo donde se realizará el abastecimiento',
//     example: 2
//   })
//   @IsNotEmpty({ message: 'El ID del grifo es obligatorio' })
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El ID del grifo debe ser un número' })
//   @IsPositive({ message: 'El ID del grifo debe ser positivo' })
//   grifoId: number;

//   @ApiProperty({
//     description: 'ID de la ruta (opcional)',
//     example: 1,
//     required: false
//   })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El ID de la ruta debe ser un número' })
//   @IsPositive({ message: 'El ID de la ruta debe ser positivo' })
//   rutaId?: number;

//   @ApiProperty({
//     description: 'Kilometraje actual de la unidad',
//     example: 125420.50,
//     type: 'number',
//     format: 'decimal'
//   })
//   @IsNotEmpty({ message: 'El kilometraje actual es obligatorio' })
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El kilometraje actual debe ser un número' })
//   @Min(0, { message: 'El kilometraje actual no puede ser negativo' })
//   @Max(9999999.99, { message: 'El kilometraje actual excede el máximo permitido' })
//   kilometrajeActual: number;

//   @ApiProperty({
//     description: 'Kilometraje anterior de la unidad (opcional)',
//     example: 125380.25,
//     type: 'number',
//     format: 'decimal',
//     required: false
//   })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber({}, { message: 'El kilometraje anterior debe ser un número' })
//   @Min(0, { message: 'El kilometraje anterior no puede ser negativo' })
//   @Max(9999999.99, { message: 'El kilometraje anterior excede el máximo permitido' })
//   kilometrajeAnterior?: number;

//   @ApiProperty({
//     description: 'Número del precinto nuevo que se colocará',
//     example: 'PR-2024-001234',
//     maxLength: 50,
//     required: false,
//     default: '-',
//   })
//   //! @IsNotEmpty({ message: 'El precinto nuevo es obligatorio' })
//   @IsOptional()
//   @IsString({ message: 'El precinto nuevo debe ser una cadena de texto' })
//   @MaxLength(50, { message: 'El precinto nuevo no puede exceder 50 caracteres' })
//   // @Transform(({ value }) => value?.trim()?.toUpperCase())
//   @Transform(({ value }) => {
//     // Si no viene nada o viene vacío, devuelve '-'
//     if (value === undefined || value === null || value.trim() === '') {
//       return '-';
//     }
//     return value.trim().toUpperCase();
//   })
//   precintoNuevo: string = '-';

//   @ApiProperty({
//     description: 'Tipo de combustible solicitado',
//     enum: TipoCombustibleTicket,
//     example: TipoCombustibleTicket.DIESEL,
//     default: TipoCombustibleTicket.DIESEL
//   })
//   @IsOptional()
//   @IsEnum(TipoCombustibleTicket, { message: 'Tipo de combustible inválido' })
//   tipoCombustible: TipoCombustibleTicket = TipoCombustibleTicket.DIESEL;

//   @ApiProperty({
//     description: 'Cantidad de combustible solicitada',
//     example: 25.500,
//     type: 'number',
//     format: 'decimal'
//   })
//   @IsNotEmpty({ message: 'La cantidad es obligatoria' })
//   @Type(() => Number)
//   @IsNumber({}, { message: 'La cantidad debe ser un número' })
//   @Min(0.001, { message: 'La cantidad debe ser mayor a 0' })
//   @Max(9999.999, { message: 'La cantidad excede el máximo permitido' })
//   cantidad: number;

//   @ApiProperty({
//     description: 'Observaciones de la solicitud (opcional)',
//     example: 'Solicitud urgente para ruta de emergencia',
//     maxLength: 500,
//     required: false
//   })
//   @IsOptional()
//   @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
//   @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
//   @Transform(({ value }) => value?.trim())
//   observacionesSolicitud?: string;
// }

import { 
  IsNotEmpty, 
  IsInt, 
  IsOptional, 
  IsString, 
  IsEnum,
  IsDateString,
  MaxLength,
  IsPositive,
  ValidateIf,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateTicketAbastecimientoDto {
  // ==================== CAMPOS BÁSICOS DEL TICKET ====================
  
  @ApiPropertyOptional({
    description: 'Fecha del abastecimiento (YYYY-MM-DD). Si no se envía, usa la fecha actual',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Hora del abastecimiento (HH:mm). Si no se envía, usa la hora actual',
    example: '14:30'
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'La hora debe tener formato HH:mm:ss válido'
  })
  @MaxLength(5)
  hora?: string;

  @ApiPropertyOptional({
    description: 'ID del turno (opcional)',
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  turnoId?: number;

  @ApiProperty({
    description: 'ID de la unidad que solicita abastecimiento',
    example: 5
  })
  @IsNotEmpty({ message: 'La unidad es obligatoria' })
  @IsInt()
  @Type(() => Number)
  unidadId: number;

  @ApiProperty({
    description: 'ID del conductor que solicita abastecimiento',
    example: 3
  })
  @IsNotEmpty({ message: 'El conductor es obligatorio' })
  @IsInt()
  @Type(() => Number)
  conductorId: number;

  @ApiProperty({
    description: 'ID del grifo donde se realizará el abastecimiento',
    example: 1
  })
  @IsNotEmpty({ message: 'El grifo es obligatorio' })
  @IsInt()
  @Type(() => Number)
  grifoId: number;

  // ==================== 🔥 CAMPOS DE RUTA/ITINERARIO ====================

  @ApiPropertyOptional({
    description: 'ID de la ruta (solo si es ruta simple o excepcional). No enviar si hay itinerario',
    example: 3
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  rutaId?: number;

  @ApiPropertyOptional({
    description: 'ID del itinerario asignado. No enviar si hay ruta',
    example: 2
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  itinerarioId?: number;

  @ApiPropertyOptional({
    description: 'ID de la ejecución de itinerario (solo si ya está en curso)',
    example: 15
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ejecucionItinerarioId?: number;

  @ApiPropertyOptional({
    description: 'Origen de la asignación de ruta/itinerario',
    enum: ['AUTOMATICO', 'MANUAL', 'NINGUNO'],
    example: 'AUTOMATICO',
    default: 'NINGUNO'
  })
  @IsOptional()
  @IsEnum(['AUTOMATICO', 'MANUAL', 'NINGUNO'], {
    message: 'El origen debe ser AUTOMATICO, MANUAL o NINGUNO'
  })
  origenAsignacion?: string;

  @ApiPropertyOptional({
    description: 'Motivo del cambio manual de itinerario (OBLIGATORIO si origenAsignacion es MANUAL)',
    example: 'Emergencia - Unidad de apoyo para ruta sur',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ValidateIf(o => o.origenAsignacion === 'MANUAL')
  @IsNotEmpty({ 
    message: 'El motivo es obligatorio cuando se cambia el itinerario manualmente' 
  })
  motivoCambioItinerario?: string;

  @ApiPropertyOptional({
    description: 'ID del itinerario originalmente detectado por el sistema (para auditoría)',
    example: 2
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  itinerarioOriginalDetectadoId?: number;

  // ==================== CAMPOS DE KILOMETRAJE Y COMBUSTIBLE ====================

  @ApiProperty({
    description: 'Kilometraje actual de la unidad',
    example: 125420.50
  })
  @IsNotEmpty({ message: 'El kilometraje actual es obligatorio' })
  @IsPositive({ message: 'El kilometraje debe ser positivo' })
  @Type(() => Number)
  kilometrajeActual: number;

  @ApiPropertyOptional({
    description: 'Kilometraje anterior (del último abastecimiento)',
    example: 125380.25
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  kilometrajeAnterior?: number;

  @ApiPropertyOptional({
    description: 'Nivel de combustible antes del abastecimiento',
    example: '1/4',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nivelCombustibleAntes?: string;

  //   //! @IsNotEmpty({ message: 'El precinto nuevo es obligatorio' })
  @IsOptional()
  @IsString({ message: 'El precinto nuevo debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El precinto nuevo no puede exceder 50 caracteres' })
  // @Transform(({ value }) => value?.trim()?.toUpperCase())
  @Transform(({ value }) => {
    // Si no viene nada o viene vacío, devuelve '-'
    if (value === undefined || value === null || value.trim() === '') {
      return '-';
    }
    return value.trim().toUpperCase();
  })
  precintoNuevo: string = '-';

  @ApiProperty({
    description: 'Tipo de combustible',
    example: 'DIESEL',
    enum: ['DIESEL', 'GASOLINA_84', 'GASOLINA_90', 'GASOLINA_95', 'GASOLINA_97', 'GLP', 'GNV']
  })
  @IsNotEmpty({ message: 'El tipo de combustible es obligatorio' })
  @IsString()
  @MaxLength(30)
  tipoCombustible: string;

  @ApiProperty({
    description: 'Cantidad de combustible solicitada (en galones)',
    example: 50.000
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero' })
  @Type(() => Number)
  cantidad: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales de la solicitud',
    example: 'Abastecimiento para ruta larga'
  })
  @IsOptional()
  @IsString()
  observacionesSolicitud?: string;
}