import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';

/**
 * DTO para metadatos del archivo
 * IMPORTANTE: Esta clase debe declararse ANTES de ser usada
 */
export class FileMetadataDto {
  @ApiPropertyOptional({ 
    description: 'Ancho de la imagen en píxeles', 
    example: 1920,
    nullable: true
  })
  width?: number;

  @ApiPropertyOptional({ 
    description: 'Alto de la imagen en píxeles', 
    example: 1080,
    nullable: true
  })
  height?: number;

  @ApiPropertyOptional({ 
    description: 'Formato del archivo', 
    example: 'jpg',
    nullable: true
  })
  format?: string;

  @ApiPropertyOptional({ 
    description: 'Tipo de recurso en Cloudinary', 
    example: 'image',
    enum: ['image', 'raw', 'video'],
    nullable: true
  })
  resourceType?: string;

  @ApiPropertyOptional({ 
    description: 'Duración en segundos (solo para videos)', 
    example: 120,
    nullable: true
  })
  duration?: number;

  @ApiPropertyOptional({ 
    description: 'Número de páginas (solo para PDFs)', 
    example: 5,
    nullable: true
  })
  pages?: number;

  // Sin decorador para propiedades dinámicas
  [key: string]: any;
}

/**
 * DTO anidado para información del tipo de archivo
 */
export class TipoArchivoDto {
  @ApiProperty({ 
    description: 'ID del tipo de archivo', 
    example: 1 
  })
  @Expose()
  id: number;

  @ApiProperty({ 
    description: 'Código único del tipo de archivo', 
    example: 'FOTO_TABLERO',
    enum: [
      'FOTO_GRIFO',
      'FOTO_TABLERO',
      'FOTO_PRECINTO',
      'FOTO_UNIDAD',
      'FOTO_SURTIDOR',
      'COMPROBANTE_PAGO',
      'FACTURA',
      'DOCUMENTO_ADICIONAL',
      'AUTORIZACION'
    ]
  })
  @Expose()
  codigo: string;

  @ApiProperty({ 
    description: 'Nombre descriptivo del tipo de archivo', 
    example: 'Foto del Tablero' 
  })
  @Expose()
  nombre: string;

  @ApiPropertyOptional({ 
    description: 'Descripción detallada del tipo de archivo', 
    example: 'Fotografía del tablero mostrando el kilometraje',
    nullable: true
  })
  @Expose()
  descripcion?: string;

  @ApiProperty({ 
    description: 'Categoría del tipo de archivo', 
    example: 'IMAGEN',
    enum: ['IMAGEN', 'DOCUMENTO', 'COMPROBANTE']
  })
  @Expose()
  categoria: string;

  @ApiProperty({ 
    description: 'Indica si este tipo de archivo es requerido', 
    example: true,
    default: false
  })
  @Expose()
  requerido: boolean;

  @ApiProperty({ 
    description: 'Orden de visualización del tipo', 
    example: 1,
    default: 0
  })
  @Expose()
  orden: number;
}

/**
 * DTO anidado para información básica del usuario
 */
export class UsuarioBasicoDto {
  @ApiProperty({ 
    description: 'ID del usuario', 
    example: 1 
  })
  @Expose()
  id: number;

  @ApiProperty({ 
    description: 'Nombres del usuario', 
    example: 'Juan Carlos' 
  })
  @Expose()
  nombres: string;

  @ApiProperty({ 
    description: 'Apellidos del usuario', 
    example: 'García López' 
  })
  @Expose()
  apellidos: string;

  @ApiPropertyOptional({ 
    description: 'DNI del usuario', 
    example: '12345678',
    nullable: true
  })
  @Expose()
  dni?: string;

  @ApiProperty({ 
    description: 'Código de empleado', 
    example: 'EMP001' 
  })
  @Expose()
  codigoEmpleado: string;
}

/**
 * DTO de respuesta para archivos de ticket
 * IMPORTANTE: Esta clase debe declararse DESPUÉS de las clases que usa
 */
export class ArchivoTicketResponseDto {
  @ApiProperty({ 
    description: 'ID único del archivo', 
    example: 1 
  })
  @Expose()
  id: number;

  @ApiProperty({ 
    description: 'ID del ticket al que pertenece', 
    example: 5 
  })
  @Expose()
  ticketId: number;

  @ApiProperty({ 
    description: 'Nombre del archivo generado por el sistema', 
    example: 'ticket_5_FOTO_TABLERO_imagen_1234567890.jpg' 
  })
  @Expose()
  nombreArchivo: string;

