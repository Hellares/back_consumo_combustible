import { Module } from '@nestjs/common';
import { DetallesAbastecimientoService } from './detalles-abastecimiento.service';
import { DetallesAbastecimientoController } from './detalles-abastecimiento.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [DetallesAbastecimientoController],
  providers: [DetallesAbastecimientoService],
  exports: [DetallesAbastecimientoService]
})
export class DetallesAbastecimientoModule {}
