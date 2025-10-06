// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Decimal } from '@prisma/client/runtime/library';

// // DTO para Usuario resumido
// class UsuarioResumidoDto {
//   @ApiProperty({ example: 1 })
//   id: number;

//   @ApiProperty({ example: 'Juan Pérez' })
//   nombreCompleto: string;

//   @ApiPropertyOptional({ example: 'juan.perez@example.com' })
//   email?: string;
// }

// // DTO para Ticket resumido
// class TicketResumidoDto {
//   @ApiProperty({ example: 1 })
//   id: number;

//   @ApiProperty({ example: 'TKT-2025-00123' })
//   numeroTicket: string;

//   @ApiProperty({ example: '2025-01-15' })
//   fecha: Date;

//   @ApiProperty({ example: '14:30:00' })
//   hora: Date;

//   @ApiProperty({ example: 'ABC-123' })
//   placaUnidad: string;

//   @ApiProperty({ example: 'TOYOTA HILUX' })
//   unidadDescripcion: string;

//   @ApiPropertyOptional({ example: 'Juan Conductor' })
//   conductorNombre?: string;

//   @ApiPropertyOptional({ example: 'Grifo Central' })
//   grifoNombre?: string;

//   @ApiPropertyOptional({ example: 'Estado' })
//   estado?: string;
// }

// export class DetalleAbastecimientoResponseDto {
//   @ApiProperty({ example: 1 })
//   id: number;

//   @ApiProperty({ example: 1 })
//   ticketId: number;

//   @ApiPropertyOptional({ example: '12345.50' })
//   horometroActual?: Decimal;

//   @ApiPropertyOptional({ example: '12100.00' })
//   horometroAnterior?: Decimal;

//   @ApiPropertyOptional({ example: 'PREC-001' })
//   precintoAnterior?: string;

//   @ApiPropertyOptional({ example: 'PREC-002' })
//   precinto2?: string;

//   @ApiProperty({ example: 'GALONES' })
//   unidadMedida: string;

//   @ApiProperty({ example: '15.5000' })
//   costoPorUnidad: Decimal;

//   @ApiProperty({ example: '232.50' })
//   costoTotal: Decimal;

//   @ApiPropertyOptional({ example: 'TG-2025-0456' })
//   numeroTicketGrifo?: string;

//   @ApiPropertyOptional({ example: 'VD-789' })
//   valeDiesel?: string;

//   @ApiPropertyOptional({ example: 'F001-00123' })
//   numeroFactura?: string;

//   @ApiPropertyOptional({ example: '250.00' })
//   importeFactura?: Decimal;

//   @ApiPropertyOptional({ example: 'REQ-2025-456' })
//   requerimiento?: string;

//   @ApiPropertyOptional({ example: 'SA-2025-789' })
//   numeroSalidaAlmacen?: string;

//   @ApiPropertyOptional({ example: 'Se verificó el precinto correctamente' })
//   observacionesControlador?: string;

//   @ApiPropertyOptional()
//   controladorId?: number;

//   @ApiProperty({ example: 2 })
//   aprobadoPorId: number;

//   @ApiProperty({ example: '2025-01-15T14:35:00.000Z' })
//   fechaAprobacion: Date;

//   @ApiProperty({ example: '2025-01-15T14:35:00.000Z' })
//   createdAt: Date;

//   @ApiProperty({ example: '2025-01-15T14:35:00.000Z' })
//   updatedAt: Date;

//   // Relaciones expandidas
//   @ApiProperty({ type: TicketResumidoDto })
//   ticket: TicketResumidoDto;

//   @ApiPropertyOptional({ type: UsuarioResumidoDto })
//   controlador?: UsuarioResumidoDto;

//   @ApiProperty({ type: UsuarioResumidoDto })
//   aprobadoPor: UsuarioResumidoDto;
// }

// DTO para Ticket resumido
// class TicketResimport { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

// DTO para Usuario resumido
class UsuarioResumidoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Juan Pérez' })
  nombreCompleto: string;

  @ApiPropertyOptional({ example: 'juan.perez@example.com' })
  email?: string;
}

