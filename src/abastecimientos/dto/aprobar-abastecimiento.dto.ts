import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AprobarAbastecimientoDto {
  @ApiPropertyOptional({
    description: 'Observaciones del controlador sobre la aprobación',
    example: 'Documentos verificados correctamente, abastecimiento aprobado'
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  observacionesControlador?: string;
}