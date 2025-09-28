import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsInt,
  IsDateString,
  IsNumber,
  IsIn,
  MaxLength, 
  MinLength,
  IsNotEmpty,
  Matches,
  Min,
  Max
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUnidadDto {
  @ApiProperty({
    description: 'Número de placa del vehículo',
    example: 'ABC-123',
    maxLength: 20,
    minLength: 6
  })
  @IsString()
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  @MinLength(6, { message: 'La placa debe tener al menos 6 caracteres' })
  @MaxLength(20, { message: 'La placa no puede exceder 20 caracteres' })
  @Matches(/^[A-Z0-9\-]+$/, { 
    message: 'La placa solo puede contener letras mayúsculas, números y guiones' 
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  placa: string;

  @ApiPropertyOptional({
    description: 'ID del conductor/operador asignado a la unidad',
    example: 5
  })
  @IsOptional()
  @IsInt({ message: 'El ID del conductor debe ser un número entero' })
  @Min(1, { message: 'El ID del conductor debe ser mayor a 0' })
  @Type(() => Number)
  conductorOperadorId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de operación de la unidad',
    example: 'Transporte de Carga',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La operación no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  operacion?: string;

  @ApiProperty({
    description: 'Marca del vehículo',
    example: 'Volvo',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @MaxLength(50, { message: 'La marca no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  marca: string;

  @ApiProperty({
    description: 'Modelo del vehículo',
    example: 'FH 460',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  @MaxLength(50, { message: 'El modelo no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  modelo: string;

  @ApiPropertyOptional({
    description: 'Año de fabricación del vehículo',
    example: 2020,
    minimum: 1990,
    maximum: 2030
  })
  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1990, { message: 'El año debe ser mayor a 1990' })
  @Max(2030, { message: 'El año no puede ser mayor a 2030' })
  @Type(() => Number)
  anio?: number;

  @ApiPropertyOptional({
    description: 'Número VIN (Vehicle Identification Number)',
    example: 'YV2A1234567890123',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El número VIN no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { 
    message: 'El número VIN solo puede contener letras mayúsculas y números' 
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  nroVin?: string;

  @ApiPropertyOptional({
    description: 'Número de motor del vehículo',
    example: 'D13F460EC06',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El número de motor no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { 
    message: 'El número de motor solo puede contener letras mayúsculas y números' 
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  nroMotor?: string;

  @ApiPropertyOptional({
    description: 'ID de la zona de operación',
    example: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de zona debe ser un número entero' })
  @Min(1, { message: 'El ID de zona debe ser mayor a 0' })
  @Type(() => Number)
  zonaOperacionId?: number;

  @ApiPropertyOptional({
    description: 'Capacidad del tanque de combustible en galones',
    example: 400.00,
    minimum: 1,
    maximum: 2000
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La capacidad del tanque debe ser un número decimal válido' })
  @Min(1, { message: 'La capacidad del tanque debe ser mayor a 1' })
  @Max(2000, { message: 'La capacidad del tanque no puede ser mayor a 2000' })
  @Type(() => Number)
  capacidadTanque?: number;

  @ApiPropertyOptional({
    description: 'Tipo de combustible que utiliza',
    example: 'DIESEL',
    enum: ['DIESEL', 'GASOLINA', 'GLP', 'GNV', 'ELECTRICO', 'HIBRIDO'],
    default: 'DIESEL'
  })
  @IsOptional()
  @IsString()
  @IsIn(['DIESEL', 'GASOLINA', 'GLP', 'GNV', 'ELECTRICO', 'HIBRIDO'], {
    message: 'El tipo de combustible debe ser: DIESEL, GASOLINA, GLP, GNV, ELECTRICO o HIBRIDO'
  })
  tipoCombustible?: string = 'DIESEL';

  @ApiPropertyOptional({
    description: 'Odómetro inicial en kilómetros',
    example: 50000.00,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El odómetro inicial debe ser un número decimal válido' })
  @Min(0, { message: 'El odómetro inicial no puede ser negativo' })
  @Type(() => Number)
  odometroInicial?: number = 0;

  @ApiPropertyOptional({
    description: 'Horómetro inicial en horas',
    example: 5000.00,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El horómetro inicial debe ser un número decimal válido' })
  @Min(0, { message: 'El horómetro inicial no puede ser negativo' })
  @Type(() => Number)
  horometroInicial?: number = 0;

  @ApiPropertyOptional({
    description: 'Fecha de adquisición del vehículo (YYYY-MM-DD)',
    example: '2020-03-15'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de adquisición debe tener formato válido YYYY-MM-DD' })
  fechaAdquisicion?: string;

  @ApiPropertyOptional({
    description: 'Estado operativo de la unidad',
    example: 'OPERATIVO',
    enum: ['OPERATIVO', 'MANTENIMIENTO', 'AVERIADO', 'FUERA_SERVICIO', 'EN_REVISION'],
    default: 'OPERATIVO'
  })
  @IsOptional()
  @IsString()
  @IsIn(['OPERATIVO', 'MANTENIMIENTO', 'AVERIADO', 'FUERA_SERVICIO', 'EN_REVISION'], {
    message: 'El estado debe ser: OPERATIVO, MANTENIMIENTO, AVERIADO, FUERA_SERVICIO o EN_REVISION'
  })
  estado?: string = 'OPERATIVO';

  @ApiPropertyOptional({
    description: 'Estado activo de la unidad',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}