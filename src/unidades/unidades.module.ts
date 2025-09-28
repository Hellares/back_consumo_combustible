import { Module } from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UnidadesController],
  providers: [UnidadesService],
  exports: [UnidadesService]
})
export class UnidadesModule {}
