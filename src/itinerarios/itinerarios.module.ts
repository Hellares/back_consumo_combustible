import { Module } from '@nestjs/common';
import { ItinerariosService } from './itinerarios.service';
import { ItinerariosController } from './itinerarios.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ItinerariosController],
  providers: [ItinerariosService],
  exports: [ItinerariosService],
})
export class ItinerariosModule {}
