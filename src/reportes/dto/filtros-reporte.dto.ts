import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsDateString, IsInt, IsEnum, IsString, Min } from 'class-validator';

export enum FormatoExportacion {
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export enum TipoReporte {
  ABASTECIMIENTOS = 'abastecimientos',
  CONSUMO_POR_UNIDAD = 'consumo_por_unidad',
  ESTADISTICAS_GRIFO = 'estadisticas_grifo',
  RENDIMIENTO = 'rendimiento'
}

export class FiltrosReporteDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del reporte (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del reporte (YYYY-MM-DD)',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'ID de la zona para filtrar',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  zonaId?: number;

  @ApiPropertyOptional({
    description: 'ID de la sede para filtrar',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sedeId?: number;

  @ApiPropertyOptional({
    description: 'ID del grifo para filtrar',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  grifoId?: number;

  @ApiPropertyOptional({
    description: 'ID de la unidad para filtrar',
    example: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  unidadId?: number;

  @ApiPropertyOptional({
    description: 'Placa de la unidad para filtrar',
    example: 'ABC-123'
  })
  @IsOptional()
  @IsString()
  placa?: string;

  @ApiPropertyOptional({
    description: 'ID del conductor para filtrar',
    example: 3
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  conductorId?: number;

  @ApiPropertyOptional({
    description: 'ID de la ruta para filtrar',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rutaId?: number;

  @ApiPropertyOptional({
    description: 'Estado del ticket para filtrar',
    example: 'APROBADO',
    enum: ['SOLICITADO', 'APROBADO', 'RECHAZADO', 'CONCLUIDO']
  })
  @IsOptional()
  @IsString()
  estadoTicket?: string;

  @ApiPropertyOptional({
    description: 'Tipo de combustible para filtrar',
    example: 'DIESEL'
  })
  @IsOptional()
  @IsString()
  tipoCombustible?: string;

  @ApiPropertyOptional({
    description: 'Formato de exportación',
    enum: FormatoExportacion,
    default: FormatoExportacion.EXCEL,
    example: 'excel'
  })
  @IsOptional()
  @IsEnum(FormatoExportacion)
  formato?: FormatoExportacion = FormatoExportacion.EXCEL;

  @ApiPropertyOptional({
    description: 'Tipo de reporte a generar',
    enum: TipoReporte,
    default: TipoReporte.ABASTECIMIENTOS,
    example: 'abastecimientos'
  })
  @IsOptional()
  @IsEnum(TipoReporte)
  tipoReporte?: TipoReporte = TipoReporte.ABASTECIMIENTOS;

  @ApiPropertyOptional({
    description: 'Incluir solo tickets con detalle completado',
    example: false,
    default: false
  })
  @IsOptional()
  @Type(() => Boolean)
  soloCompletados?: boolean = false;
}