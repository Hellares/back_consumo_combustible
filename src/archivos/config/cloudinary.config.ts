// =====================================================
// src/archivos/config/cloudinary.config.ts
// =====================================================

import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

/**
 * Provider de configuración de Cloudinary
 * Se inyecta en el módulo de archivos
 */
export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true, // Usar HTTPS
    });
  },
  inject: [ConfigService],
};