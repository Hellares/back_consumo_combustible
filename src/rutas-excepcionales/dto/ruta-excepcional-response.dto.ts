import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta simplificado para Unidad
 */
export class UnidadSimpleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ABC-123' })
  placa: string;

  @ApiProperty({ example: 'VOLVO' })
  marca: string;

  @ApiProperty({ example: 'FH16' })
  modelo: string;
}

/**
 * DTO de respuesta simplificado para Ruta
 */
export class RutaSimpleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Trujillo - Piura Directo' })
  nombre: string;

  @ApiPropertyOptional({ example: 'RUT-001' })
  codigo?: string;

  @ApiPropertyOptional({ example: 'Trujillo' })
  origen?: string;

  @ApiPropertyOptional({ example: 'Piura' })
  destino?: string;

  @ApiPropertyOptional({ example: 380.5 })
  distanciaKm?: number;

  @ApiPropertyOptional({ example: 300 })
  tiempoEstimadoMinutos?: number;
}

/**
 * DTO de respuesta simplificado para Usuario
 */
export class UsuarioSimpleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Juan' })
  nombres: string;

  @ApiProperty({ example: 'Pérez García' })
  apellidos: string;
}

/**
 * DTO de respuesta completo para ruta excepcional
 */
export class RutaExcepcionalResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  unidadId: number;

  @ApiProperty({ type: UnidadSimpleDto })
  unidad: UnidadSimpleDto;

  @ApiProperty({ example: 15 })
  rutaId: number;

  @ApiProperty({ type: RutaSimpleDto })
  ruta: RutaSimpleDto;

  @ApiProperty({ example: true })
  esUnaVez: boolean;

  @ApiProperty({ example: '2025-10-25T00:00:00.000Z' })
  fechaAsignacion: Date;

  @ApiPropertyOptional({ example: null })
  fechaDesasignacion?: Date;

  @ApiProperty({ example: '2025-10-25' })
  fechaViajeEspecifico: string;

  @ApiProperty({ example: 'EMERGENCIA' })
  motivoAsignacion: string;

  @ApiPropertyOptional({ example: 'Transporte urgente de insumos médicos' })
  descripcionMotivo?: string;

  @ApiProperty({ example: 'NORMAL', enum: ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] })
  prioridad: string;

  @ApiProperty({ example: true })
  requiereAutorizacion: boolean;

  @ApiPropertyOptional({ example: 2 })
  autorizadoPorId?: number;

  @ApiPropertyOptional({ type: UsuarioSimpleDto })
  autorizadoPor?: UsuarioSimpleDto;

  @ApiPropertyOptional({ example: '2025-10-24T15:30:00.000Z' })
  fechaAutorizacion?: Date;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiPropertyOptional({ example: 1 })
  asignadoPorId?: number;

  @ApiPropertyOptional({ type: UsuarioSimpleDto })
  asignadoPor?: UsuarioSimpleDto;

  @ApiPropertyOptional({ example: 'Coordinar con conductor 2 horas antes' })
  observaciones?: string;

  @ApiProperty({ example: '2025-10-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-23T10:00:00.000Z' })
  updatedAt: Date;
}

