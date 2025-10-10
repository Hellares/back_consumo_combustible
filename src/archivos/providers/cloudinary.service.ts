// =====================================================
// src/archivos/providers/cloudinary.service.ts
// =====================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';
import { UploadResult } from '../interfaces/upload-response.interface';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Configurar Cloudinary al inicializar el servicio
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true, // Usar HTTPS
    });
  }

  /**
   * Subir un archivo a Cloudinary
   * @param file - Buffer del archivo (Express.Multer.File)
   * @param folder - Carpeta en Cloudinary donde se guardará
   * @param resourceType - Tipo de recurso (image, raw, video, auto)
   * @returns Promise con la información del archivo subido
   */
  async uploadFile(
  file: Express.Multer.File,
  folder: string = 'general',
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
): Promise<UploadResult> {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.configService.get<string>('CLOUDINARY_FOLDER') || 'combustible-app'}/${folder}`,
          resource_type: resourceType,
          // Redimensionar imágenes para optimizar tamaño manteniendo legibilidad
          transformation: resourceType === 'image' ? [
            { width: 1080, height: 1080, crop: 'limit' }
          ] : undefined,
          // Establecer calidad óptima para imágenes (90% balance entre calidad y tamaño)
          quality: resourceType === 'image' ? 90 : undefined,
          // Preservar el nombre original CON extensión
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          // AGREGAR ESTA LÍNEA para mantener la extensión del archivo original
          public_id: file.originalname.replace(/\.[^/.]+$/, ''), // Nombre sin extensión
          format: this.getFileExtension(file.originalname) // Extensión explícita
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return reject(new BadRequestException('Error al subir archivo a Cloudinary'));
          }

          const uploadResult: UploadResult = {
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            resourceType: result.resource_type,
            thumbnailUrl: result.resource_type === 'image' 
              ? this.getThumbnailUrl(result.public_id) 
              : undefined,
            originalFilename: result.original_filename
          };

          resolve(uploadResult);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw new BadRequestException('Error al procesar la subida del archivo');
  }
}

// AGREGAR ESTE MÉTODO AL FINAL DE LA CLASE
/**
 * Obtener la extensión del archivo sin el punto
 */
private getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? ext.toLowerCase() : '';
}

  /**
   * Subir múltiples archivos a Cloudinary
   * @param files - Array de archivos
   * @param folder - Carpeta destino
   * @param resourceType - Tipo de recurso
   * @returns Promise con array de resultados
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'general',
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, folder, resourceType)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Eliminar archivo de Cloudinary
   * @param publicId - ID público del archivo en Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw new BadRequestException('Error al eliminar archivo de Cloudinary');
    }
  }

  /**
   * Eliminar múltiples archivos de Cloudinary
   * @param publicIds - Array de IDs públicos
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw new BadRequestException('Error al eliminar archivos de Cloudinary');
    }
  }

  /**
   * Obtener URL de thumbnail optimizado
   * @param publicId - ID público del archivo
   * @returns URL del thumbnail
   */
  private getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }

  /**
   * Obtener información de un archivo desde Cloudinary
   * @param publicId - ID público del archivo
   * @returns Información del archivo
   */
  async getFileInfo(publicId: string) {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new BadRequestException('Error al obtener información del archivo');
    }
  }

  /**
   * Generar URL de descarga para un archivo
   * @param publicId - ID público del archivo
   * @returns URL de descarga
   */
  getDownloadUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      flags: 'attachment',
      resource_type: 'raw'
    });
  }

  /**
   * Obtener URL de imagen optimizada
   * @param publicId - ID público de la imagen
   * @param width - Ancho deseado (opcional)
   * @param height - Alto deseado (opcional)
   * @param quality - Calidad de la imagen
   * @returns URL optimizada
   */
  getOptimizedImageUrl(
    publicId: string, 
    width?: number, 
    height?: number,
    quality: 'auto' | number = 'auto'
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'limit',
      quality,
      fetch_format: 'auto'
    });
  }

  /**
   * Generar URL de thumbnail con tamaño personalizado
   * @param publicId - ID público del archivo
   * @param width - Ancho del thumbnail
   * @param height - Alto del thumbnail
   * @returns URL del thumbnail
   */
  getThumbnailUrlCustom(publicId: string, width: number = 150, height: number = 150): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }

  /**
   * Verificar si Cloudinary está configurado correctamente
   * @returns true si está configurado
   */
  isConfigured(): boolean {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    return !!(cloudName && apiKey && apiSecret);
  }

  /**
   * Obtener configuración actual de Cloudinary (sin exponer secretos)
   * @returns Objeto con información de configuración
   */
  getConfig(): { cloudName: string; isConfigured: boolean } {
    return {
      cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'not-configured',
      isConfigured: this.isConfigured()
    };
  }
}