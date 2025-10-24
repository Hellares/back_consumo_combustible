import { Module } from '@nestjs/common';
import { ValidacionAsignacionesService } from './validacion-asignaciones.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ValidacionAsignacionesService],
  exports: [ValidacionAsignacionesService], // ⚠️ Importante: exportar para usar en otros módulos
})
export class ValidacionAsignacionesModule {}
