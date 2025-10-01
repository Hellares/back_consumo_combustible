export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  original_extension?: string;
  api_key?: string;
}

/**
 * Interfaz simplificada del resultado de subida
 * Se usa internamente en el servicio
 */
export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
  thumbnailUrl?: string;
  originalFilename?: string;
}

/**
 * Categorías de archivos permitidas
 */
export enum FileCategory {
  IMAGEN = 'IMAGEN',
  DOCUMENTO = 'DOCUMENTO',
  COMPROBANTE = 'COMPROBANTE'
}

/**
 * Códigos de tipos de archivo para tickets
 */
export enum TipoArchivoTicketCodigo {
  // Imágenes
  FOTO_GRIFO = 'FOTO_GRIFO',
  FOTO_TABLERO = 'FOTO_TABLERO',
  FOTO_PRECINTO = 'FOTO_PRECINTO',
  FOTO_UNIDAD = 'FOTO_UNIDAD',
  FOTO_SURTIDOR = 'FOTO_SURTIDOR',
  
  // Comprobantes
  COMPROBANTE_PAGO = 'COMPROBANTE_PAGO',
  FACTURA = 'FACTURA',
  
  // Documentos
  DOCUMENTO_ADICIONAL = 'DOCUMENTO_ADICIONAL',
  AUTORIZACION = 'AUTORIZACION'
}

/**
 * Opciones para subida de archivos
 */
export interface UploadOptions {
  folder: string;
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
  transformation?: any[];
  useFilename?: boolean;
  uniqueFilename?: boolean;
  overwrite?: boolean;
  tags?: string[];
}

/**
 * Resultado de eliminación de archivo
 */
export interface DeleteResult {
  result: string; // 'ok' o 'not found'
}

/**
 * Metadatos del archivo
 */
export interface FileMetadata {
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  duration?: number; // Para videos
  pages?: number; // Para PDFs
  [key: string]: any; // Metadatos adicionales
}