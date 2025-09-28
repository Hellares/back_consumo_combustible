// =============================================
// src/turnos/turnos.service.ts
// =============================================

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { QueryTurnoDto } from './dto/query-turno.dto';
import { TurnoResponseDto } from './dto/turno-response.dto';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TurnosService {
  constructor(private prisma: PrismaService) {}

  async create(createTurnoDto: CreateTurnoDto): Promise<TurnoResponseDto> {
    try {
      // Verificar si ya existe un turno con el mismo nombre
      const existingTurno = await this.prisma.turno.findUnique({
        where: { nombre: createTurnoDto.nombre.trim().toUpperCase() }
      });

      if (existingTurno) {
        throw new ConflictException(`Ya existe un turno con el nombre: ${createTurnoDto.nombre}`);
      }

      // Validar que la hora de inicio sea diferente a la hora de fin
      if (createTurnoDto.horaInicio === createTurnoDto.horaFin) {
        throw new BadRequestException('La hora de inicio no puede ser igual a la hora de fin');
      }

      // Convertir las horas string a objetos Date para Prisma
      const horaInicio = new Date(`1970-01-01T${createTurnoDto.horaInicio}Z`);
      const horaFin = new Date(`1970-01-01T${createTurnoDto.horaFin}Z`);

      const turno = await this.prisma.turno.create({
        data: {
          nombre: createTurnoDto.nombre.trim().toUpperCase(),
          horaInicio,
          horaFin,
        },
        include: {
          _count: {
            select: {
              abastecimientos: true
            }
          }
        }
      });

      return this.transformToResponseDto(turno);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el turno');
    }
  }

  async findAll(queryDto: QueryTurnoDto) {
    const { page, limit, search, activo, orderBy, orderDirection } = queryDto;
    const offset = (page - 1) * limit;

    // Construir filtros dinámicamente
    const where: any = {};

    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Contar total de registros
    const total = await this.prisma.turno.count({ where });

    // Obtener turnos con paginación
    const turnos = await this.prisma.turno.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDirection
      },
      include: {
        _count: {
          select: {
            abastecimientos: true
          }
        }
      }
    });

    const turnosTransformados = turnos.map(turno => this.transformToResponseDto(turno));

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: turnosTransformados,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrevious ? page - 1 : null
      }
    };
  }

  async findAllActive(): Promise<TurnoResponseDto[]> {
    const turnos = await this.prisma.turno.findMany({
      where: { activo: true },
      orderBy: { horaInicio: 'asc' },
      include: {
        _count: {
          select: {
            abastecimientos: true
          }
        }
      }
    });

    return turnos.map(turno => this.transformToResponseDto(turno));
  }

  async findOne(id: number): Promise<TurnoResponseDto> {
    const turno = await this.prisma.turno.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            abastecimientos: true
          }
        }
      }
    });

    if (!turno) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }

    return this.transformToResponseDto(turno);
  }

  async findByNombre(nombre: string): Promise<TurnoResponseDto> {
    const turno = await this.prisma.turno.findUnique({
      where: { nombre: nombre.trim().toUpperCase() },
      include: {
        _count: {
          select: {
            abastecimientos: true
          }
        }
      }
    });

    if (!turno) {
      throw new NotFoundException(`Turno con nombre ${nombre} no encontrado`);
    }

    return this.transformToResponseDto(turno);
  }

  async update(id: number, updateTurnoDto: UpdateTurnoDto): Promise<TurnoResponseDto> {
    try {
      // Verificar que el turno existe
      const existingTurno = await this.prisma.turno.findUnique({
        where: { id }
      });

      if (!existingTurno) {
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }

      // Verificar nombre duplicado si se está actualizando el nombre
      if (updateTurnoDto.nombre) {
        const nombreNormalizado = updateTurnoDto.nombre.trim().toUpperCase();
        
        if (nombreNormalizado !== existingTurno.nombre) {
          const duplicateTurno = await this.prisma.turno.findUnique({
            where: { nombre: nombreNormalizado }
          });

          if (duplicateTurno) {
            throw new ConflictException(`Ya existe un turno con el nombre: ${updateTurnoDto.nombre}`);
          }
        }
      }

      // Validar horas si se están actualizando
      const horaInicioToValidate = updateTurnoDto.horaInicio || this.extractTimeFromDate(existingTurno.horaInicio);
      const horaFinToValidate = updateTurnoDto.horaFin || this.extractTimeFromDate(existingTurno.horaFin);

      if (horaInicioToValidate === horaFinToValidate) {
        throw new BadRequestException('La hora de inicio no puede ser igual a la hora de fin');
      }

      // Preparar datos para actualización
      const updateData: any = {};

      if (updateTurnoDto.nombre) {
        updateData.nombre = updateTurnoDto.nombre.trim().toUpperCase();
      }

      if (updateTurnoDto.horaInicio) {
        updateData.horaInicio = new Date(`1970-01-01T${updateTurnoDto.horaInicio}Z`);
      }

      if (updateTurnoDto.horaFin) {
        updateData.horaFin = new Date(`1970-01-01T${updateTurnoDto.horaFin}Z`);
      }

      const turno = await this.prisma.turno.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              abastecimientos: true
            }
          }
        }
      });

      return this.transformToResponseDto(turno);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el turno');
    }
  }

  async toggleStatus(id: number): Promise<TurnoResponseDto> {
    try {
      const turno = await this.prisma.turno.findUnique({
        where: { id }
      });

      if (!turno) {
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }

      const updatedTurno = await this.prisma.turno.update({
        where: { id },
        data: { activo: !turno.activo },
        include: {
          _count: {
            select: {
              abastecimientos: true
            }
          }
        }
      });

      return this.transformToResponseDto(updatedTurno);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al cambiar el estado del turno');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar que el turno existe
      const turno = await this.prisma.turno.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              abastecimientos: true
            }
          }
        }
      });

      if (!turno) {
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }

      // Verificar que no tenga abastecimientos asociados
      if (turno._count.abastecimientos > 0) {
        throw new ConflictException(
          `No se puede eliminar el turno porque tiene ${turno._count.abastecimientos} abastecimiento(s) asociado(s)`
        );
      }

      await this.prisma.turno.delete({
        where: { id }
      });

      return { message: `Turno ${turno.nombre} eliminado exitosamente` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el turno');
    }
  }

  /**
   * Obtiene estadísticas básicas de turnos
   */
  async getStats() {
    const [total, activos, inactivos, conAbastecimientos] = await Promise.all([
      this.prisma.turno.count(),
      this.prisma.turno.count({ where: { activo: true } }),
      this.prisma.turno.count({ where: { activo: false } }),
      this.prisma.turno.count({
        where: {
          abastecimientos: {
            some: {}
          }
        }
      })
    ]);

    return {
      total,
      activos,
      inactivos,
      conAbastecimientos,
      sinAbastecimientos: total - conAbastecimientos
    };
  }

  /**
   * Extrae la hora de un objeto Date en formato HH:mm:ss
   */
  private extractTimeFromDate(date: Date): string {
    if (!date) return '';
    return date.toTimeString().split(' ')[0];
  }

  /**
   * Calcula la duración del turno en horas
   */
  private calculateDuration(horaInicio: Date, horaFin: Date): number {
    if (!horaInicio || !horaFin) return 0;

    const inicio = new Date(`1970-01-01T${this.extractTimeFromDate(horaInicio)}`);
    const fin = new Date(`1970-01-01T${this.extractTimeFromDate(horaFin)}`);
    
    let diffMs = fin.getTime() - inicio.getTime();
    
    // Si la hora de fin es menor que la de inicio, es un turno nocturno
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Agregar 24 horas
    }
    
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Transforma el objeto de base de datos a DTO de respuesta
   */
  private transformToResponseDto(turno: any): TurnoResponseDto {
    return plainToInstance(TurnoResponseDto, {
      ...turno,
      horaInicio: this.extractTimeFromDate(turno.horaInicio),
      horaFin: this.extractTimeFromDate(turno.horaFin),
      totalAbastecimientos: turno._count?.abastecimientos || 0,
      duracionHoras: this.calculateDuration(turno.horaInicio, turno.horaFin)
    }, {
      excludeExtraneousValues: true,
    });
  }
}