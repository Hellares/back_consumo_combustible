import { Module } from '@nestjs/common';
import { ArchivosService } from './archivos.service';
import { ArchivosController } from './archivos.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/database/prisma.module';
import { CloudinaryService } from './providers/cloudinary.service';

@Module({
  imports: [
    ConfigModule, // Para acceder a variables de entorno
    PrismaModule  // Para acceso a la base de datos
  ],
  controllers: [ArchivosController],
  providers: [
    ArchivosService, 
    CloudinaryService
  ],
  exports: [
    ArchivosService,      // Exportar para usar en otros módulos
    CloudinaryService     // Exportar para usar en otros módulos
  ]
})
export class ArchivosModule {}