  @ApiProperty({ 
    description: 'Nombre original del archivo subido', 
    example: 'foto_kilometraje.jpg' 
  })
  @Expose()
  nombreOriginal: string;

  @ApiProperty({ 
    description: 'URL pública del archivo en Cloudinary', 
    example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/combustible-app/tickets/5/archivo.jpg' 
  })
  @Expose()
  url: string;

  @ApiPropertyOptional({ 
    description: 'URL del thumbnail (miniatura) generado automáticamente', 
    example: 'https://res.cloudinary.com/demo/image/upload/w_150,h_150,c_fill/v1234567890/archivo.jpg',
    nullable: true
  })
  @Expose()
  urlThumbnail?: string;

  @ApiProperty({ 
    description: 'Ruta de almacenamiento en Cloudinary (public_id)', 
    example: 'combustible-app/tickets/5/archivo_1234567890' 
  })
  @Expose()
  rutaAlmacenamiento: string;

  @ApiProperty({ 
    description: 'Tipo MIME del archivo', 
    example: 'image/jpeg',
    enum: [
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  })
  @Expose()
  tipoMime: string;

  @ApiProperty({ 
    description: 'Tamaño del archivo en bytes', 
    example: 245678 
  })
  @Expose()
  @Transform(({ value }) => Number(value))
  tamanoBytes: number;

  @ApiProperty({ 
    description: 'Extensión del archivo', 
    example: '.jpg' 
  })
  @Expose()
  extension: string;

  @ApiPropertyOptional({ 
    description: 'Metadatos adicionales del archivo (dimensiones, formato, etc.)', 
    example: { 
      width: 1920, 
      height: 1080, 
      format: 'jpg',
      resourceType: 'image'
    },
    nullable: true
  })
  @Expose()
  metadatos?: FileMetadataDto;

  @ApiPropertyOptional({ 
    description: 'Descripción o comentario del archivo', 
    example: 'Foto del tablero mostrando kilometraje',
    nullable: true
  })
  @Expose()
  descripcion?: string;

  @ApiProperty({ 
    description: 'Orden de visualización del archivo', 
    example: 1,
    default: 0
  })
  @Expose()
  orden: number;

  @ApiProperty({ 
    description: 'Indica si es el archivo principal del ticket', 
    example: false,
    default: false
  })
  @Expose()
  esPrincipal: boolean;

  @ApiProperty({ 
    description: 'Información del tipo de archivo',
    type: () => TipoArchivoDto
  })
  @Expose()
  @Type(() => TipoArchivoDto)
  tipoArchivo: TipoArchivoDto;

  @ApiProperty({ 
    description: 'Información del usuario que subió el archivo',
    type: () => UsuarioBasicoDto
  })
  @Expose()
  @Type(() => UsuarioBasicoDto)
  subidoPor: UsuarioBasicoDto;

  @ApiProperty({ 
    description: 'Fecha y hora de subida del archivo', 
    example: '2025-09-30T12:30:45.000Z' 
  })
  @Expose()
  fechaSubida: Date;

  @ApiProperty({ 
    description: 'Estado activo del archivo (false si fue eliminado)', 
    example: true,
    default: true
  })
  @Expose()
  activo: boolean;

  @ApiProperty({ 
    description: 'Fecha de creación del registro', 
    example: '2025-09-30T12:30:45.000Z' 
  })
  @Expose()
  createdAt: Date;
}

/**
 * DTO simplificado para listados
 */
export class ArchivoTicketListDto {
  @ApiProperty({ description: 'ID del archivo', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del archivo', example: 'ticket_5_foto.jpg' })
  @Expose()
  nombreArchivo: string;

  @ApiProperty({ description: 'URL del archivo' })
  @Expose()
  url: string;

  @ApiPropertyOptional({ description: 'URL del thumbnail' })
  @Expose()
  urlThumbnail?: string;

  @ApiProperty({ description: 'Tipo MIME', example: 'image/jpeg' })
  @Expose()
  tipoMime: string;

  @ApiProperty({ description: 'Tamaño en bytes', example: 245678 })
  @Expose()
  tamanoBytes: number;

  @ApiProperty({ description: 'Es archivo principal', example: false })
  @Expose()
  esPrincipal: boolean;

  @ApiProperty({ description: 'Tipo de archivo', type: () => TipoArchivoDto })
  @Expose()
  @Type(() => TipoArchivoDto)
  tipoArchivo: TipoArchivoDto;

  @ApiProperty({ description: 'Fecha de subida' })
  @Expose()
  fechaSubida: Date;
}