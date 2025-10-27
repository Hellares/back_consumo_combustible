import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ItinerarioBasicoDto } from './itinerario-basico.dto';

export class TurnoBasicoDto {
  @ApiProperty({ description: 'ID del turno', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del turno', example: 'MAÑANA' })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Hora de inicio', example: '06:00:00' })
  @Expose()
  @Transform(({ value }) => value?.toISOString().split('T')[1]?.split('.')[0])
  horaInicio: string;

  @ApiProperty({ description: 'Hora de fin', example: '14:00:00' })
  @Expose()
  @Transform(({ value }) => value?.toISOString().split('T')[1]?.split('.')[0])
  horaFin: string;
}

export class UnidadBasicaDto {
  @ApiProperty({ description: 'ID de la unidad', example: 5 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Placa de la unidad', example: 'ABC-123' })
  @Expose()
  placa: string;

  @ApiProperty({ description: 'Marca de la unidad', example: 'VOLVO' })
  @Expose()
  marca: string;

  @ApiProperty({ description: 'Modelo de la unidad', example: 'FH-460' })
  @Expose()
  modelo: string;

  @ApiProperty({ description: 'Tipo de combustible', example: 'DIESEL' })
  @Expose()
  tipoCombustible: string;
}

export class UsuarioBasicoDto {
  @ApiProperty({ description: 'ID del usuario', example: 3 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombres del usuario', example: 'Juan Carlos' })
  @Expose()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del usuario', example: 'García López' })
  @Expose()
  apellidos: string;

  @ApiProperty({ description: 'DNI del usuario', example: '12345678' })
  @Expose()
  dni: string;

  @ApiProperty({ description: 'Código de empleado', example: 'EMP001' })
  @Expose()
  codigoEmpleado: string;
}

export class GrifoBasicoDto {
  @ApiProperty({ description: 'ID del grifo', example: 2 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del grifo', example: 'PRIMAX NORTE' })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Código del grifo', example: 'GRF-001' })
  @Expose()
  codigo: string;

  @ApiProperty({ description: 'Dirección del grifo', example: 'Av. Norte 123' })
  @Expose()
  direccion: string;
}

export class RutaBasicaDto {
  @ApiProperty({ description: 'ID de la ruta', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre de la ruta', example: 'LIMA - AREQUIPA' })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Código de la ruta', example: 'RT-001' })
  @Expose()
  codigo: string;

  @ApiProperty({ description: 'Origen de la ruta', example: 'Lima' })
  @Expose()
  origen: string;

  @ApiProperty({ description: 'Destino de la ruta', example: 'Arequipa' })
  @Expose()
  destino: string;
}

export class EstadoTicketDto {
  @ApiProperty({ description: 'ID del estado', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del estado', example: 'PENDIENTE' })
  @Expose()
  nombre: string;

  @ApiProperty({ description: 'Descripción del estado', example: 'Ticket pendiente de aprobación' })
  @Expose()
  descripcion: string;

  @ApiProperty({ description: 'Color del estado', example: '#FFA500' })
  @Expose()
  color: string;
}

export class TicketAbastecimientoResponseDto {
  @ApiProperty({ description: 'ID del ticket', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Número del ticket', example: 'TK-2024-01-000001' })
  @Expose()
  numeroTicket: string;

  @ApiProperty({ description: 'Fecha del ticket', example: '2024-01-15' })
  @Expose()
  @Transform(({ value }) => value?.toISOString().split('T')[0])
  fecha: string;

  @ApiProperty({ description: 'Hora del ticket', example: '14:30:00' })
  @Expose()
  @Transform(({ value }) => value?.toISOString().split('T')[1]?.split('.')[0])
  hora: string;

  @ApiPropertyOptional({ description: 'Información del turno', type: TurnoBasicoDto })
  @Expose()
  @Type(() => TurnoBasicoDto)
  turno?: TurnoBasicoDto;

  @ApiProperty({ description: 'Información de la unidad', type: UnidadBasicaDto })
  @Expose()
  @Type(() => UnidadBasicaDto)
  unidad: UnidadBasicaDto;

  @ApiProperty({ description: 'Información del conductor', type: UsuarioBasicoDto })
  @Expose()
  @Type(() => UsuarioBasicoDto)
  conductor: UsuarioBasicoDto;

  @ApiProperty({ description: 'Información del grifo', type: GrifoBasicoDto })
  @Expose()
  @Type(() => GrifoBasicoDto)
  grifo: GrifoBasicoDto;

  @ApiPropertyOptional({ description: 'Información de la ruta', type: RutaBasicaDto })
  @Expose()
  @Type(() => RutaBasicaDto)
  ruta?: RutaBasicaDto;

  @ApiPropertyOptional({ 
    description: 'Información del itinerario asignado', 
    type: ItinerarioBasicoDto 
  })
  @Expose()
  @Type(() => ItinerarioBasicoDto)
  itinerario?: ItinerarioBasicoDto;

  @ApiPropertyOptional({ 
    description: 'ID de la ejecución de itinerario', 
    example: 15 
  })
  @Expose()
  ejecucionItinerarioId?: number;

  @ApiProperty({ 
    description: 'Origen de la asignación de ruta/itinerario',
    enum: ['AUTOMATICO', 'MANUAL', 'NINGUNO'],
    example: 'AUTOMATICO'
  })
  @Expose()
  origenAsignacion: string;

  @ApiPropertyOptional({ 
    description: 'Motivo del cambio manual de itinerario',
    example: 'Emergencia - Apoyo en ruta sur'
  })
  @Expose()
  motivoCambioItinerario?: string;

  @ApiPropertyOptional({ 
    description: 'ID del itinerario originalmente detectado',
    example: 2
  })
  @Expose()
  itinerarioOriginalDetectadoId?: number;

  @ApiPropertyOptional({ 
    description: 'Información del itinerario originalmente detectado (para auditoría)',
    type: ItinerarioBasicoDto 
  })
  @Expose()
  @Type(() => ItinerarioBasicoDto)
  itinerarioOriginalDetectado?: ItinerarioBasicoDto;

  @ApiProperty({ description: 'Kilometraje actual', example: 125420.50 })
  @Expose()
  @Transform(({ value }) => value !== undefined && value !== null ? Number(value) : 0)
  kilometrajeActual: number;

  @ApiPropertyOptional({ description: 'Kilometraje anterior', example: 125380.25 })
  @Expose()
  @Transform(({ value }) => value !== undefined && value !== null ? Number(value) : null)
  kilometrajeAnterior?: number;

  @ApiProperty({ description: 'Diferencia de kilometraje calculada', example: 40.25 })
  @Expose()
  diferenciaKilometraje: number;

  @ApiProperty({ description: 'Número del precinto nuevo', example: 'PR-2024-001234' })
  @Expose()
  precintoNuevo: string;

  @ApiProperty({ description: 'Tipo de combustible', example: 'DIESEL' })
  @Expose()
  tipoCombustible: string;

  @ApiProperty({ description: 'Cantidad solicitada', example: 25.500 })
  @Expose()
  @Transform(({ value }) => value !== undefined && value !== null ? Number(value) : 0)
  cantidad: number;

  @ApiPropertyOptional({ description: 'Observaciones de la solicitud' })
  @Expose()
  observacionesSolicitud?: string;

  @ApiProperty({ description: 'Estado del ticket', type: EstadoTicketDto })
  @Expose()
  @Type(() => EstadoTicketDto)
  estado: EstadoTicketDto;

  @ApiProperty({ description: 'Usuario que solicitó el ticket', type: UsuarioBasicoDto })
  @Expose()
  @Type(() => UsuarioBasicoDto)
  solicitadoPor: UsuarioBasicoDto;

  @ApiProperty({ description: 'Fecha de solicitud', example: '2024-01-15T14:30:00.000Z' })
  @Expose()
  fechaSolicitud: Date;

  @ApiPropertyOptional({ description: 'Motivo de rechazo (si aplica)' })
  @Expose()
  motivoRechazo?: string;

  @ApiPropertyOptional({ description: 'Usuario que rechazó el ticket', type: UsuarioBasicoDto })
  @Expose()
  @Type(() => UsuarioBasicoDto)
  rechazadoPor?: UsuarioBasicoDto;

  @ApiPropertyOptional({ description: 'Fecha de rechazo' })
  @Expose()
  fechaRechazo?: Date;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-01-15T14:30:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización', example: '2024-01-15T14:35:00.000Z' })
  @Expose()
  updatedAt: Date;
}
