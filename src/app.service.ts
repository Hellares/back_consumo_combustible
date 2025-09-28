import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV'),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  // getInfo() {
  //   return {
  //     name: this.configService.get('APP_NAME') || 'Fuel Control API',
  //     version: process.env.npm_package_version || '1.0.0',
  //     description: 'API para el Sistema de Control de Combustible y Mantenimiento de Unidades',
  //     environment: this.configService.get('NODE_ENV'),
  //     documentation: '/api/docs',
  //     endpoints: {
  //       auth: '/api/auth',
  //       usuarios: '/api/usuarios',
  //       unidades: '/api/unidades',
  //       abastecimientos: '/api/abastecimientos',
  //       mantenimientos: '/api/mantenimientos',
  //       fallas: '/api/fallas',
  //       inspecciones: '/api/inspecciones',
  //       alertas: '/api/alertas',
  //       reportes: '/api/reportes',
  //       files: '/api/files',
  //     },
  //   };
  // }
}
