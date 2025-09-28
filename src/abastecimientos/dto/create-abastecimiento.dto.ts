import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsDecimal, 
  Min, 
  Max,
  Length,
  IsEnum,
  IsUrl,
  IsDateString
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

enum TipoCombustible {
  DIESEL = 'DIESEL',
  GASOLINA_84 = 'GASOLINA_84',
  GASOLINA_90 = 'GASOLINA_90',
  GASOLINA_95 = 'GASOLINA_95',
  GASOLINA_97 = 'GASOLINA_97',
  GLP = 'GLP',
  GNV = 'GNV'
}

enum UnidadMedida {
  GALONES = 'GALONES',
  LITROS = 'LITROS'
}

export class CreateAbastecimientoDto {
  @ApiPropertyOptional({
    description: 'Fecha del abastecimiento (si no se proporciona, usa la fecha actual)',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD válido' })
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Hora del abastecimiento (si no se proporciona, usa la hora actual)',
    example: '14:30:00'
  })
  @IsOptional()
  @IsString({ message: 'La hora debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  hora?: string;

  @ApiPropertyOptional({
    description: 'ID del turno',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del turno debe ser un número' })
  turnoId?: number;

  @ApiProperty({
    description: 'ID de la unidad',
    example: 5
  })
  @IsNotEmpty({ message: 'El ID de la unidad es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de la unidad debe ser un número' })
  unidadId: number;

  @ApiProperty({
    description: 'ID del conductor',
    example: 3
  })
  @IsNotEmpty({ message: 'El ID del conductor es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del conductor debe ser un número' })
  conductorId: number;

  @ApiPropertyOptional({
    description: 'ID del controlador',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del controlador debe ser un número' })
  controladorId?: number;

  @ApiProperty({
    description: 'ID del grifo donde se realizó el abastecimiento',
    example: 1
  })
  @IsNotEmpty({ message: 'El ID del grifo es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del grifo debe ser un número' })
  grifoId: number;

  @ApiPropertyOptional({
    description: 'ID de la ruta asignada',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID de la ruta debe ser un número' })
  rutaId?: number;

  @ApiProperty({
    description: 'Kilometraje actual de la unidad',
    example: 15432.50,
    minimum: 0
  })
  @IsNotEmpty({ message: 'El kilometraje actual es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El kilometraje actual debe ser un número' })
  @Min(0, { message: 'El kilometraje actual no puede ser negativo' })
  kilometrajeActual: number;

  @ApiPropertyOptional({
    description: 'Kilometraje anterior de la unidad',
    example: 15232.50,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El kilometraje anterior debe ser un número' })
  @Min(0, { message: 'El kilometraje anterior no puede ser negativo' })
  kilometrajeAnterior?: number;

  @ApiPropertyOptional({
    description: 'Horómetro actual',
    example: 8234.75,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El horómetro actual debe ser un número' })
  @Min(0, { message: 'El horómetro actual no puede ser negativo' })
  horometroActual?: number;

  @ApiPropertyOptional({
    description: 'Horómetro anterior',
    example: 8134.75,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El horómetro anterior debe ser un número' })
  @Min(0, { message: 'El horómetro anterior no puede ser negativo' })
  horometroAnterior?: number;

  @ApiPropertyOptional({
    description: 'Número del precinto anterior',
    example: 'PR-001234',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El precinto anterior debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El precinto anterior debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  precintoAnterior?: string;

  @ApiProperty({
    description: 'Número del precinto nuevo',
    example: 'PR-001235',
    maxLength: 50
  })
  @IsNotEmpty({ message: 'El precinto nuevo es obligatorio' })
  @IsString({ message: 'El precinto nuevo debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El precinto nuevo debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  precintoNuevo: string;

  @ApiPropertyOptional({
    description: 'Segundo precinto (si aplica)',
    example: 'PR-001236',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El segundo precinto debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El segundo precinto debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  precinto2?: string;

  @ApiProperty({
    description: 'Tipo de combustible',
    enum: TipoCombustible,
    default: TipoCombustible.DIESEL
  })
  @IsNotEmpty({ message: 'El tipo de combustible es obligatorio' })
  @IsEnum(TipoCombustible, { message: 'Tipo de combustible inválido' })
  tipoCombustible: TipoCombustible = TipoCombustible.DIESEL;

  @ApiProperty({
    description: 'Cantidad de combustible',
    example: 25.500,
    minimum: 0.001,
    maximum: 1000
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(0.001, { message: 'La cantidad debe ser mayor a 0' })
  @Max(1000, { message: 'La cantidad no puede ser mayor a 1000' })
  cantidad: number;

  @ApiProperty({
    description: 'Unidad de medida',
    enum: UnidadMedida,
    default: UnidadMedida.GALONES
  })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  @IsEnum(UnidadMedida, { message: 'Unidad de medida inválida' })
  unidadMedida: UnidadMedida = UnidadMedida.GALONES;

  @ApiProperty({
    description: 'Costo por unidad de combustible',
    example: 12.5000,
    minimum: 0.01,
    maximum: 100
  })
  @IsNotEmpty({ message: 'El costo por unidad es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo por unidad debe ser un número' })
  @Min(0.01, { message: 'El costo por unidad debe ser mayor a 0' })
  @Max(100, { message: 'El costo por unidad no puede ser mayor a 100' })
  costoPorUnidad: number;

  @ApiPropertyOptional({
    description: 'Número de ticket del grifo',
    example: 'TK-789456',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El número de ticket debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El número de ticket debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroTicket?: string;

  @ApiPropertyOptional({
    description: 'Número del vale de diesel',
    example: 'VD-2024-001',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El vale de diesel debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El vale de diesel debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  valeDiesel?: string;

  @ApiPropertyOptional({
    description: 'Número de factura',
    example: 'F001-00012345',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El número de factura debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El número de factura debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroFactura?: string;

  @ApiPropertyOptional({
    description: 'Importe de la factura',
    example: 318.75,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El importe de factura debe ser un número' })
  @Min(0, { message: 'El importe de factura no puede ser negativo' })
  importeFactura?: number;

  @ApiPropertyOptional({
    description: 'Descripción del requerimiento',
    example: 'Abastecimiento para ruta Lima - Callao'
  })
  @IsOptional()
  @IsString({ message: 'El requerimiento debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  requerimiento?: string;

  @ApiPropertyOptional({
    description: 'Número de salida de almacén',
    example: 'SA-2024-0156',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El número de salida de almacén debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El número de salida de almacén debe tener entre 1 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroSalidaAlmacen?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del surtidor',
    example: 'https://example.com/fotos/surtidor_123.jpg'
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto del surtidor debe ser válida' })
  fotoSurtidorUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del tablero',
    example: 'https://example.com/fotos/tablero_123.jpg'
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto del tablero debe ser válida' })
  fotoTableroUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del precinto nuevo',
    example: 'https://example.com/fotos/precinto_123.jpg'
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto del precinto nuevo debe ser válida' })
  fotoPrecintoNuevoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del segundo precinto',
    example: 'https://example.com/fotos/precinto2_123.jpg'
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto del segundo precinto debe ser válida' })
  fotoPrecinto2Url?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del ticket',
    example: 'https://example.com/fotos/ticket_123.jpg'
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto del ticket debe ser válida' })
  fotoTicketUrl?: string;

  @ApiPropertyOptional({
    description: 'Observaciones generales',
    example: 'Abastecimiento realizado sin incidencias'
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  observaciones?: string;
}