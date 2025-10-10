// =====================================================
// src/archivos/archivos.controller.ts
// =====================================================

import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  Request,
  BadRequestException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ArchivosService } from './archivos.service';
import { UploadArchivoDto } from './dto/upload-archivo.dto';
import { QueryArchivoDto } from './dto/query-archivo.dto';
import { ArchivoTicketResponseDto } from './dto/archivo-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { UPLOAD_LIMITS } from './constants/upload-limits.constant';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';

@ApiTags('Archivos de Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('archivos')
export class ArchivosController {
  constructor(private readonly archivosService: ArchivosService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subir archivos a un ticket',
    description: 'Sube uno o más archivos (imágenes o documentos) asociados a un ticket de abastecimiento. Máximo 10 archivos de 10MB cada uno.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  schema: {
    type: 'object',
    required: ['files', 'ticketId', 'tipoArchivoId'],
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary'
        },
        description: 'Archivos a subir (máximo 10, 10MB cada uno)'
      },
      ticketId: {
        type: 'number',
        description: 'ID del ticket',
        example: 1
      },
      tipoArchivoId: {
        type: 'number',
        description: 'ID del tipo de archivo (1=FOTO_GRIFO, 2=FOTO_TABLERO, etc.)',
        example: 1
      },
      descripcion: {
        type: 'string',
        description: 'Descripción opcional del archivo',
        example: 'Foto del tablero con kilometraje visible',
        maxLength: 500
      },
      orden: {
        type: 'number',
        description: 'Orden de visualización (menor número = mayor prioridad)',
        example: 1,
        default: 0
      },
      esPrincipal: {
        type: 'boolean',
        description: 'Marcar como archivo principal del ticket',
        example: false,
        default: false
      }
    }
  }
})
@ApiCreatedResponse({
  description: 'Archivos subidos exitosamente',
  type: [ArchivoTicketResponseDto]
})
@ApiBadRequestResponse({
  description: 'Archivos inválidos, exceden límites o tipo no permitido'
})
@ApiNotFoundResponse({
  description: 'Ticket o tipo de archivo no encontrado'
})
@ApiUnauthorizedResponse({
  description: 'No autorizado - Token JWT requerido'
})
@UseInterceptors(
  FilesInterceptor('files', UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD, {
    limits: {
      fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE
    }
  })
)
async uploadArchivos(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() uploadDto: UploadArchivoDto,
  @Request() req: any
): Promise<ArchivoTicketResponseDto[]> {
  if (!files || files.length === 0) {
    throw new BadRequestException('Debe proporcionar al menos un archivo');
  }

  // Las transformaciones del DTO ya se aplicaron automáticamente
  
  return this.archivosService.uploadArchivos(files, uploadDto, req.user.id);
}

  @Get('ticket/:ticketId')
  @ApiOperation({
    summary: 'Obtener archivos de un ticket',
    description: 'Retorna todos los archivos asociados a un ticket específico con filtros opcionales'
  })
  @ApiParam({
    name: 'ticketId',
    description: 'ID del ticket',
    example: 1,
    type: 'integer'
  })
  @ApiQuery({
    name: 'tipoArchivoId',
    required: false,
    description: 'Filtrar por ID de tipo de archivo',
    example: 1,
    type: 'integer'
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filtrar por categoría',
    example: 'IMAGEN',
    enum: ['IMAGEN', 'DOCUMENTO', 'COMPROBANTE']
  })
  @ApiQuery({
    name: 'solosPrincipales',
    required: false,
    description: 'Solo archivos marcados como principales',
    example: false,
    type: 'boolean'
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por estado activo',
    example: true,
    type: 'boolean'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre de archivo',
    example: 'tablero'
  })
  @ApiOkResponse({
    description: 'Archivos obtenidos exitosamente',
    type: [ArchivoTicketResponseDto]
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  async getArchivosByTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Query() queryDto: QueryArchivoDto
  ): Promise<ArchivoTicketResponseDto[]> {
    return this.archivosService.findByTicket(ticketId, queryDto);
  }

  @Get('tipos')
  @ApiOperation({
    summary: 'Obtener tipos de archivo disponibles',
    description: 'Retorna todos los tipos de archivo que se pueden subir (FOTO_GRIFO, FOTO_TABLERO, COMPROBANTE_PAGO, etc.)'
  })
  @ApiOkResponse({
    description: 'Tipos de archivo obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          codigo: { type: 'string', example: 'FOTO_TABLERO' },
          nombre: { type: 'string', example: 'Foto del Tablero' },
          descripcion: { type: 'string', example: 'Fotografía del tablero mostrando el kilometraje' },
          categoria: { type: 'string', example: 'IMAGEN' },
          requerido: { type: 'boolean', example: true },
          orden: { type: 'number', example: 1 },
          activo: { type: 'boolean', example: true }
        }
      }
    }
  })
  async getTiposArchivo() {
    return this.archivosService.getTiposArchivo();
  }

  @Get('estadisticas/:ticketId')
  @ApiOperation({
    summary: 'Obtener estadísticas de archivos por ticket',
    description: 'Retorna el conteo de archivos por tipo y categoría, incluyendo tamaño total'
  })
  @ApiParam({
    name: 'ticketId',
    description: 'ID del ticket',
    example: 1,
    type: 'integer'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalArchivos: { type: 'number', example: 8 },
        totalImagenes: { type: 'number', example: 5 },
        totalDocumentos: { type: 'number', example: 2 },
        totalComprobantes: { type: 'number', example: 1 },
        tamanoTotalBytes: { type: 'number', example: 2458960 },
        tamanoTotalFormateado: { type: 'string', example: '2.34 MB' },
        detallesPorTipo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipoArchivo: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  codigo: { type: 'string' },
                  nombre: { type: 'string' },
                  categoria: { type: 'string' }
                }
              },
              cantidad: { type: 'number' },
              tamanoTotal: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Ticket no encontrado'
  })
  async getEstadisticas(
    @Param('ticketId', ParseIntPipe) ticketId: number
  ) {
    return this.archivosService.getEstadisticasByTicket(ticketId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un archivo específico',
    description: 'Retorna la información detallada de un archivo por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del archivo',
    example: 1,
    type: 'integer'
  })
  @ApiOkResponse({
    description: 'Archivo encontrado',
    type: ArchivoTicketResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Archivo no encontrado'
  })
  async getArchivo(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ArchivoTicketResponseDto> {
    return this.archivosService.findOne(id);
  }

  @Patch(':id/principal')
  @ApiOperation({
    summary: 'Marcar archivo como principal',
    description: 'Establece un archivo como la imagen principal del ticket. Solo puede haber una imagen principal por ticket.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del archivo a marcar como principal',
    example: 1,
    type: 'integer'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ticketId'],
      properties: {
        ticketId: {
          type: 'number',
          description: 'ID del ticket para validar que el archivo le pertenece',
          example: 1
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Archivo marcado como principal exitosamente',
    type: ArchivoTicketResponseDto
  })
  @ApiNotFoundResponse({
    description: 'Archivo no encontrado o no pertenece al ticket'
  })
  @ApiBadRequestResponse({
    description: 'ticketId es requerido'
  })
  async setAsPrincipal(
    @Param('id', ParseIntPipe) id: number,
    @Body('ticketId', ParseIntPipe) ticketId: number
  ): Promise<ArchivoTicketResponseDto> {
    if (!ticketId) {
      throw new BadRequestException('ticketId es requerido');
    }
    return this.archivosService.setAsPrincipal(id, ticketId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar archivo',
    description: 'Elimina un archivo del sistema (soft delete). El archivo se marca como inactivo pero no se elimina físicamente de Cloudinary.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del archivo a eliminar',
    example: 1,
    type: 'integer'
  })
  @ApiOkResponse({
    description: 'Archivo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Archivo eliminado exitosamente' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Archivo no encontrado'
  })
  async removeArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    return this.archivosService.remove(id, req.user.id);
  }
}