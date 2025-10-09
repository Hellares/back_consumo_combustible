import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UsuarioResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  apellidos: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  telefono?: string;

  @ApiPropertyOptional()
  dni?: string;

  @ApiPropertyOptional()
  codigoEmpleado?: string;

  @ApiPropertyOptional()
  fechaIngreso?: Date;

  @ApiProperty()
  activo: boolean;

  @ApiPropertyOptional({ type: [Object] }) // Array de roles activos: { id, nombre }
  roles?: { id: number; nombre: string }[];

  // @ApiProperty()
  // createdAt: Date;

  // @ApiProperty()
  // updatedAt: Date;


}

// DTO para respuesta paginada
export class PaginatedUsuarioResponseDto {
  @ApiProperty({ type: [UsuarioResponseDto] })
  data: UsuarioResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}