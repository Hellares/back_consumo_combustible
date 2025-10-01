// =====================================================
// src/archivos/constants/upload-limits.constant.ts
// =====================================================

/**
 * Límites y configuración para subida de archivos
 */
export const UPLOAD_LIMITS = {
  // Tamaño máximo por archivo: 10MB
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Número máximo de archivos por request
  MAX_FILES_PER_UPLOAD: 10,
  
  // Extensiones permitidas para imágenes
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  
  // Extensiones permitidas para documentos
  ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  
  // Tipos MIME permitidos para imágenes
  ALLOWED_IMAGE_MIMETYPES: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'image/gif'
  ],
  
  // Tipos MIME permitidos para documentos
  ALLOWED_DOCUMENT_MIMETYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

/**
 * Carpetas de Cloudinary por tipo de contenido
 */
export const CLOUDINARY_FOLDERS = {
  TICKETS: 'tickets',
  UNIDADES: 'unidades',
  USUARIOS: 'usuarios',
  INSPECCIONES: 'inspecciones',
  MANTENIMIENTOS: 'mantenimientos',
  FALLAS: 'fallas',
  COMPROBANTES: 'comprobantes',
  DOCUMENTOS: 'documentos'
};

/**
 * Configuración de transformaciones de Cloudinary
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  // Thumbnail pequeño para listados
  THUMBNAIL_SMALL: {
    width: 150,
    height: 150,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto'
  },
  
  // Thumbnail mediano para vistas previas
  THUMBNAIL_MEDIUM: {
    width: 300,
    height: 300,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto'
  },
  
  // Imagen optimizada para web
  WEB_OPTIMIZED: {
    width: 1200,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto'
  }
};

/**
 * Mensajes de error para validaciones
 */
export const UPLOAD_ERROR_MESSAGES = {
  NO_FILES: 'Debe proporcionar al menos un archivo',
  
  TOO_MANY_FILES: `No se pueden subir más de ${UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} archivos a la vez`,
  
  FILE_TOO_LARGE: (fileName: string, maxSize: number) => 
    `El archivo "${fileName}" excede el tamaño máximo permitido (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
  
  INVALID_FILE_TYPE: (fileName: string, mimeType: string) => 
    `Tipo de archivo no permitido: ${mimeType} para "${fileName}"`,
  
  UPLOAD_FAILED: 'Error al subir archivo. Por favor, intente nuevamente',
  
  DELETE_FAILED: 'Error al eliminar archivo de Cloudinary',
  
  TICKET_NOT_FOUND: (ticketId: number) => 
    `Ticket con ID ${ticketId} no encontrado`,
  
  TIPO_ARCHIVO_NOT_FOUND: (tipoId: number) => 
    `Tipo de archivo con ID ${tipoId} no encontrado`,
  
  ARCHIVO_NOT_FOUND: (archivoId: number) => 
    `Archivo con ID ${archivoId} no encontrado`,
  
  TIPO_ARCHIVO_INACTIVO: 'El tipo de archivo no está activo',
  
  ARCHIVO_NO_PERTENECE_TICKET: 'El archivo no pertenece al ticket especificado',
  
  CLOUDINARY_NOT_CONFIGURED: 'Cloudinary no está configurado correctamente. Verifique las variables de entorno.',
  
  INVALID_IMAGE_DIMENSIONS: (fileName: string, minWidth: number, minHeight: number) =>
    `La imagen "${fileName}" debe tener al menos ${minWidth}x${minHeight} píxeles`,
  
  DUPLICATE_FILE: (fileName: string) =>
    `Ya existe un archivo con el nombre "${fileName}" para este ticket`
};

/**
 * Códigos de estado para operaciones de archivos
 */
export const ARCHIVO_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
  DELETED: 'deleted'
};

/**
 * Extensiones de archivo por categoría
 */
export const FILE_EXTENSIONS_BY_CATEGORY = {
  IMAGEN: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  DOCUMENTO: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  COMPROBANTE: ['.pdf', '.jpg', '.jpeg', '.png']
};

/**
 * Tamaños de thumbnail predefinidos
 */
export const THUMBNAIL_SIZES = {
  SMALL: { width: 150, height: 150 },
  MEDIUM: { width: 300, height: 300 },
  LARGE: { width: 600, height: 600 }
};

/**
 * Configuración de calidad de imagen por uso
 */
export const IMAGE_QUALITY = {
  THUMBNAIL: 70,
  PREVIEW: 80,
  ORIGINAL: 90,
  PRINT: 95
};

/**
 * Formatos de imagen permitidos
 */
export const ALLOWED_IMAGE_FORMATS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif'
];

/**
 * Formatos de documento permitidos
 */
export const ALLOWED_DOCUMENT_FORMATS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx'
];

/**
 * Configuración de compresión de imágenes
 */
export const IMAGE_COMPRESSION = {
  // Compresión agresiva para thumbnails
  THUMBNAIL: {
    quality: 70,
    maxWidth: 150,
    maxHeight: 150
  },
  // Compresión moderada para previews
  PREVIEW: {
    quality: 80,
    maxWidth: 800,
    maxHeight: 800
  },
  // Compresión ligera para visualización web
  WEB: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1920
  }
};

/**
 * Tipos MIME completos por categoría
 */
export const MIME_TYPES = {
  IMAGES: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif']
  },
  DOCUMENTS: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  }
};

/**
 * Límites específicos por tipo de archivo
 */
export const FILE_LIMITS_BY_TYPE = {
  IMAGEN: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    minWidth: 100,
    minHeight: 100,
    maxWidth: 10000,
    maxHeight: 10000
  },
  DOCUMENTO: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    maxPages: 50 // Para PDFs
  },
  COMPROBANTE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 3
  }
};

/**
 * Prefijos para nombres de archivo por tipo
 */
export const FILE_NAME_PREFIXES = {
  FOTO_GRIFO: 'grifo',
  FOTO_TABLERO: 'tablero',
  FOTO_PRECINTO: 'precinto',
  FOTO_UNIDAD: 'unidad',
  FOTO_SURTIDOR: 'surtidor',
  COMPROBANTE_PAGO: 'comprobante',
  FACTURA: 'factura',
  DOCUMENTO_ADICIONAL: 'documento',
  AUTORIZACION: 'autorizacion'
};

/**
 * Patrones de validación para nombres de archivo
 */
export const FILE_NAME_PATTERNS = {
  // Solo letras, números, guiones y guiones bajos
  SAFE_NAME: /^[a-zA-Z0-9_-]+$/,
  // Extensiones permitidas
  VALID_EXTENSION: /\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx)$/i
};