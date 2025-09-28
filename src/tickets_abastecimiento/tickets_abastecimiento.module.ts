import { Module } from '@nestjs/common';
import { TicketsAbastecimientoService } from './tickets_abastecimiento.service';
import { TicketsAbastecimientoController } from './tickets_abastecimiento.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsAbastecimientoController],
  providers: [TicketsAbastecimientoService],
  exports: [TicketsAbastecimientoService]
})
export class TicketsAbastecimientoModule {}
