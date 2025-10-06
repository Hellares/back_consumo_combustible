import { IsOptional, IsInt, IsString, IsDateString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDetalleDto {
  // ========================================
  // FILTROS DE UBICACIÓN
  // ========================================
  
  @ApiPropertyOptional({ 
    description: 'Filtrar por grifo específico (prioridad 1)', 
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  grifoId?: number;

  @ApiPropertyOptional({ 
    description: 'Filtrar por todos los grifos de una sede (prioridad 2)', 
    example: 2 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sedeId?: number;

  @ApiPropertyOptional({ 
    description: 'Filtrar por todos los grifos de una zona (prioridad 3)', 
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  zonaId?: number;

  // ========================================
  // PAGINACIÓN
  // ========================================

  @ApiPropertyOptional({ description: 'Número de página', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Tamaño de página', example: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  // ========================================
  // FILTROS DE BÚSQUEDA
  // ========================================

  @ApiPropertyOptional({ description: 'Filtrar por ID de ticket', example: 123 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ticketId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por placa de unidad', example: 'ABC-123' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  placa?: string;

  @ApiPropertyOptional({ description: 'Filtrar por controlador ID', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  controladorId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por aprobador ID', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  aprobadoPorId?: number;

  // ========================================
  // FILTROS DE FECHA
  // ========================================

  @ApiPropertyOptional({ 
    description: 'Fecha desde (ISO)', 
    example: '2025-01-01' 
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha hasta (ISO)', 
    example: '2025-12-31' 
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  // ========================================
  // FILTROS DE DOCUMENTOS
  // ========================================

  @ApiPropertyOptional({ description: 'Buscar en número ticket grifo', example: 'TG-12345' })
  @IsOptional()
  @IsString()
  numeroTicketGrifo?: string;

  @ApiPropertyOptional({ description: 'Buscar en número factura', example: 'F001-00123' })
  @IsOptional()
  @IsString()
  numeroFactura?: string;

  // ========================================
  // ORDENAMIENTO
  // ========================================

  @ApiPropertyOptional({ description: 'Ordenar por campo', example: 'fechaAprobacion' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'fechaAprobacion';

  @ApiPropertyOptional({ description: 'Dirección de orden', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}