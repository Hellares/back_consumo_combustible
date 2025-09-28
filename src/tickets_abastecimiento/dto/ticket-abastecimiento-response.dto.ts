import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class TicketAbastecimientoResponseDto {
  @ApiProperty({
    description: 'ID único del ticket',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Número único del ticket',
    example: 'TK-2024-01-000001'
  })
  @Expose()
  numeroTicket: string;

  @ApiProperty({
    description: 'Fecha del ticket',
    example: '2024-01-15'
  })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  fecha: string;

  @ApiProperty({
    description: 'Hora del ticket',
    example: '14:30:00'
  })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toTimeString().split(' ')[0];
    }
    return value;
  })
  hora: string;

  @ApiPropertyOptional({
    description: 'Información del turno',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => obj.turno ? {
    id: obj.turno.id,
    nombre: obj.turno.nombre,
    horaInicio: obj.turno.horaInicio instanceof Date 
      ? obj.turno.horaInicio.toTimeString().split(' ')[0] 
      : obj.turno.horaInicio,
    horaFin: obj.turno.horaFin instanceof Date 
      ? obj.turno.horaFin.toTimeString().split(' ')[0] 
      : obj.turno.horaFin
  } : null)
  turno?: {
    id: number;
    nombre: string;
    horaInicio: string;
    horaFin: string;
  };

  @ApiProperty({
    description: 'Información de la unidad',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.unidad.id,
    placa: obj.unidad.placa,
    marca: obj.unidad.marca,
    modelo: obj.unidad.modelo,
    tipoCombustible: obj.unidad.tipoCombustible,
    capacidadTanque: obj.unidad.capacidadTanque
  }))
  unidad: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
    tipoCombustible: string;
    capacidadTanque: number;
  };

  @ApiProperty({
    description: 'Información del conductor',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.conductor.id,
    nombres: obj.conductor.nombres,
    apellidos: obj.conductor.apellidos,
    dni: obj.conductor.dni,
    codigoEmpleado: obj.conductor.codigoEmpleado
  }))
  conductor: {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
    codigoEmpleado: string;
  };

  @ApiProperty({
    description: 'Información del grifo',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.grifo.id,
    nombre: obj.grifo.nombre,
    codigo: obj.grifo.codigo,
    direccion: obj.grifo.direccion,
    sede: obj.grifo.sede ? {
      id: obj.grifo.sede.id,
      nombre: obj.grifo.sede.nombre,
      zona: obj.grifo.sede.zona ? {
        id: obj.grifo.sede.zona.id,
        nombre: obj.grifo.sede.zona.nombre
      } : null
    } : null
  }))
  grifo: {
    id: number;
    nombre: string;
    codigo: string;
    direccion: string;
    sede?: {
      id: number;
      nombre: string;
      zona?: {
        id: number;
        nombre: string;
      };
    };
  };

  @ApiPropertyOptional({
    description: 'Información de la ruta',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => obj.ruta ? {
    id: obj.ruta.id,
    nombre: obj.ruta.nombre,
    codigo: obj.ruta.codigo,
    origen: obj.ruta.origen,
    destino: obj.ruta.destino,
    distanciaKm: obj.ruta.distanciaKm
  } : null)
  ruta?: {
    id: number;
    nombre: string;
    codigo: string;
    origen: string;
    destino: string;
    distanciaKm: number;
  };

  @ApiProperty({
    description: 'Kilometraje actual',
    example: 15432.50
  })
  @Expose()
  kilometrajeActual: number;

  @ApiPropertyOptional({
    description: 'Kilometraje anterior',
    example: 15232.50
  })
  @Expose()
  kilometrajeAnterior?: number;

  @ApiProperty({
    description: 'Diferencia de kilometraje',
    example: 200.00
  })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.kilometrajeActual && obj.kilometrajeAnterior) {
      return Number((Number(obj.kilometrajeActual) - Number(obj.kilometrajeAnterior)).toFixed(2));
    }
    return 0;
  })
  diferenciaKilometraje: number;

  @ApiProperty({
    description: 'Precinto nuevo',
    example: 'PR-001235'
  })
  @Expose()
  precintoNuevo: string;

  @ApiProperty({
    description: 'Tipo de combustible',
    example: 'DIESEL'
  })
  @Expose()
  tipoCombustible: string;

  @ApiProperty({
    description: 'Cantidad solicitada',
    example: 25.500
  })
  @Expose()
  cantidad: number;

  @ApiPropertyOptional({
    description: 'Observaciones de la solicitud',
    example: 'Solicitud para ruta Lima - Callao'
  })
  @Expose()
  observacionesSolicitud?: string;

  @ApiProperty({
    description: 'Estado del ticket',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.estado.id,
    nombre: obj.estado.nombre,
    descripcion: obj.estado.descripcion,
    color: obj.estado.color
  }))
  estado: {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
  };

  @ApiProperty({
    description: 'Usuario que solicitó el ticket',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.solicitadoPor.id,
    nombres: obj.solicitadoPor.nombres,
    apellidos: obj.solicitadoPor.apellidos,
    codigoEmpleado: obj.solicitadoPor.codigoEmpleado
  }))
  solicitadoPor: {
    id: number;
    nombres: string;
    apellidos: string;
    codigoEmpleado: string;
  };

  @ApiProperty({
    description: 'Fecha de solicitud',
    example: '2024-01-15T14:30:00.000Z'
  })
  @Expose()
  fechaSolicitud: Date;

  @ApiPropertyOptional({
    description: 'Motivo de rechazo',
    example: 'Falta documentación requerida'
  })
  @Expose()
  motivoRechazo?: string;

  @ApiPropertyOptional({
    description: 'Usuario que rechazó el ticket',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => obj.rechazadoPor ? {
    id: obj.rechazadoPor.id,
    nombres: obj.rechazadoPor.nombres,
    apellidos: obj.rechazadoPor.apellidos,
    codigoEmpleado: obj.rechazadoPor.codigoEmpleado
  } : null)
  rechazadoPor?: {
    id: number;
    nombres: string;
    apellidos: string;
    codigoEmpleado: string;
  };

  @ApiPropertyOptional({
    description: 'Fecha de rechazo',
    example: '2024-01-15T16:45:00.000Z'
  })
  @Expose()
  fechaRechazo?: Date;

  @ApiProperty({
    description: 'Indica si tiene detalle de abastecimiento completado',
    example: false
  })
  @Expose()
  @Transform(({ obj }) => !!obj.detalleAbastecimiento)
  tieneDetalle: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T14:30:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T16:45:00.000Z'
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<TicketAbastecimientoResponseDto>) {
    Object.assign(this, partial);
  }
}