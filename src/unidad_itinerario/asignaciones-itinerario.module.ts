import { PrismaModule } from '@/database/prisma.module';
import { Module } from '@nestjs/common';
import { AsignacionesItinerarioController } from './asignaciones-itinerario.controller';
import { AsignacionesItinerarioService } from './asignaciones-itinerario.service';


@Module({
  imports: [PrismaModule],
  controllers: [AsignacionesItinerarioController],
  providers: [AsignacionesItinerarioService],
  exports: [AsignacionesItinerarioService],
})
export class UnidadItinerarioModule {}
