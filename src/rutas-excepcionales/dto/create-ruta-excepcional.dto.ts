import { 
  IsInt, 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsDateString,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Enum de prioridades para rutas excepcionales
 */
export enum PrioridadRutaExcepcional {
  BAJA = 'BAJA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

/**
 * DTO para crear una asignación de ruta excepcional
 */
export class CreateRutaExcepcionalDto {
  @ApiProperty({
    description: 'ID de la unidad',
    example: 5,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID de la unidad es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El ID de la unidad debe ser un número entero' })
  unidadId: number;

  @ApiProperty({
    description: 'ID de la ruta a asignar',
    example: 15,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID de la ruta es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  rutaId: number;

  @ApiProperty({
    description: 'Fecha específica del viaje (formato ISO: YYYY-MM-DD)',
    example: '2025-10-25',
    type: String,
    format: 'date',
  })
  @IsNotEmpty({ message: 'La fecha del viaje es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' })
  fechaViajeEspecifico: string;

  @ApiProperty({
    description: 'Motivo de la asignación excepcional',
    example: 'EMERGENCIA',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El motivo de asignación es obligatorio' })
  @IsString({ message: 'El motivo debe ser texto' })
  @MaxLength(100, { message: 'El motivo no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  motivoAsignacion: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del motivo',
    example: 'Transporte urgente de insumos médicos a sede de Piura',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcionMotivo?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la ruta excepcional',
    enum: PrioridadRutaExcepcional,
    example: PrioridadRutaExcepcional.NORMAL,
    default: PrioridadRutaExcepcional.NORMAL,
  })
  @IsOptional()
  @IsEnum(PrioridadRutaExcepcional, { message: 'Prioridad inválida' })
  prioridad?: PrioridadRutaExcepcional = PrioridadRutaExcepcional.NORMAL;

  @ApiPropertyOptional({
    description: 'Indica si requiere autorización previa',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereAutorizacion debe ser un booleano' })
  requiereAutorizacion?: boolean = true;

  @ApiPropertyOptional({
    description: 'ID del usuario que autoriza (si requiere autorización)',
    example: 2,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del autorizador debe ser un número entero' })
  autorizadoPorId?: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Coordinar con conductor al menos 2 horas antes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  observaciones?: string;
}
