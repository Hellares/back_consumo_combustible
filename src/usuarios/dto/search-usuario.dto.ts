// src/usuarios/dto/search-usuario.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchUsuarioDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'DNI o código de empleado para buscar (parcial e insensible a mayúsculas)',
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiPropertyOptional({
    description: 'Nombre o apellido parcial para buscar (insensible a mayúsculas)',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  nombre?: string;
}