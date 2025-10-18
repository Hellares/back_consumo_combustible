// =============================================
// GPS Module - Módulo Principal de Tracking
// =============================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Prisma
import { PrismaModule } from '../database/prisma.module';

// Componentes del módulo GPS
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { GpsGateway } from './gps.gateway';

// Guards
import { WsJwtGuard } from './guards/ws-jwt.guard';

// Providers (los crearemos después pero los dejamos preparados)
// import { MobileGpsProvider } from './providers/mobile-gps.provider';
// import { DeviceGpsProvider } from './providers/device-gps.provider';
// import { HybridGpsProvider } from './providers/hybrid-gps.provider';

/**
 * Módulo GPS - Sistema de Tracking en Tiempo Real
 * 
 * Características:
 * - WebSocket para tracking en tiempo real
 * - REST API para backup y consultas
 * - Soporte híbrido: GPS vehicular + GPS móvil
 * - Autenticación JWT obligatoria
 * - Sistema de permisos por rol
 * 
 * @requires PrismaModule - Acceso a base de datos
 * @requires JwtModule - Autenticación de usuarios
 */
@Module({
  imports: [
    // Módulo de Base de Datos
    PrismaModule,

    // Módulo de Configuración (para variables de entorno)
    ConfigModule,

    // Módulo JWT para autenticación
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],

  controllers: [
    GpsController, // REST API
  ],

  providers: [
    GpsService,    // Lógica de negocio
    GpsGateway,    // WebSocket Gateway
    WsJwtGuard,    // Guard para WebSocket

    // 🔮 Providers híbridos (para implementar en Fase 2)
    // MobileGpsProvider,
    // DeviceGpsProvider,
    // HybridGpsProvider,
  ],

  exports: [
    GpsService,    // Exportar para que otros módulos puedan usarlo
    GpsGateway,    // Exportar para acceso desde otros módulos si es necesario
  ],
})
export class GpsModule {}