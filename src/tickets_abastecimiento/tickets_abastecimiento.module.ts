import { Module } from '@nestjs/common';
import { TicketsAbastecimientoService } from './tickets_abastecimiento.service';
import { TicketsAbastecimientoController } from './tickets_abastecimiento.controller';

@Module({
  controllers: [TicketsAbastecimientoController],
  providers: [TicketsAbastecimientoService],
})
export class TicketsAbastecimientoModule {}
