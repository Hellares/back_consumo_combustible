import { Module } from '@nestjs/common';
import { ZonasService } from './zonas.service';
import { ZonasController } from './zonas.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ZonasController],
  providers: [ZonasService],
  exports: [ZonasService]
})
export class ZonasModule {}
