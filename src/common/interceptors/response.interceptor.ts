import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface StructuredError {
  message: string;
  status: number;
  code: ErrorCode;
  error?: string;
}

interface HttpExceptionResponse {
  message?: string;
  error?: string;
  field?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T | StructuredError>> {
  private readonly logger = new Logger(ResponseInterceptor.name);

  private readonly errorMappings = new Map<number, Partial<StructuredError>>([
    [400, { status: HttpStatus.BAD_REQUEST, code: ErrorCode.BAD_REQUEST, error: 'Solicitud Inválida' }],
    [401, { status: HttpStatus.UNAUTHORIZED, code: ErrorCode.UNAUTHORIZED, error: 'No Autorizado' }],
    [403, { status: HttpStatus.FORBIDDEN, code: ErrorCode.FORBIDDEN, error: 'Acceso Prohibido' }],
    [404, { status: HttpStatus.NOT_FOUND, code: ErrorCode.NOT_FOUND, error: 'Recurso No Encontrado' }],
    [409, { status: HttpStatus.CONFLICT, code: ErrorCode.CONFLICT, error: 'Conflicto de Negocio' }],
    [503, { status: HttpStatus.SERVICE_UNAVAILABLE, code: ErrorCode.SERVICE_UNAVAILABLE, error: 'Servicio No Disponible' }],
    [504, { status: HttpStatus.GATEWAY_TIMEOUT, code: ErrorCode.GATEWAY_TIMEOUT, error: 'Timeout del Gateway' }]
  ]);

  private readonly serviceErrorMessages = {
    user: {
      404: 'Usuario no encontrado',
      409: 'El usuario ya existe',
      403: 'No tienes permisos para modificar este usuario'
    },
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T | StructuredError>> {
    const request = context.switchToHttp().getRequest();
    const serviceName = this.extractServiceName(context);

    return next.handle().pipe(
      map(data => {
        if (data && typeof data === 'object' && 'success' in data && 'message' in data && 'data' in data) {
          return data;
        }
        return {
          success: true,
          message: serviceName === 'user' ? 'Usuario creado exitosamente' : 'Operación exitosa',
          data,
        };
      }),
      catchError(err => {
        const structuredError = this.mapToStructuredError(err, serviceName);
        this.logError(structuredError, err, serviceName, request);
        return throwError(() => new HttpException({
          success: false,
          message: structuredError.message,
          data: structuredError,
        }, structuredError.status));
      })
    );
  }

  private extractServiceName(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path || '';
    const match = path.match(/\/(\w+)/);
    return match ? match[1] : 'unknown';
  }

  private mapToStructuredError(error: any, serviceName: string): StructuredError {
    if (error instanceof HttpException) {
      const response = error.getResponse() as string | HttpExceptionResponse;
      const status = error.getStatus();
      const mapping = this.errorMappings.get(status);

      const message = this.getServiceMessage(serviceName, status) ||
                      (typeof response === 'string' ? response : 
                       (response && typeof response === 'object' && response.message) ? response.message : 
                       mapping?.error || 'Error en el servicio');

      return {
        message,
        status: mapping?.status || status || HttpStatus.INTERNAL_SERVER_ERROR,
        code: mapping?.code || ErrorCode.SYSTEM_ERROR,
        error: mapping?.error || 'Error del Sistema'
      };
    }

    if (error.name === 'TimeoutError') {
      return {
        message: this.getServiceMessage(serviceName, 504) || 'Tiempo de conexión agotado',
        status: HttpStatus.GATEWAY_TIMEOUT,
        code: ErrorCode.GATEWAY_TIMEOUT,
        error: 'Timeout Error'
      };
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
      return {
        message: `No se puede conectar con el servicio de ${serviceName}`,
        status: HttpStatus.SERVICE_UNAVAILABLE,
        code: ErrorCode.SERVICE_UNAVAILABLE,
        error: 'Error de Conexión'
      };
    }

    if (error.name === 'ValidationError' || error.name === 'BadRequestException') {
      return {
        message: error.message || 'Datos de entrada inválidos',
        status: HttpStatus.BAD_REQUEST,
        code: ErrorCode.VALIDATION_ERROR,
        error: 'Error de Validación'
      };
    }

    return {
      message: error.message || 'Error interno del servidor',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.SYSTEM_ERROR,
      error: 'Error del Sistema'
    };
  }

  private getServiceMessage(serviceName: string, status: number): string | null {
    return this.serviceErrorMessages[serviceName]?.[status] || null;
  }

  private logError(structuredError: StructuredError, originalError: any, serviceName: string, request: any): void {
    if (this.shouldLog(structuredError)) {
      const logData = {
        code: structuredError.code,
        status: structuredError.status,
        service: serviceName,
        method: request.method,
        url: request.url,
        message: structuredError.message,
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: originalError.stack
        })
      };

      if (structuredError.status >= 500) {
        this.logger.error(`[${serviceName}] ${structuredError.message}`, logData);
      } else {
        this.logger.warn(`[${serviceName}] ${structuredError.message}`, logData);
      }
    }
  }

  private shouldLog(error: StructuredError): boolean {
    return error.status >= 500 || 
           [ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN, ErrorCode.CONFLICT, ErrorCode.SERVICE_UNAVAILABLE].includes(error.code);
  }
}