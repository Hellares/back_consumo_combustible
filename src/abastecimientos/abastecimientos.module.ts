import { Module } from '@nestjs/common';
import { AbastecimientosService } from './abastecimientos.service';
import { AbastecimientosController } from './abastecimientos.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AbastecimientosController],
  providers: [AbastecimientosService],
  exports: [AbastecimientosService]
})
export class AbastecimientosModule {}
