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
  Min
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSedeDto {
  @ApiProperty({
    description: 'ID de la zona a la que pertenece la sede',
    example: 1
  })
  @IsInt({ message: 'El ID de zona debe ser un número entero' })
  @Min(1, { message: 'El ID de zona debe ser mayor a 0' })
  @Type(() => Number)
  zonaId: number;

  @ApiProperty({
    description: 'Nombre de la sede',
    example: 'Sede Central Lima',
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
    description: 'Código único de la sede',
    example: 'SEDE01',
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
    description: 'Dirección física de la sede',
    example: 'Av. Principal 123, Lima, Perú'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de la sede',
    example: '01-1234567',
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
    description: 'Estado activo de la sede',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