// DTO para Ticket resumido
class TicketResumidoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TKT-2025-00123' })
  numeroTicket: string;

  @ApiProperty({ example: '2025-01-15' })
  fecha: Date;

  @ApiProperty({ example: '14:30:00' })
  hora: Date;

  @ApiProperty({ example: 'ABC-123' })
  placaUnidad: string;

  @ApiProperty({ example: 'TOYOTA HILUX' })
  unidadDescripcion: string;

  @ApiPropertyOptional({ example: 'Juan Conductor' })
  conductorNombre?: string;

  @ApiPropertyOptional({ example: 'Grifo Central' })
  grifoNombre?: string;

  // 🆕 CANTIDAD DE GALONES SOLICITADOS
  @ApiProperty({ example: 44, description: 'Cantidad de galones solicitados en el ticket' })
  cantidad: number;

  // 🆕 ESTADO DEL TICKET
  @ApiProperty({ example: 'APROBADO' })
  estadoTicket: string;

  @ApiPropertyOptional({ example: '#28a745' })
  estadoColor?: string;
}

export class DetalleAbastecimientoResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  ticketId: number;

  @ApiPropertyOptional({
    example: 48.5,
    description: 'Cantidad real abastecida (puede diferir de la solicitada en el ticket)'
  })
  cantidadAbastecida?: number;

  @ApiPropertyOptional({
    example: 'Tanque no tenía capacidad completa',
    description: 'Motivo de la diferencia entre cantidad solicitada y abastecida'
  })
  motivoDiferencia?: string;

  @ApiPropertyOptional({ example: '12345.50' })
  horometroActual?: Decimal;

  @ApiPropertyOptional({ example: '12100.00' })
  horometroAnterior?: Decimal;

  @ApiPropertyOptional({ example: 'PREC-001' })
  precintoAnterior?: string;

  @ApiPropertyOptional({ example: 'PREC-002' })
  precinto2?: string;

  @ApiProperty({ example: 'GALONES' })
  unidadMedida: string;

  @ApiProperty({ example: '15.5000' })
  costoPorUnidad: Decimal;

  @ApiProperty({ example: '232.50' })
  costoTotal: Decimal;

  @ApiPropertyOptional({ example: 'TG-2025-0456' })
  numeroTicketGrifo?: string;

  @ApiPropertyOptional({ example: 'VD-789' })
  valeDiesel?: string;

  @ApiPropertyOptional({ example: 'F001-00123' })
  numeroFactura?: string;

  @ApiPropertyOptional({ example: '250.00' })
  importeFactura?: Decimal;

  @ApiPropertyOptional({ example: 'REQ-2025-456' })
  requerimiento?: string;

  @ApiPropertyOptional({ example: 'SA-2025-789' })
  numeroSalidaAlmacen?: string;

  @ApiPropertyOptional({ example: 'Se verificó el precinto correctamente' })
  observacionesControlador?: string;

  @ApiPropertyOptional()
  controladorId?: number;

  @ApiProperty({ example: 2 })
  aprobadoPorId: number;

  @ApiProperty({ example: '2025-01-15T14:35:00.000Z' })
  fechaAprobacion: Date;

  // 🆕 ESTADO DEL DETALLE
  @ApiProperty({ example: 'EN_PROGRESO', enum: ['EN_PROGRESO', 'CONCLUIDO'] })
  estado: string;

  @ApiPropertyOptional({ example: '2025-01-15T16:00:00.000Z' })
  fechaConcluido?: Date;

  @ApiPropertyOptional({ example: 3 })
  concluidoPorId?: number;

  @ApiProperty({ example: '2025-01-15T14:35:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T14:35:00.000Z' })
  updatedAt: Date;

  // Relaciones expandidas
  @ApiProperty({ type: TicketResumidoDto })
  ticket: TicketResumidoDto;

  @ApiPropertyOptional({ type: UsuarioResumidoDto })
  controlador?: UsuarioResumidoDto;

  @ApiProperty({ type: UsuarioResumidoDto })
  aprobadoPor: UsuarioResumidoDto;

  // 🆕 CONCLUIDO POR
  @ApiPropertyOptional({ type: UsuarioResumidoDto })
  concluidoPor?: UsuarioResumidoDto;
}