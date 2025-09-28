import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class UsuarioBasicInfo {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombres del usuario', example: 'Juan Carlos' })
  @Expose()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del usuario', example: 'García López' })
  @Expose()
  apellidos: string;

  @ApiPropertyOptional({ description: 'DNI del usuario', example: '12345678' })
  @Expose()
  dni?: string;

  @ApiPropertyOptional({ description: 'Código de empleado', example: 'EMP001' })
  @Expose()
  codigoEmpleado?: string;
}

export class LicenciaConducirResponseDto {
  @ApiProperty({
    description: 'ID único de la licencia',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'ID del usuario al que pertenece',
    example: 1
  })
  @Expose()
  usuarioId: number;

  @ApiProperty({
    description: 'Número de la licencia de conducir',
    example: 'Q12345678'
  })
  @Expose()
  numeroLicencia: string;

  @ApiProperty({
    description: 'Categoría de la licencia',
    example: 'A-IIb'
  })
  @Expose()
  categoria: string;

  @ApiProperty({
    description: 'Fecha de emisión',
    example: '2023-01-15'
  })
  @Expose()
  fechaEmision: string;

  @ApiProperty({
    description: 'Fecha de expiración',
    example: '2030-01-15'
  })
  @Expose()
  fechaExpiracion: string;

  @ApiPropertyOptional({
    description: 'Entidad que emitió la licencia',
    example: 'Ministerio de Transportes y Comunicaciones'
  })
  @Expose()
  entidadEmisora?: string;

  @ApiProperty({
    description: 'Estado activo de la licencia',
    example: true
  })
  @Expose()
  activo: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-15T10:30:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-15T10:30:00.000Z'
  })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Información básica del usuario',
    type: UsuarioBasicInfo
  })
  @Expose()
  @Type(() => UsuarioBasicInfo)
  usuario?: UsuarioBasicInfo;

  @ApiProperty({
    description: 'Días restantes hasta la expiración',
    example: 365
  })
  @Expose()
  diasRestantes?: number;

  @ApiProperty({
    description: 'Indica si la licencia está vencida',
    example: false
  })
  @Expose()
  estaVencida?: boolean;

  @ApiProperty({
    description: 'Indica si la licencia está próxima a vencer (menos de 90 días)',
    example: false
  })
  @Expose()
  proximaVencimiento?: boolean;

  @ApiProperty({
    description: 'Estado de vigencia de la licencia',
    example: 'VIGENTE',
    enum: ['VIGENTE', 'PRÓXIMO_VENCIMIENTO', 'VENCIDA']
  })
  @Expose()
  estadoVigencia?: string;
}