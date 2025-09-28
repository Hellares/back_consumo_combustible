import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ErrorCode } from '../filters/http-exception.filter';

export class StructuredError {
  @ApiProperty({ description: 'Mensaje de error', example: 'El usuario ya existe' })
  message: string;

  @ApiProperty({ description: 'Código de estado HTTP', example: 409 })
  status: number;

  @ApiProperty({ description: 'Código de error interno', enum: ErrorCode, example: ErrorCode.CONFLICT })
  code: ErrorCode;

  @ApiProperty({ description: 'Nombre del error', example: 'Conflicto de Negocio' })
  error?: string;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo del resultado', example: 'Usuario creado exitosamente' })
  message: string;

  @ApiProperty({ description: 'Datos retornados por la operación' })
  @Type(() => Object)
  data: T;
}