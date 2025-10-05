
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthService } from './auth/auth.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración de seguridad
  app.use(helmet());
  app.use(compression());

  // Configuración de CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configuración de pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de versionado de API
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  // Prefijo global para la API
  app.setGlobalPrefix('api');
  // IMPORTANTE: El orden importa - el filtro debe ir ANTES que el interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('API Consumo Combustible')
    .setDescription('API para la gestión del consumo de combustible y mantenimiento de unidades.')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('usuarios', 'Gestión de usuarios')
    .addTag('unidades', 'Gestión de unidades de transporte')
    .addTag('abastecimientos', 'Control de abastecimientos')
    .addTag('Archivos de Tickets', 'Gestión de archivos y documentos')
    .addTag('mantenimientos', 'Gestión de mantenimientos')
    .addTag('fallas', 'Gestión de fallas y reparaciones')
    .addTag('inspecciones', 'Inspecciones de unidades')
    .addTag('alertas', 'Sistema de alertas')
    .addTag('reportes', 'Reportes y estadísticas')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const authService = app.get(AuthService);
  await authService.preloadDefaultRole();
  

  const port = configService.get('APP_PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
}
bootstrap();
