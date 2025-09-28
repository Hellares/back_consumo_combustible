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

  // @ApiProperty()
  // createdAt: Date;

  // @ApiProperty()
  // updatedAt: Date;

  
}