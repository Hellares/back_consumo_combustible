import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsInt,
  MaxLength, 
  MinLength,
  IsNotEmpty,
  Matches,
  Min,
  IsDateString
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateGrifoDto {
  @ApiProperty({
    description: 'ID de la sede a la que pertenece el grifo',
    example: 1
  })
  @IsInt({ message: 'El ID de sede debe ser un número entero' })
  @Min(1, { message: 'El ID de sede debe ser mayor a 0' })
  @Type(() => Number)
  sedeId: number;

  @ApiProperty({
    description: 'Nombre del grifo/punto de abastecimiento',
    example: 'Grifo Central A',
    maxLength: 100,
    minLength: 3
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código único del grifo',
    example: 'GRF001',
    maxLength: 10
  })
  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'El código no puede exceder 10 caracteres' })
  @Matches(/^[A-Z0-9_-]+$/, { 
    message: 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos' 
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del grifo',
    example: 'Av. Secundaria 456, Lima, Perú'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del grifo',
    example: '01-9876543',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { 
    message: 'El teléfono solo puede contener números, espacios, guiones, + y paréntesis' 
  })
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Horario de apertura (formato HH:MM)',
    example: '06:00'
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El horario de apertura debe tener formato HH:MM (24 horas)'
  })
  horarioApertura?: string;

  @ApiPropertyOptional({
    description: 'Horario de cierre (formato HH:MM)',
    example: '22:00'
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El horario de cierre debe tener formato HH:MM (24 horas)'
  })
  horarioCierre?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del grifo',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
