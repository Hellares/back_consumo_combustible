import { Module } from '@nestjs/common';
import { RutasExcepcionalesService } from './rutas-excepcionales.service';
import { RutasExcepcionalesController } from './rutas-excepcionales.controller';
import { PrismaModule } from '@/database/prisma.module';
import { ValidacionAsignacionesModule } from '@/asignaciones/validacion/validacion-asignaciones.module';

@Module({
  imports: [
    PrismaModule,
    ValidacionAsignacionesModule, // 👈 Importar validación
  ],
  controllers: [RutasExcepcionalesController],
  providers: [RutasExcepcionalesService],
  exports: [RutasExcepcionalesService], // Por si lo necesitas en otros módulos
})
export class RutasExcepcionalesModule {}