import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DesasignarDto {
  @ApiPropertyOptional({ description: 'Motivo de la desasignación', example: 'Mantenimiento programado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}