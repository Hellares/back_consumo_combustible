
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthService } from './auth/auth.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

console.log('========== INICIANDO APLICACIÓN ==========');

async function bootstrap() {
  try {
    console.log('1. Bootstrap function called');
    
    console.log('2. Creando aplicación NestJS...');
    const app = await NestFactory.create(AppModule);
    console.log('3. ✓ Aplicación creada exitosamente');
    
    console.log('4. Obteniendo ConfigService...');
    const configService = app.get(ConfigService);
    console.log('5. ✓ ConfigService obtenido');

    console.log('6. Configurando seguridad...');
    app.use(helmet());
    app.use(compression());
    console.log('7. ✓ Seguridad configurada');

    console.log('8. Configurando CORS...');
    app.enableCors({
      origin: configService.get('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });
    console.log('9. ✓ CORS configurado');

    console.log('10. Configurando pipes globales...');
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
    console.log('11. ✓ Pipes configurados');

    console.log('12. Configurando prefijo global...');
    app.setGlobalPrefix('api');
    console.log('13. ✓ Prefijo global configurado');

    console.log('14. Configurando filtros e interceptores...');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    console.log('15. ✓ Filtros e interceptores configurados');

    console.log('16. Configurando Swagger...');
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
    console.log('17. ✓ Swagger configurado');

    console.log('18. Precargando rol por defecto...');
    const authService = app.get(AuthService);
    await authService.preloadDefaultRole();
    console.log('19. ✓ Rol por defecto precargado');

    const port = configService.get('APP_PORT') || 3000;
    console.log(`20. Iniciando servidor en puerto ${port}...`);
    
    await app.listen(port);

    console.log(`\n🚀 Aplicación ejecutándose en: http://localhost:${port}`);
    console.log(`📚 Documentación API: http://localhost:${port}/api/docs\n`);
    
  } catch (error) {
    console.error('\n❌ ERROR EN BOOTSTRAP:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('\n❌ ERROR FATAL AL INICIAR:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});