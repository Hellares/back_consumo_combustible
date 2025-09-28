import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsInt,
  IsDateString,
  MaxLength, 
  MinLength,
  IsNotEmpty,
  Matches,
  Min,
  IsDate
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateLicenciaConducirDto {
  @ApiProperty({
    description: 'ID del usuario al que pertenece la licencia',
    example: 1
  })
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Min(1, { message: 'El ID de usuario debe ser mayor a 0' })
  @Type(() => Number)
  usuarioId: number;

  @ApiProperty({
    description: 'Número de la licencia de conducir',
    example: 'Q12345678',
    maxLength: 50,
    minLength: 5
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de licencia es obligatorio' })
  @MinLength(5, { message: 'El número de licencia debe tener al menos 5 caracteres' })
  @MaxLength(50, { message: 'El número de licencia no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { 
    message: 'El número de licencia solo puede contener letras mayúsculas y números' 
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  numeroLicencia: string;

  @ApiProperty({
    description: 'Categoría de la licencia',
    example: 'A-IIb',
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @MaxLength(20, { message: 'La categoría no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  categoria: string;

  @ApiProperty({
    description: 'Fecha de emisión de la licencia (YYYY-MM-DD)',
    example: '2023-01-15'
  })
  @IsNotEmpty({ message: 'La fecha de emisión es obligatoria' })
  @IsDateString({}, { message: 'La fecha de emisión debe tener formato válido YYYY-MM-DD' })
  fechaEmision: string;

  @ApiProperty({
    description: 'Fecha de expiración de la licencia (YYYY-MM-DD)',
    example: '2030-01-15'
  })
  @IsNotEmpty({ message: 'La fecha de expiración es obligatoria' })
  @IsDateString({}, { message: 'La fecha de expiración debe tener formato válido YYYY-MM-DD' })
  fechaExpiracion: string;

  @ApiPropertyOptional({
    description: 'Entidad que emitió la licencia',
    example: 'Ministerio de Transportes y Comunicaciones',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La entidad emisora no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  entidadEmisora?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la licencia',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
