import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsBoolean, 
  IsDateString, 
  MaxLength, 
  MinLength,
  Matches,
  IsNotEmpty
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  nombres: string;//!-----

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'García López',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  apellidos: string;//!-----

  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'juan.garcia@empresa.com',
    maxLength: 150
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;//!-----

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+51987654321',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  telefono?: string;//!-----

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
  dni?: string;//!-----

  @ApiProperty({ 
    description: 'Código del empleado (se asignará automáticamente el valor del DNI si no se proporciona)', 
    example: '12345678', 
    required: false 
  })
  @IsString()
  @IsOptional()
  codigoEmpleado?: string;//!-----

  @ApiProperty({ 
    description: 'Contraseña del usuario (se asignará automáticamente el valor del DNI si no se proporciona)', 
    example: '12345678', 
    required: false 
  })
  @IsString()
  @IsOptional()
  password?: string;//!-----

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del empleado',
    example: '2025-01-15'
  })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;//!-----

  @ApiPropertyOptional({
    description: 'Estado activo del usuario',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;//!-----

   

}