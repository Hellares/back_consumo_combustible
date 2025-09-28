import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class UpdateUsuarioDto {
  @ApiPropertyOptional({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  nombres?: string;

  @ApiPropertyOptional({
    description: 'Apellidos del usuario',
    example: 'García López',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  apellidos?: string;

  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'juan.garcia@empresa.com',
    maxLength: 150
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+51987654321',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @ApiPropertyOptional({
    description: 'DNI del usuario',
    example: '12345678',
    maxLength: 15
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(/^[0-9]+$/, { message: 'DNI debe contener solo números' })
  @Transform(({ value }) => value?.trim())
  dni?: string;

  @ApiPropertyOptional({
    description: 'Código de empleado',
    example: 'EMP001',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  codigoEmpleado?: string;

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del empleado',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del usuario',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
