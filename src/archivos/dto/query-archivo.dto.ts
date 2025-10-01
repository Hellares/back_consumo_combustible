import { 
  IsOptional, 
  IsInt, 
  IsBoolean, 
  IsString,
  IsEnum,
  Min 
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Enum para categorías de archivo
 */
export enum CategoriaArchivo {
  IMAGEN = 'IMAGEN',
  DOCUMENTO = 'DOCUMENTO',
  COMPROBANTE = 'COMPROBANTE'
}

/**
 * DTO para filtrar y buscar archivos
 */
export class QueryArchivoDto {
  @ApiPropertyOptional({ 
    description: 'Filtrar por ID de ticket', 
    example: 5,
    type: 'integer'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ticketId debe ser un número entero' })
  @Min(1, { message: 'ticketId debe ser mayor a 0' })
  ticketId?: number;

  @ApiPropertyOptional({ 
    description: 'Filtrar por tipo de archivo específico', 
    example: 1,
    type: 'integer'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'tipoArchivoId debe ser un número entero' })
  @Min(1, { message: 'tipoArchivoId debe ser mayor a 0' })
  tipoArchivoId?: number;

  @ApiPropertyOptional({ 
    description: 'Filtrar por categoría de archivo', 
    example: 'IMAGEN',
    enum: CategoriaArchivo,
    enumName: 'CategoriaArchivo'
  })
  @IsOptional()
  @IsEnum(CategoriaArchivo, { 
    message: 'categoria debe ser IMAGEN, DOCUMENTO o COMPROBANTE' 
  })
  @Transform(({ value }) => value?.toUpperCase())
  categoria?: CategoriaArchivo;

  @ApiPropertyOptional({ 
    description: 'Filtrar solo archivos marcados como principales', 
    example: true,
    type: 'boolean',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'solosPrincipales debe ser verdadero o falso' })
  solosPrincipales?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filtrar por estado activo (true) o eliminados (false)', 
    example: true,
    type: 'boolean',
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true;
  })
  @IsBoolean({ message: 'activo debe ser verdadero o falso' })
  activo?: boolean;

  @ApiPropertyOptional({ 
    description: 'Buscar por nombre de archivo (búsqueda parcial)', 
    example: 'tablero',
    minLength: 3
  })
  @IsOptional()
  @IsString({ message: 'search debe ser un texto' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Ordenar por campo específico', 
    example: 'fechaSubida',
    enum: ['fechaSubida', 'orden', 'nombreArchivo', 'tamanoBytes'],
    default: 'fechaSubida'
  })
  @IsOptional()
  @IsString()
  orderBy?: 'fechaSubida' | 'orden' | 'nombreArchivo' | 'tamanoBytes';

  @ApiPropertyOptional({ 
    description: 'Dirección del ordenamiento', 
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { 
    message: 'orderDirection debe ser asc o desc' 
  })
  @Transform(({ value }) => value?.toLowerCase())
  orderDirection?: 'asc' | 'desc';

  @ApiPropertyOptional({ 
    description: 'Número de página para paginación', 
    example: 1,
    type: 'integer',
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page?: number;

  @ApiPropertyOptional({ 
    description: 'Cantidad de registros por página', 
    example: 20,
    type: 'integer',
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  limit?: number;
}

/**
 * DTO para respuesta paginada de archivos
 */
export class PaginatedArchivoResponseDto {
  @ApiPropertyOptional({ 
    description: 'Lista de archivos',
    type: 'array',
    isArray: true
  })
  data: any[];

  @ApiPropertyOptional({ 
    description: 'Metadatos de paginación',
    type: 'object',
    properties: {
      total: { type: 'number', example: 50 },
      page: { type: 'number', example: 1 },
      pageSize: { type: 'number', example: 20 },
      totalPages: { type: 'number', example: 3 },
      hasNextPage: { type: 'boolean', example: true },
      hasPreviousPage: { type: 'boolean', example: false }
    }
  })
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * DTO para marcar archivo como principal
 */
export class SetPrincipalDto {
  @ApiPropertyOptional({ 
    description: 'ID del ticket (requerido para validar que el archivo pertenece al ticket)', 
    example: 5,
    type: 'integer'
  })
  @Type(() => Number)
  @IsInt({ message: 'ticketId debe ser un número entero' })
  @Min(1, { message: 'ticketId debe ser mayor a 0' })
  ticketId: number;
}

/**
 * DTO para estadísticas de archivos
 */
export class EstadisticasArchivoDto {
  @ApiPropertyOptional({ 
    description: 'Total de archivos del ticket',
    example: 8
  })
  totalArchivos: number;

  @ApiPropertyOptional({ 
    description: 'Total de imágenes',
    example: 5
  })
  totalImagenes: number;

  @ApiPropertyOptional({ 
    description: 'Total de documentos',
    example: 2
  })
  totalDocumentos: number;

  @ApiPropertyOptional({ 
    description: 'Total de comprobantes',
    example: 1
  })
  totalComprobantes: number;

  @ApiPropertyOptional({ 
    description: 'Tamaño total en bytes',
    example: 2458960
  })
  tamanoTotalBytes: number;

  @ApiPropertyOptional({ 
    description: 'Tamaño total formateado',
    example: '2.34 MB'
  })
  tamanoTotalFormateado: string;

  @ApiPropertyOptional({ 
    description: 'Detalles por tipo de archivo',
    type: 'array',
    isArray: true
  })
  detallesPorTipo: {
    tipoArchivo: {
      id: number;
      codigo: string;
      nombre: string;
      categoria: string;
    };
    cantidad: number;
    tamanoTotal: number;
  }[];
}