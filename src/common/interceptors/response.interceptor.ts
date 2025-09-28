

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const serviceName = this.extractServiceName(context);

    return next.handle().pipe(
      map(data => {
        // Si ya tiene la estructura success/message/data, la mantiene
        if (data && typeof data === 'object' && 'success' in data && 'message' in data && 'data' in data) {
          return data;
        }
        
        // Si no, la envuelve en la estructura estándar
        return {
          success: true,
          message: this.getSuccessMessage(serviceName, context),
          data,
        };
      })
    );
  }

  private extractServiceName(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path || '';
    const match = path.match(/\/(\w+)/);
    return match ? match[1] : 'unknown';
  }

  private getSuccessMessage(serviceName: string, context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Personalizar mensajes según el servicio y método HTTP
    const messages = {
      user: {
        POST: 'Usuario creado exitosamente',
        GET: 'Usuarios obtenidos exitosamente',
        PUT: 'Usuario actualizado exitosamente',
        PATCH: 'Usuario actualizado exitosamente',
        DELETE: 'Usuario eliminado exitosamente'
      },
      auth: {
        POST: 'Autenticación exitosa',
        GET: 'Información obtenida exitosamente'
      },
      default: {
        POST: 'Recurso creado exitosamente',
        GET: 'Información obtenida exitosamente',
        PUT: 'Recurso actualizado exitosamente',
        PATCH: 'Recurso actualizado exitosamente',
        DELETE: 'Recurso eliminado exitosamente'
      }
    };

    return messages[serviceName]?.[method] || 
           messages.default[method] || 
           'Operación exitosa';
  }
}