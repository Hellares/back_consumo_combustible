import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { RolesModule } from './roles/roles.module';
import { ZonasModule } from './zonas/zonas.module';
import { SedesModule } from './sedes/sedes.module';
import { GrifosModule } from './grifos/grifos.module';
import { LicenciasConducirModule } from './licencias_conducir/licencias_conducir.module';
import { UnidadesModule } from './unidades/unidades.module';
import { TurnosModule } from './turnos/turnos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, 
    AuthModule, 
    UsuariosModule, RolesModule, ZonasModule, SedesModule, GrifosModule, LicenciasConducirModule, UnidadesModule, TurnosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
