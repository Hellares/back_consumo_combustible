import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  MaxLength, 
  MinLength,
  IsNotEmpty,
  Matches
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateZonaDto {
  @ApiProperty({
    description: 'Nombre de la zona',
    example: 'Lima Metropolitana',
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
    description: 'Código único de la zona',
    example: 'LIMA',
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
    description: 'Descripción de la zona',
    example: 'Zona de operaciones en Lima y alrededores'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la zona',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
