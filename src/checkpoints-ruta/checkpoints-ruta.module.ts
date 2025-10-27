import { Module } from '@nestjs/common';
import { CheckpointsRutaService } from './checkpoints-ruta.service';
import { CheckpointsRutaController } from './checkpoints-ruta.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CheckpointsRutaController],
  providers: [CheckpointsRutaService],
  exports: [CheckpointsRutaService],
})
export class CheckpointsRutaModule {}
