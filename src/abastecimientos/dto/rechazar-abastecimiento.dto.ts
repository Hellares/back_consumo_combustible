import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RechazarAbastecimientoDto {
  @ApiProperty({
    description: 'Motivo del rechazo del abastecimiento',
    example: 'Falta documentación requerida, kilometraje inconsistente'
  })
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
  @IsString({ message: 'El motivo de rechazo debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  motivoRechazo: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del controlador',
    example: 'Se requiere presentar ticket original y verificar kilometraje'
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  observacionesControlador?: string;
}