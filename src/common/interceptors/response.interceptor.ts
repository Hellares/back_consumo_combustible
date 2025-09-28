import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    [key: string]: any;
  };
}

interface StandardApiResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardApiResponse> {

  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardApiResponse> {
    const serviceName = this.extractServiceName(context);
    const method = this.getHttpMethod(context);

    return next.handle().pipe(
      map(data => {
        // Si ya tiene la estructura success/message/data, la mantiene
        if (data && typeof data === 'object' && 'success' in data && 'message' in data && 'data' in data) {
          return data;
        }
        
        // Detectar si es una respuesta paginada
        if (this.isPaginatedResponse(data)) {
          return {
            success: true,
            message: this.getSuccessMessage(serviceName, method),
            data: data // Mantener la estructura { data: [...], meta: {...} }
          };
        }
        
        // Para respuestas simples (arrays, objetos, primitivos)
        return {
          success: true,
          message: this.getSuccessMessage(serviceName, method),
          data: data
        };
      })
    );
  }

  private isPaginatedResponse(data: any): data is PaginatedResponse {
    return data && 
           typeof data === 'object' && 
           'data' in data && 
           'meta' in data && 
           Array.isArray(data.data) &&
           data.meta &&
           typeof data.meta === 'object' &&
           'total' in data.meta;
  }

  private extractServiceName(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path || '';
    const match = path.match(/\/api\/(\w+)/);
    return match ? match[1] : 'unknown';
  }

  private getHttpMethod(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    return request.method;
  }

  private getSuccessMessage(serviceName: string, method: string): string {
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