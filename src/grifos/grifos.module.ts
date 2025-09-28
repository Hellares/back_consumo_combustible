import { Module } from '@nestjs/common';
import { GrifosService } from './grifos.service';
import { GrifosController } from './grifos.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GrifosController],
  providers: [GrifosService],
  exports: [GrifosService]
})
export class GrifosModule {}
