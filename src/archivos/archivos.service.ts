// =====================================================
// src/archivos/archivos.service.ts
// =====================================================

import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CloudinaryService } from './providers/cloudinary.service';
import { UploadArchivoDto } from './dto/upload-archivo.dto';
import { QueryArchivoDto } from './dto/query-archivo.dto';
import { ArchivoTicketResponseDto } from './dto/archivo-response.dto';
import { plainToInstance } from 'class-transformer';
import { CLOUDINARY_FOLDERS, UPLOAD_LIMITS, UPLOAD_ERROR_MESSAGES } from './constants/upload-limits.constant';
import * as path from 'path';

@Injectable()
export class ArchivosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  /**
   * Subir uno o más archivos para un ticket
   */
  async uploadArchivos(
    files: Express.Multer.File[],
    uploadDto: UploadArchivoDto,
    subidoPorId: number
  ): Promise<ArchivoTicketResponseDto[]> {
    // 1. Validar ticket existe
    const ticket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id: uploadDto.ticketId }
    });

    if (!ticket) {
      throw new NotFoundException(
        UPLOAD_ERROR_MESSAGES.TICKET_NOT_FOUND(uploadDto.ticketId)
      );
    }

    // 2. Validar tipo de archivo existe
    const tipoArchivo = await this.prisma.tipoArchivoTicket.findUnique({
      where: { id: uploadDto.tipoArchivoId }
    });

    if (!tipoArchivo) {
      throw new NotFoundException(
        UPLOAD_ERROR_MESSAGES.TIPO_ARCHIVO_NOT_FOUND(uploadDto.tipoArchivoId)
      );
    }

    if (!tipoArchivo.activo) {
      throw new BadRequestException('El tipo de archivo no está activo');
    }

    // 3. Validar archivos
    this.validateFiles(files, tipoArchivo.categoria);

    // 4. Subir archivos a Cloudinary
    const folder = `${CLOUDINARY_FOLDERS.TICKETS}/${uploadDto.ticketId}`;
    const resourceType = tipoArchivo.categoria === 'IMAGEN' ? 'image' : 'raw';
    
    const uploadResults = await this.cloudinaryService.uploadMultipleFiles(
      files,
      folder,
      resourceType
    );

    // 5. Guardar información en base de datos
    const archivosGuardados = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadResult = uploadResults[i];
      
      const archivoData = {
        ticketId: uploadDto.ticketId,
        tipoArchivoId: uploadDto.tipoArchivoId,
        nombreArchivo: this.generateFileName(
          uploadDto.ticketId,
          tipoArchivo.codigo,
          file.originalname
        ),
        nombreOriginal: file.originalname,
        url: uploadResult.secureUrl,
        urlThumbnail: uploadResult.thumbnailUrl,
        rutaAlmacenamiento: uploadResult.publicId,
        tipoMime: file.mimetype,
        tamanoBytes: BigInt(uploadResult.bytes),
        extension: path.extname(file.originalname),
        metadatos: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          resourceType: uploadResult.resourceType
        },
        descripcion: uploadDto.descripcion,
        orden: uploadDto.orden !== undefined ? uploadDto.orden : i,
        esPrincipal: uploadDto.esPrincipal || false,
        subidoPorId
      };

      const archivo = await this.prisma.archivoTicket.create({
        data: archivoData,
        include: {
          tipoArchivo: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              descripcion: true,
              categoria: true,
              requerido: true,
              orden: true
            }
          },
          subidoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              codigoEmpleado: true
            }
          }
        }
      });

      archivosGuardados.push(archivo);
    }

    return archivosGuardados.map(archivo => this.transformToResponseDto(archivo));
  }

  /**
   * Obtener archivos de un ticket con filtros
   */
  async findByTicket(ticketId: number, queryDto?: QueryArchivoDto) {
    const whereConditions: any = {
      ticketId,
      activo: queryDto?.activo !== undefined ? queryDto.activo : true
    };

    if (queryDto?.tipoArchivoId) {
      whereConditions.tipoArchivoId = queryDto.tipoArchivoId;
    }

    if (queryDto?.categoria) {
      whereConditions.tipoArchivo = {
        categoria: queryDto.categoria
      };
    }

    if (queryDto?.solosPrincipales) {
      whereConditions.esPrincipal = true;
    }

    if (queryDto?.search) {
      whereConditions.OR = [
        { nombreArchivo: { contains: queryDto.search, mode: 'insensitive' } },
        { nombreOriginal: { contains: queryDto.search, mode: 'insensitive' } },
        { descripcion: { contains: queryDto.search, mode: 'insensitive' } }
      ];
    }

    const archivos = await this.prisma.archivoTicket.findMany({
      where: whereConditions,
      include: {
        tipoArchivo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            descripcion: true,
            categoria: true,
            requerido: true,
            orden: true
          }
        },
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      },
      orderBy: [
        { esPrincipal: 'desc' },
        { orden: 'asc' },
        { fechaSubida: 'desc' }
      ]
    });

    return archivos.map(archivo => this.transformToResponseDto(archivo));
  }

  /**
   * Obtener un archivo específico
   */
  async findOne(id: number): Promise<ArchivoTicketResponseDto> {
    const archivo = await this.prisma.archivoTicket.findUnique({
      where: { id },
      include: {
        tipoArchivo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            descripcion: true,
            categoria: true,
            requerido: true,
            orden: true
          }
        },
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      }
    });

    if (!archivo) {
      throw new NotFoundException(
        UPLOAD_ERROR_MESSAGES.ARCHIVO_NOT_FOUND(id)
      );
    }

    return this.transformToResponseDto(archivo);
  }

  /**
   * Eliminar archivo (soft delete)
   */
  async remove(id: number, usuarioId: number) {
    const archivo = await this.prisma.archivoTicket.findUnique({
      where: { id }
    });

    if (!archivo) {
      throw new NotFoundException(
        UPLOAD_ERROR_MESSAGES.ARCHIVO_NOT_FOUND(id)
      );
    }

    //! Eliminar de Cloudinary sino solo softdelete
    // try {
    //   await this.cloudinaryService.deleteFile(archivo.rutaAlmacenamiento);
    // } catch (error) {
    //   console.error('Error al eliminar de Cloudinary:', error);
    //   // Continuar con el soft delete aunque falle la eliminación de Cloudinary
    // }

    // Soft delete en base de datos
    await this.prisma.archivoTicket.update({
      where: { id },
      data: { activo: false }
    });

    return { 
      success: true,
      message: 'Archivo eliminado exitosamente' 
    };
  }

  /**
   * Marcar archivo como principal
   */
  async setAsPrincipal(id: number, ticketId: number): Promise<ArchivoTicketResponseDto> {
    // Validar que el archivo existe y pertenece al ticket
    const archivo = await this.prisma.archivoTicket.findFirst({
      where: { 
        id,
        ticketId,
        activo: true
      }
    });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado o no pertenece al ticket especificado');
    }

    // Desmarcar todos los archivos principales del ticket (solo para imágenes)
    const imageTypeIds = await this.getImageTypeIds();
    
    await this.prisma.archivoTicket.updateMany({
      where: { 
        ticketId,
        tipoArchivoId: { in: imageTypeIds },
        activo: true
      },
      data: { esPrincipal: false }
    });

    // Marcar el nuevo como principal
    const archivoActualizado = await this.prisma.archivoTicket.update({
      where: { id },
      data: { esPrincipal: true },
      include: {
        tipoArchivo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            descripcion: true,
            categoria: true,
            requerido: true,
            orden: true
          }
        },
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            codigoEmpleado: true
          }
        }
      }
    });

    return this.transformToResponseDto(archivoActualizado);
  }

  /**
   * Obtener todos los tipos de archivo disponibles
   */
  async getTiposArchivo() {
    return await this.prisma.tipoArchivoTicket.findMany({
      where: { activo: true },
      orderBy: [
        { categoria: 'asc' },
        { orden: 'asc' }
      ]
    });
  }

  /**
   * Obtener estadísticas de archivos por ticket
   */
  async getEstadisticasByTicket(ticketId: number) {
    // Validar que el ticket existe
    const ticket = await this.prisma.ticketAbastecimiento.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new NotFoundException(
        UPLOAD_ERROR_MESSAGES.TICKET_NOT_FOUND(ticketId)
      );
    }

    const archivos = await this.prisma.archivoTicket.groupBy({
      by: ['tipoArchivoId'],
      where: { 
        ticketId,
        activo: true 
      },
      _count: true,
      _sum: {
        tamanoBytes: true
      }
    });

    const tiposConArchivos = await Promise.all(
      archivos.map(async (item) => {
        const tipo = await this.prisma.tipoArchivoTicket.findUnique({
          where: { id: item.tipoArchivoId }
        });
        return {
          tipoArchivo: tipo,
          cantidad: item._count,
          tamanoTotal: Number(item._sum.tamanoBytes || 0)
        };
      })
    );

    const totalArchivos = archivos.reduce((sum, item) => sum + item._count, 0);
    const tamanoTotalBytes = archivos.reduce((sum, item) => sum + Number(item._sum.tamanoBytes || 0), 0);
    
    const totalImagenes = tiposConArchivos
      .filter(item => item.tipoArchivo?.categoria === 'IMAGEN')
      .reduce((sum, item) => sum + item.cantidad, 0);
    
    const totalDocumentos = tiposConArchivos
      .filter(item => item.tipoArchivo?.categoria === 'DOCUMENTO')
      .reduce((sum, item) => sum + item.cantidad, 0);

    const totalComprobantes = tiposConArchivos
      .filter(item => item.tipoArchivo?.categoria === 'COMPROBANTE')
      .reduce((sum, item) => sum + item.cantidad, 0);

    return {
      totalArchivos,
      totalImagenes,
      totalDocumentos,
      totalComprobantes,
      tamanoTotalBytes,
      tamanoTotalFormateado: this.formatBytes(tamanoTotalBytes),
      detallesPorTipo: tiposConArchivos
    };
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Validar archivos antes de subir
   */
  private validateFiles(files: Express.Multer.File[], categoria: string) {
    if (!files || files.length === 0) {
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.NO_FILES);
    }

    if (files.length > UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD) {
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.TOO_MANY_FILES);
    }

    const allowedMimeTypes = categoria === 'IMAGEN' 
      ? UPLOAD_LIMITS.ALLOWED_IMAGE_MIMETYPES
      : [...UPLOAD_LIMITS.ALLOWED_IMAGE_MIMETYPES, ...UPLOAD_LIMITS.ALLOWED_DOCUMENT_MIMETYPES];

    files.forEach(file => {
      // Validar tamaño
      if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
        throw new BadRequestException(
          UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE(file.originalname, UPLOAD_LIMITS.MAX_FILE_SIZE)
        );
      }

      // Validar tipo MIME
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          UPLOAD_ERROR_MESSAGES.INVALID_FILE_TYPE(file.originalname, file.mimetype)
        );
      }
    });
  }

  /**
   * Generar nombre único para archivo
   */
  private generateFileName(ticketId: number, tipoArchivoCodigo: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 30); // Limitar longitud
    
    return `ticket_${ticketId}_${tipoArchivoCodigo}_${sanitizedName}_${timestamp}${extension}`;
  }

  /**
   * Obtener IDs de tipos de archivo de imagen
   */
  private async getImageTypeIds(): Promise<number[]> {
    const tiposImagen = await this.prisma.tipoArchivoTicket.findMany({
      where: { categoria: 'IMAGEN' },
      select: { id: true }
    });
    
    return tiposImagen.map(tipo => tipo.id);
  }

  /**
   * Formatear bytes a formato legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Transformar a DTO de respuesta
   */
  private transformToResponseDto(archivo: any): ArchivoTicketResponseDto {
    return plainToInstance(ArchivoTicketResponseDto, {
      id: archivo.id,
      ticketId: archivo.ticketId,
      nombreArchivo: archivo.nombreArchivo,
      nombreOriginal: archivo.nombreOriginal,
      url: archivo.url,
      urlThumbnail: archivo.urlThumbnail,
      rutaAlmacenamiento: archivo.rutaAlmacenamiento,
      tipoMime: archivo.tipoMime,
      tamanoBytes: Number(archivo.tamanoBytes),
      extension: archivo.extension,
      metadatos: archivo.metadatos,
      descripcion: archivo.descripcion,
      orden: archivo.orden,
      esPrincipal: archivo.esPrincipal,
      tipoArchivo: archivo.tipoArchivo,
      subidoPor: archivo.subidoPor,
      fechaSubida: archivo.fechaSubida,
      activo: archivo.activo,
      createdAt: archivo.createdAt
    }, { excludeExtraneousValues: true });
  }
}