import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
  IsEnum,
  IsArray,
  ArrayMinSize,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum FrecuenciaItinerario {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL',
  LUNES_VIERNES = 'LUNES_VIERNES',
  FINES_SEMANA = 'FINES_SEMANA',
  PERSONALIZADO = 'PERSONALIZADO',
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

/**
 * DTO para asignar una unidad a un itinerario de forma permanente
 */
export class CreateAsignacionItinerarioDto {
  @ApiProperty({
    description: 'ID de la unidad a asignar',
    example: 25,
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID de la unidad es obligatorio' })
  @IsPositive()
  @Type(() => Number)
  unidadId: number;

  @ApiProperty({
    description: 'ID del itinerario al que se asignará la unidad',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID del itinerario es obligatorio' })
  @IsPositive()
  @Type(() => Number)
  itinerarioId: number;

  @ApiProperty({
    description: 'Frecuencia de operación del itinerario',
    enum: FrecuenciaItinerario,
    example: FrecuenciaItinerario.PERSONALIZADO,
  })
  @IsEnum(FrecuenciaItinerario)
  @IsNotEmpty({ message: 'La frecuencia es obligatoria' })
  frecuencia: FrecuenciaItinerario;

  @ApiPropertyOptional({
    description: 'Días específicos de operación (requerido si frecuencia es PERSONALIZADO)',
    enum: DiaSemana,
    isArray: true,
    example: [DiaSemana.LUNES, DiaSemana.MIERCOLES, DiaSemana.VIERNES],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe especificar al menos un día' })
  @IsEnum(DiaSemana, { each: true })
  @IsOptional()
  diasEspecificos?: DiaSemana[];

  @ApiPropertyOptional({
    description: 'Hora de inicio personalizada (HH:mm). Si no se especifica, usa la del itinerario',
    example: '06:00',
  })
  @IsString()
  @IsOptional()
  @MaxLength(5)
  horaInicioPersonalizada?: string;

  @ApiPropertyOptional({
    description: 'Si la asignación es permanente o temporal',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  esPermanente?: boolean;

  @ApiPropertyOptional({
    description: 'ID del usuario que asigna (se obtiene del token)',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  asignadoPorId?: number;

  @ApiPropertyOptional({
    description: 'Motivo de la asignación',
    example: 'Asignación regular de ruta comercial',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  motivoCambio?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  observaciones?: string;
}