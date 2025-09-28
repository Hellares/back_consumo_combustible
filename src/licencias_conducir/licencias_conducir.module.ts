import { Module } from '@nestjs/common';
import { LicenciasConducirService } from './licencias_conducir.service';
import { LicenciasConducirController } from './licencias_conducir.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LicenciasConducirController],
  providers: [LicenciasConducirService],
  exports: [LicenciasConducirService]
})
export class LicenciasConducirModule {}
