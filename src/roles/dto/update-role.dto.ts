import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { PermisosDto } from "./create-role.dto";

export class UpdateRolDto {
  @ApiPropertyOptional({
    description: 'Nombre del rol',
    example: 'Supervisor de Flota',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Encargado de supervisar las operaciones de la flota de vehículos'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Permisos del rol en formato JSON',
    type: PermisosDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PermisosDto)
  permisos?: PermisosDto;

  @ApiPropertyOptional({
    description: 'Estado activo del rol',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}