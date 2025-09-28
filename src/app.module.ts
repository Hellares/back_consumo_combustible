import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, 
    AuthModule, 
    UsuariosModule, RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
