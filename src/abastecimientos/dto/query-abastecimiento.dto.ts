import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsInt, 
  Min, 
  Max,
  IsDateString,
  IsBoolean
} from 'class-validator';

enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

enum AbastecimientoOrderBy {
  ID = 'id',
  FECHA = 'fecha',
  HORA = 'hora',
  NUMERO_ABASTECIMIENTO = 'numeroAbastecimiento',
  CANTIDAD = 'cantidad',
  COSTO_TOTAL = 'costoTotal',
  KILOMETRAJE_ACTUAL = 'kilometrajeActual',
  CREATED_AT = 'createdAt'
}

export class QueryAbastecimientoDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Texto de búsqueda (número de abastecimiento, placa, conductor)',
    example: 'ABC-123'
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de unidad',
    example: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de unidad debe ser un número' })
  unidadId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de conductor',
    example: 3
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de conductor debe ser un número' })
  conductorId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de grifo',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de grifo debe ser un número' })
  grifoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de turno',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de turno debe ser un número' })
  turnoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de estado',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de estado debe ser un número' })
  estadoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de combustible',
    example: 'DIESEL'
  })
  @IsOptional()
  @IsString({ message: 'El tipo de combustible debe ser una cadena de texto' })
  tipoCombustible?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe tener formato YYYY-MM-DD válido' })
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener formato YYYY-MM-DD válido' })
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo abastecimientos pendientes de aprobación',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El filtro de pendientes debe ser verdadero o falso' })
  solosPendientes?: boolean;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    enum: AbastecimientoOrderBy,
    default: AbastecimientoOrderBy.FECHA
  })
  @IsOptional()
  @IsEnum(AbastecimientoOrderBy, { message: 'Campo de ordenamiento inválido' })
  orderBy: AbastecimientoOrderBy = AbastecimientoOrderBy.FECHA;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: OrderDirection,
    default: OrderDirection.DESC
  })
  @IsOptional()
  @IsEnum(OrderDirection, { message: 'Dirección de ordenamiento inválida' })
  orderDirection: OrderDirection = OrderDirection.DESC;
}