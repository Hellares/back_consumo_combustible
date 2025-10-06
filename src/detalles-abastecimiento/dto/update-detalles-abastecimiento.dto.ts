import { 
  IsOptional, 
  IsString, 
  IsDecimal, 
  IsInt,
  MaxLength,
  Min,
  IsNumber,
  IsEnum,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

// 🆕 Enum para el estado del detalle
export enum EstadoDetalle {
  EN_PROGRESO = 'EN_PROGRESO',
  CONCLUIDO = 'CONCLUIDO'
}

export class UpdateDetalleDto {
  @ApiPropertyOptional({
    description: 'Cantidad real abastecida (puede diferir de la solicitada)',
    example: 48.5
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Type(() => Number)
  cantidadAbastecida?: number;

  @ApiPropertyOptional({
    description: 'Motivo de la diferencia entre cantidad solicitada y abastecida',
    example: 'Tanque no tenía capacidad completa',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivoDiferencia?: string;

  @ApiPropertyOptional({
    description: 'Horómetro actual de la unidad',
    example: 12345.50
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  horometroActual?: number;

  @ApiPropertyOptional({ 
    description: 'Horómetro anterior de la unidad',
    example: 12100.00 
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  horometroAnterior?: number;

  @ApiPropertyOptional({ 
    description: 'Código del precinto anterior',
    example: 'PREC-001',
    maxLength: 50 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  precintoAnterior?: string;

  @ApiPropertyOptional({ 
    description: 'Código del segundo precinto',
    example: 'PREC-002',
    maxLength: 50 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  precinto2?: string;

  @ApiPropertyOptional({ 
    description: 'Unidad de medida del combustible',
    example: 'GALONES',
    maxLength: 10,
    default: 'GALONES'
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  unidadMedida?: string;

  @ApiPropertyOptional({ 
    description: 'Costo por unidad de combustible',
    example: 15.5000 
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  costoPorUnidad?: number;

  @ApiPropertyOptional({ 
    description: 'Costo total del abastecimiento',
    example: 232.50 
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  costoTotal?: number;

  @ApiPropertyOptional({ 
    description: 'Número de ticket emitido por el grifo',
    example: 'TG-2025-0456',
    maxLength: 50 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroTicketGrifo?: string;

  @ApiPropertyOptional({ 
    description: 'Número de vale de diesel',
    example: 'VD-789',
    maxLength: 50 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  valeDiesel?: string;

  @ApiPropertyOptional({ 
    description: 'Número de factura',
    example: 'F001-00123',
    maxLength: 50 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroFactura?: string;

  @ApiPropertyOptional({ 
    description: 'Importe de la factura',
    example: 250.00 
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  importeFactura?: number;

  @ApiPropertyOptional({ 
    description: 'Número de requerimiento',
    example: 'REQ-2025-456' 
  })
  @IsOptional()
  @IsString()
  requerimiento?: string;

  @ApiPropertyOptional({ 
    description: 'Número de salida de almacén',
    example: 'SA-2025-789',
    maxLength: 50 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroSalidaAlmacen?: string;

  @ApiPropertyOptional({ 
    description: 'Observaciones del controlador',
    example: 'Se verificó el precinto correctamente. Todo en orden.' 
  })
  @IsOptional()
  @IsString()
  observacionesControlador?: string;

  @ApiPropertyOptional({ 
    description: 'ID del usuario controlador',
    example: 5 
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  controladorId?: number;
}