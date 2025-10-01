import { 
  IsInt, 
  IsOptional, 
  IsString, 
  IsBoolean,
  MaxLength,
  Min 
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadArchivoDto {
  @ApiProperty({
    description: 'ID del ticket al que pertenece el archivo',
    example: 1,
    type: 'integer'
  })
  @Type(() => Number)
  @IsInt({ message: 'El ticketId debe ser un número entero' })
  @Min(1, { message: 'El ticketId debe ser mayor a 0' })
  ticketId: number;

  @ApiProperty({
    description: 'ID del tipo de archivo (FOTO_GRIFO, FOTO_TABLERO, COMPROBANTE_PAGO, etc.)',
    example: 1,
    type: 'integer'
  })
  @Type(() => Number)
  @IsInt({ message: 'El tipoArchivoId debe ser un número entero' })
  @Min(1, { message: 'El tipoArchivoId debe ser mayor a 0' })
  tipoArchivoId: number;

  @ApiPropertyOptional({
    description: 'Descripción o comentario del archivo',
    example: 'Foto del tablero mostrando kilometraje de 125,420 km',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización del archivo (menor número = mayor prioridad)',
    example: 1,
    type: 'integer',
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden debe ser mayor o igual a 0' })
  orden?: number;

  @ApiPropertyOptional({
    description: 'Marcar como archivo principal del ticket (solo puede haber uno por ticket)',
    example: false,
    type: 'boolean',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  @IsBoolean({ message: 'esPrincipal debe ser verdadero o falso' })
  esPrincipal?: boolean;
}