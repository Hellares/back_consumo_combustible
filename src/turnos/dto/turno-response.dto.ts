import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class TurnoResponseDto {
  @ApiProperty({
    description: 'ID único del turno',
    example: 1
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Nombre del turno',
    example: 'MAÑANA'
  })
  @Expose()
  nombre: string;

  @ApiProperty({
    description: 'Hora de inicio del turno',
    example: '06:00:00'
  })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toTimeString().split(' ')[0];
    }
    return value;
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin del turno',
    example: '14:00:00'
  })
  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toTimeString().split(' ')[0];
    }
    return value;
  })
  horaFin: string;

  @ApiProperty({
    description: 'Estado activo del turno',
    example: true
  })
  @Expose()
  activo: boolean;

  @ApiProperty({
    description: 'Cantidad de abastecimientos asociados',
    example: 25
  })
  @Expose()
  @Transform(({ obj }) => obj._count?.abastecimientos || 0)
  totalAbastecimientos: number;

  @ApiProperty({
    description: 'Duración del turno en horas',
    example: 8.0
  })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.horaInicio && obj.horaFin) {
      const inicio = new Date(`1970-01-01T${obj.horaInicio instanceof Date ? obj.horaInicio.toTimeString().split(' ')[0] : obj.horaInicio}`);
      const fin = new Date(`1970-01-01T${obj.horaFin instanceof Date ? obj.horaFin.toTimeString().split(' ')[0] : obj.horaFin}`);
      
      let diffMs = fin.getTime() - inicio.getTime();
      
      // Si la hora de fin es menor que la de inicio, es un turno nocturno
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000; // Agregar 24 horas
      }
      
      return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Redondear a 2 decimales
    }
    return 0;
  })
  duracionHoras: number;

  constructor(partial: Partial<TurnoResponseDto>) {
    Object.assign(this, partial);
  }
}