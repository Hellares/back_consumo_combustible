import { Module } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { SedesController } from './sedes.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SedesController],
  providers: [SedesService],
  exports: [SedesService]
})
export class SedesModule {}
