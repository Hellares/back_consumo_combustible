import { PrismaModule } from '@/database/prisma.module';
import { Module } from '@nestjs/common';
import { AsignacionesItinerarioController } from './asignaciones-itinerario.controller';
import { AsignacionesItinerarioService } from './asignaciones-itinerario.service';
import { ValidacionAsignacionesModule } from '@/asignaciones/validacion/validacion-asignaciones.module';


@Module({
  imports: [
    PrismaModule,
    ValidacionAsignacionesModule,
  ],
  controllers: [AsignacionesItinerarioController],
  providers: [AsignacionesItinerarioService],
  exports: [AsignacionesItinerarioService],
})
export class UnidadItinerarioModule {}
