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
import { TicketsAbastecimientoModule } from './tickets_abastecimiento/tickets_abastecimiento.module';
import { ArchivosModule } from './archivos/archivos.module';
import { DetallesAbastecimientoModule } from './detalles-abastecimiento/detalles-abastecimiento.module';
import { ReportesModule } from './reportes/reportes.module';
import { GpsModule } from './gps/gps.module';
import { RutasModule } from './rutas/rutas.module';
import { ItinerariosModule } from './itinerarios/itinerarios.module';
import { UnidadItinerarioModule } from './unidad_itinerario/asignaciones-itinerario.module';
import { ItinerarioHistorialModule } from './itinerario_historial/itinerario_historial.module';
import { ValidacionAsignacionesModule } from './asignaciones/validacion/validacion-asignaciones.module';
import { RutasExcepcionalesModule } from './rutas-excepcionales/rutas-excepcionales.module';
import { CheckpointsRutaModule } from './checkpoints-ruta/checkpoints-ruta.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule, 
    RolesModule, 
    ZonasModule, 
    SedesModule, 
    GrifosModule, 
    LicenciasConducirModule, 
    UnidadesModule, 
    TurnosModule, 
    TicketsAbastecimientoModule, 
    ArchivosModule, 
    DetallesAbastecimientoModule, 
    ReportesModule, 
    GpsModule, 
    RutasModule, 
    ItinerariosModule, 
    UnidadItinerarioModule, 
    ItinerarioHistorialModule, 
    ValidacionAsignacionesModule, 
    RutasExcepcionalesModule, CheckpointsRutaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
