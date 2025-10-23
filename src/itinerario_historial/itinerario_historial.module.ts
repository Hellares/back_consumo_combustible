import { Module } from '@nestjs/common';
import { ItinerarioHistorialService } from './itinerario_historial.service';
import { ItinerarioHistorialController } from './itinerario_historial.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ItinerarioHistorialController],
  providers: [ItinerarioHistorialService],
  exports: [ItinerarioHistorialService],
})
export class ItinerarioHistorialModule {}
