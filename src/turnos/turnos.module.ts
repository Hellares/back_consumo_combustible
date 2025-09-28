import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService]
})
export class TurnosModule {}
