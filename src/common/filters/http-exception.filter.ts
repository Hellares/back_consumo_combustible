import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

export interface ErrorResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    status: number;
    code: ErrorCode;
    error: string;
  };
}

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

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private readonly errorMappings = new Map<number, { code: ErrorCode; error: string }>([
    [400, { code: ErrorCode.BAD_REQUEST, error: 'Solicitud Inválida' }],
    [401, { code: ErrorCode.UNAUTHORIZED, error: 'No Autorizado' }],
    [403, { code: ErrorCode.FORBIDDEN, error: 'Acceso Prohibido' }],
    [404, { code: ErrorCode.NOT_FOUND, error: 'Recurso No Encontrado' }],
    [409, { code: ErrorCode.CONFLICT, error: 'Conflicto de Negocio' }],
    [500, { code: ErrorCode.INTERNAL_SERVER_ERROR, error: 'Error Interno del Servidor' }],
    [503, { code: ErrorCode.SERVICE_UNAVAILABLE, error: 'Servicio No Disponible' }],
    [504, { code: ErrorCode.GATEWAY_TIMEOUT, error: 'Timeout del Gateway' }]
  ]);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    // Manejar HttpException (incluye UnauthorizedException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        // Si ya viene con la estructura success/message/data, la mantenemos
        if ('success' in exceptionResponse && 'message' in exceptionResponse && 'data' in exceptionResponse) {
          response.status(status).json(exceptionResponse);
          this.logError(status, message, request);
          return;
        }

        // Extraer mensaje de diferentes formatos de respuesta
        message = exceptionResponse['message'] || exceptionResponse['error'] || message;
        
        // Si es un array de mensajes (validation errors), los concatenamos
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      }
    }

    // Obtener mapeo de error
    const errorMapping = this.errorMappings.get(status) || {
      code: ErrorCode.SYSTEM_ERROR,
      error: 'Error del Sistema'
    };

    // Estructurar respuesta de error
    const errorResponse: ErrorResponse = {
      success: false,
      message: message,
      data: {
        message: message,
        status: status,
        code: errorMapping.code,
        error: errorMapping.error
      }
    };

    // Log del error
    this.logError(status, message, request, exception);

    response.status(status).json(errorResponse);
  }

  private logError(status: number, message: string, request: any, exception?: any): void {
    const logData = {
      status,
      method: request.method,
      url: request.url,
      message,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      ...(process.env.NODE_ENV !== 'production' && exception?.stack && { 
        stack: exception.stack 
      })
    };

    if (status >= 500) {
      this.logger.error(`HTTP ${status} Error: ${message}`, logData);
    } else if (status === 401 || status === 403) {
      this.logger.warn(`HTTP ${status} Auth Error: ${message}`, logData);
    } else {
      this.logger.log(`HTTP ${status} Client Error: ${message}`, logData);
    }
  }
}