import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';

enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

enum TurnoOrderBy {
  ID = 'id',
  NOMBRE = 'nombre',
  HORA_INICIO = 'horaInicio',
  HORA_FIN = 'horaFin',
  CREATED_AT = 'createdAt'
}

export class QueryTurnoDto {
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
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Texto de búsqueda para filtrar por nombre',
    example: 'MAÑANA'
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El filtro activo debe ser verdadero o falso' })
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    enum: TurnoOrderBy,
    default: TurnoOrderBy.NOMBRE
  })
  @IsOptional()
  @IsEnum(TurnoOrderBy, { message: 'Campo de ordenamiento inválido' })
  orderBy: TurnoOrderBy = TurnoOrderBy.NOMBRE;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: OrderDirection,
    default: OrderDirection.ASC
  })
  @IsOptional()
  @IsEnum(OrderDirection, { message: 'Dirección de ordenamiento inválida' })
  orderDirection: OrderDirection = OrderDirection.ASC;
}