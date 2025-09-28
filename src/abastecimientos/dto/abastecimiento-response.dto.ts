import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class AbastecimientoResponseDto {
  @ApiProperty({
    description: 'ID único del abastecimiento',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Número único del abastecimiento',
    example: 'AB-2024-000001'
  })
  @Expose()
  numeroAbastecimiento: string;

  @ApiProperty({
    description: 'Fecha del abastecimiento',
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
    description: 'Hora del abastecimiento',
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

  @ApiPropertyOptional({
    description: 'Información del controlador',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => obj.controlador ? {
    id: obj.controlador.id,
    nombres: obj.controlador.nombres,
    apellidos: obj.controlador.apellidos,
    dni: obj.controlador.dni,
    codigoEmpleado: obj.controlador.codigoEmpleado
  } : null)
  controlador?: {
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
    sede: {
      id: obj.grifo.sede.id,
      nombre: obj.grifo.sede.nombre,
      zona: {
        id: obj.grifo.sede.zona.id,
        nombre: obj.grifo.sede.zona.nombre
      }
    }
  }))
  grifo: {
    id: number;
    nombre: string;
    codigo: string;
    direccion: string;
    sede: {
      id: number;
      nombre: string;
      zona: {
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
      return Number((obj.kilometrajeActual - obj.kilometrajeAnterior).toFixed(2));
    }
    return 0;
  })
  diferenciaKilometraje: number;

  @ApiPropertyOptional({
    description: 'Horómetro actual',
    example: 8234.75
  })
  @Expose()
  horometroActual?: number;

  @ApiPropertyOptional({
    description: 'Horómetro anterior',
    example: 8134.75
  })
  @Expose()
  horometroAnterior?: number;

  @ApiProperty({
    description: 'Diferencia de horómetro',
    example: 100.00
  })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.horometroActual && obj.horometroAnterior) {
      return Number((obj.horometroActual - obj.horometroAnterior).toFixed(2));
    }
    return 0;
  })
  diferenciaHorometro: number;

  @ApiPropertyOptional({
    description: 'Precinto anterior',
    example: 'PR-001234'
  })
  @Expose()
  precintoAnterior?: string;

  @ApiProperty({
    description: 'Precinto nuevo',
    example: 'PR-001235'
  })
  @Expose()
  precintoNuevo: string;

  @ApiPropertyOptional({
    description: 'Segundo precinto',
    example: 'PR-001236'
  })
  @Expose()
  precinto2?: string;

  @ApiProperty({
    description: 'Tipo de combustible',
    example: 'DIESEL'
  })
  @Expose()
  tipoCombustible: string;

  @ApiProperty({
    description: 'Cantidad de combustible',
    example: 25.500
  })
  @Expose()
  cantidad: number;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'GALONES'
  })
  @Expose()
  unidadMedida: string;

  @ApiProperty({
    description: 'Costo por unidad',
    example: 12.5000
  })
  @Expose()
  costoPorUnidad: number;

  @ApiProperty({
    description: 'Costo total',
    example: 318.75
  })
  @Expose()
  costoTotal: number;

  @ApiPropertyOptional({
    description: 'Número de ticket',
    example: 'TK-789456'
  })
  @Expose()
  numeroTicket?: string;

  @ApiPropertyOptional({
    description: 'Vale de diesel',
    example: 'VD-2024-001'
  })
  @Expose()
  valeDiesel?: string;

  @ApiPropertyOptional({
    description: 'Número de factura',
    example: 'F001-00012345'
  })
  @Expose()
  numeroFactura?: string;

  @ApiPropertyOptional({
    description: 'Importe de factura',
    example: 318.75
  })
  @Expose()
  importeFactura?: number;

  @ApiPropertyOptional({
    description: 'Requerimiento',
    example: 'Abastecimiento para ruta Lima - Callao'
  })
  @Expose()
  requerimiento?: string;

  @ApiPropertyOptional({
    description: 'Número de salida de almacén',
    example: 'SA-2024-0156'
  })
  @Expose()
  numeroSalidaAlmacen?: string;

  @ApiProperty({
    description: 'URLs de fotos',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    surtidor: obj.fotoSurtidorUrl,
    tablero: obj.fotoTableroUrl,
    precintoNuevo: obj.fotoPrecintoNuevoUrl,
    precinto2: obj.fotoPrecinto2Url,
    ticket: obj.fotoTicketUrl
  }))
  fotos: {
    surtidor?: string;
    tablero?: string;
    precintoNuevo?: string;
    precinto2?: string;
    ticket?: string;
  };

  @ApiProperty({
    description: 'Información del estado',
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

  @ApiPropertyOptional({
    description: 'Observaciones generales',
    example: 'Abastecimiento realizado sin incidencias'
  })
  @Expose()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Observaciones del controlador',
    example: 'Documentos verificados correctamente'
  })
  @Expose()
  observacionesControlador?: string;

  @ApiPropertyOptional({
    description: 'Motivo de rechazo',
    example: 'Falta documentación'
  })
  @Expose()
  motivoRechazo?: string;

  @ApiPropertyOptional({
    description: 'Información del aprobador',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => obj.aprobadoPor ? {
    id: obj.aprobadoPor.id,
    nombres: obj.aprobadoPor.nombres,
    apellidos: obj.aprobadoPor.apellidos,
    codigoEmpleado: obj.aprobadoPor.codigoEmpleado
  } : null)
  aprobadoPor?: {
    id: number;
    nombres: string;
    apellidos: string;
    codigoEmpleado: string;
  };

  @ApiPropertyOptional({
    description: 'Fecha de aprobación',
    example: '2024-01-15'
  })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  fechaAprobacion?: string;

  @ApiPropertyOptional({
    description: 'Información del rechazador',
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
    example: '2024-01-15'
  })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  fechaRechazo?: string;

  @ApiProperty({
    description: 'Eficiencia de combustible (Km/Galón)',
    example: 7.84
  })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.diferenciaKilometraje && obj.cantidad && obj.diferenciaKilometraje > 0) {
      return Number((obj.diferenciaKilometraje / obj.cantidad).toFixed(2));
    }
    return 0;
  })
  eficienciaCombustible: number;

  @ApiProperty({
    description: 'Porcentaje de tanque llenado',
    example: 85.33
  })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.unidad?.capacidadTanque && obj.cantidad) {
      const porcentaje = (obj.cantidad / obj.unidad.capacidadTanque) * 100;
      return Number(porcentaje.toFixed(2));
    }
    return 0;
  })
  porcentajeTanque: number;

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

  constructor(partial: Partial<AbastecimientoResponseDto>) {
    Object.assign(this, partial);
  }
}