import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AsignarRolDto {
  @ApiProperty({
    description: 'ID del rol a asignar',
    example: 2
  })
  @IsNumber()
  rolId: number;

  @ApiPropertyOptional({
    description: 'ID del usuario que asigna el rol (para auditoría)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  asignadoPorId?: number;
}

export class RevocarRolDto {
  @ApiPropertyOptional({
    description: 'Motivo de la revocación del rol',
    example: 'Cambio de departamento'
  })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que revoca el rol (para auditoría)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  revocadoPorId?: number;
}

export class RolAsignadoResponseDto {
  // @ApiProperty()
  // id: number;

  @ApiProperty()
  usuarioId: number;

  // @ApiProperty()
  // rolId: number;

  @ApiProperty()
  fechaAsignacion: Date;

  @ApiProperty()
  fechaRevocacion?: Date;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  asignadoPorId?: number;

  @ApiProperty({
    description: 'Información del rol asignado'
  })
  rol: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}