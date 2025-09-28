import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ description: 'DNI del usuario (8 dígitos)', example: '44885296' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos' })
  dni: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: '44885296' })
  @IsString()
  @IsNotEmpty()
  password: string;
}