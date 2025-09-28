import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  Max,
  Length,
  IsEnum,
  IsDateString
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

enum TipoCombustible {
  DIESEL = 'DIESEL',
  GASOLINA_84 = 'GASOLINA_84',
  GASOLINA_90 = 'GASOLINA_90',
  GASOLINA_95 = 'GASOLINA_95',
  GASOLINA_97 = 'GASOLINA_97',
  GLP = 'GLP',
  GNV = 'GNV'
}

export class CrearTicketAbastecimientoDto {
  @ApiPropertyOptional({
    description: 'Fecha del ticket (si no se proporciona, usa la fecha actual)',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD válido' })
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Hora del ticket (si no se proporciona, usa la hora actual)',
    example: '14:30:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  hora?: string;

  @ApiPropertyOptional({
    description: 'ID del turno',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del turno debe ser un número' })
  turnoId?: number;

  @ApiProperty({
    description: 'ID de la unidad',
    example: 5
  })
  @IsNotEmpty({ message: 'El ID de la unidad es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de la unidad debe ser un número' })
  unidadId: number;

  @ApiProperty({
    description: 'ID del conductor',
    example: 3
  })
  @IsNotEmpty({ message: 'El ID del conductor es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del conductor debe ser un número' })
  conductorId: number;

  @ApiProperty({
    description: 'ID del grifo donde se realizará el abastecimiento',
    example: 1
  })
  @IsNotEmpty({ message: 'El ID del grifo es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del grifo debe ser un número' })
  grifoId: number;

  @ApiPropertyOptional({
    description: 'ID de la ruta asignada',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de la ruta debe ser un número' })
  rutaId?: number;

  @ApiProperty({
    description: 'Kilometraje actual de la unidad',
    example: 15432.50,
    minimum: 0
  })
  @IsNotEmpty({ message: 'El kilometraje actual es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El kilometraje actual debe ser un número' })
  @Min(0, { message: 'El kilometraje actual no puede ser negativo' })
  kilometrajeActual: number;

  @ApiPropertyOptional({
    description: 'Kilometraje anterior de la unidad',
    example: 15232.50,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El kilometraje anterior debe ser un número' })
  @Min(0, { message: 'El kilometraje anterior no puede ser negativo' })
  kilometrajeAnterior?: number;

  @ApiProperty({
    description: 'Número del precinto nuevo',
    example: 'PR-001235',
    maxLength: 50
  })
  @IsNotEmpty({ message: 'El precinto nuevo es obligatorio' })
  @IsString({ message: 'El precinto nuevo debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El precinto nuevo debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  precintoNuevo: string;

  @ApiProperty({
    description: 'Tipo de combustible',
    enum: TipoCombustible,
    default: TipoCombustible.DIESEL
  })
  @IsNotEmpty({ message: 'El tipo de combustible es obligatorio' })
  @IsEnum(TipoCombustible, { message: 'Tipo de combustible inválido' })
  tipoCombustible: TipoCombustible = TipoCombustible.DIESEL;

  @ApiProperty({
    description: 'Cantidad de combustible solicitada',
    example: 25.500,
    minimum: 0.001,
    maximum: 1000
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.001, { message: 'La cantidad debe ser mayor a 0' })
  @Max(1000, { message: 'La cantidad no puede ser mayor a 1000' })
  cantidad: number;

  @ApiPropertyOptional({
    description: 'Observaciones de la solicitud',
    example: 'Solicitud de abastecimiento para ruta Lima - Callao'
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  observacionesSolicitud?: string;
}
