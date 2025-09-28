import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export enum TicketOrderBy {
  FECHA = 'fecha',
  NUMERO_TICKET = 'numeroTicket',
  UNIDAD = 'unidad',
  CONDUCTOR = 'conductor',
  CANTIDAD = 'cantidad',
  ESTADO = 'estado'
}

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export class QueryTicketDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página (máximo 100)',
    example: 20,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Texto de búsqueda (número de ticket, placa, conductor)',
    example: 'TK-2024-001234'
  })
  @IsOptional()
  @IsString({ message: 'El texto de búsqueda debe ser una cadena' })
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
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de grifo debe ser un número' })
  grifoId?: number;

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
  @IsString({ message: 'El tipo de combustible debe ser una cadena' })
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
    description: 'Solo tickets pendientes de aprobación',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El filtro de pendientes debe ser verdadero o falso' })
  solosPendientes?: boolean;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: TicketOrderBy,
    default: TicketOrderBy.FECHA
  })
  @IsOptional()
  @IsEnum(TicketOrderBy, { message: 'Campo de ordenamiento inválido' })
  orderBy: TicketOrderBy = TicketOrderBy.FECHA;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: OrderDirection,
    default: OrderDirection.DESC
  })
  @IsOptional()
  @IsEnum(OrderDirection, { message: 'Dirección de ordenamiento inválida' })
  orderDirection: OrderDirection = OrderDirection.DESC;
}