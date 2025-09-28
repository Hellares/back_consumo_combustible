import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaModule } from 'src/database/prisma.module';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
