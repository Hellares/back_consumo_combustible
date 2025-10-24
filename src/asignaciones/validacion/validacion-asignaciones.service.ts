import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

/**
 * Parámetros para validar disponibilidad de unidad
 */
export interface ValidacionAsignacionParams {
  unidadId: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  excluirAsignacionId?: number; // Para updates
  tipoAsignacion: 'ITINERARIO' | 'RUTA_EXCEPCIONAL';
}

/**
 * Resultado de validación
 */
export interface ResultadoValidacion {
  permitido: boolean;
  advertencias?: string[];
  conflictos?: string[];
}

/**
 * Información de asignación del día
 */
export interface AsignacionDelDia {
  tipoAsignacion: 'LIBRE' | 'ITINERARIO' | 'RUTA_EXCEPCIONAL';
  asignacion?: any;
  detalles: string;
}

@Injectable()
export class ValidacionAsignacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que una unidad NO tenga conflictos de asignación
   * 
   * REGLAS DE NEGOCIO:
   * 1. ITINERARIO PERMANENTE: Solo puede tener 1 activo, pero permite rutas excepcionales
   * 2. RUTA EXCEPCIONAL: Puede coexistir con itinerario, pero no con otra ruta en la misma fecha
   * 3. PRIORIDAD: Ruta Excepcional > Itinerario Permanente > Libre
   */
  // async validarDisponibilidadUnidad(
  //   params: ValidacionAsignacionParams,
  // ): Promise<ResultadoValidacion> {
  //   const { 
  //     unidadId, 
  //     fechaInicio, 
  //     fechaFin, 
  //     excluirAsignacionId, 
  //     tipoAsignacion 
  //   } = params;

  //   const advertencias: string[] = [];
  //   const conflictos: string[] = [];

  //   // Validar que la unidad existe
  //   const unidad = await this.prisma.unidad.findUnique({
  //     where: { id: unidadId },
  //     select: { id: true, placa: true, operacion: true, activo: true},
  //   });

  //   if (!unidad) {
  //     conflictos.push(`La unidad con ID ${unidadId} no existe`);
  //     return { permitido: false, conflictos };
  //   }

  //   if (!unidad.activo) {
  //   conflictos.push('La unidad está inactiva');
  //   return { permitido: false, conflictos };
  // }
  

  //   // 1. Verificar itinerario permanente activo
  //   const itinerarioPermanente = await this.prisma.unidadItinerario.findFirst({
  //     where: {
  //       unidadId,
  //       estado: 'ACTIVA',
  //       fechaDesasignacion: null,
  //       ...(excluirAsignacionId && tipoAsignacion === 'ITINERARIO'
  //         ? { NOT: { id: excluirAsignacionId } }
  //         : {}),
  //     },
  //     include: {
  //       itinerario: { 
  //         select: { 
  //           nombre: true, 
  //           codigo: true,
  //           diasOperacion: true,
  //         } 
  //       },
  //     },
  //   });

  //   // 2. Verificar rutas excepcionales en el rango de fechas
  //   const whereRutasExcepcionales: any = {
  //     unidadId,
  //     activo: true,
  //     ...(excluirAsignacionId && tipoAsignacion === 'RUTA_EXCEPCIONAL'
  //       ? { NOT: { id: excluirAsignacionId } }
  //       : {}),
  //   };

  //   // Aplicar filtro de fechas si se proporciona
  //   if (fechaInicio && fechaFin) {
  //     whereRutasExcepcionales.fechaViajeEspecifico = {
  //       gte: fechaInicio,
  //       lte: fechaFin,
  //     };
  //   } else if (fechaInicio) {
  //     whereRutasExcepcionales.fechaViajeEspecifico = fechaInicio;
  //   }

  //   const rutasExcepcionales = await this.prisma.unidadRuta.findMany({
  //     where: whereRutasExcepcionales,
  //     include: {
  //       ruta: { select: { nombre: true, codigo: true } },
  //     },
  //   });

  //   // ============================================
  //   // LÓGICA DE VALIDACIÓN POR TIPO DE ASIGNACIÓN
  //   // ============================================

  //   if (tipoAsignacion === 'ITINERARIO') {
  //     return this.validarAsignacionItinerario(
  //       itinerarioPermanente,
  //       rutasExcepcionales,
  //       conflictos,
  //       advertencias,
  //     );
  //   } else {
  //     return this.validarAsignacionRutaExcepcional(
  //       itinerarioPermanente,
  //       rutasExcepcionales,
  //       fechaInicio!,
  //       conflictos,
  //       advertencias,
  //     );
  //   }
  // }

  async validarDisponibilidadUnidad(
  params: ValidacionAsignacionParams,
): Promise<ResultadoValidacion> {
  const { 
    unidadId, 
    fechaInicio, 
    fechaFin, 
    excluirAsignacionId, 
    tipoAsignacion 
  } = params;

  const advertencias: string[] = [];
  const conflictos: string[] = [];

  // 1. 🆕 CONSULTAR LA UNIDAD Y SU TIPO DE OPERACIÓN
  const unidad = await this.prisma.unidad.findUnique({
    where: { id: unidadId },
    select: { 
      id: true, 
      placa: true, 
      operacion: true, // 👈 Campo existente
      activo: true 
    },
  });

  if (!unidad) {
    conflictos.push('La unidad no existe');
    return { permitido: false, conflictos };
  }

  if (!unidad.activo) {
    conflictos.push('La unidad está inactiva');
    return { permitido: false, conflictos };
  }

  // 🆕 DETERMINAR SI LA UNIDAD PERMITE MÚLTIPLES RUTAS POR DÍA
  const permiteMultiplesRutas = this.esUnidadDeSupervision(unidad.operacion);

  // 2. Verificar itinerario permanente (sin cambios)
  const whereItinerario: any = {
    unidadId,
    estado: 'ACTIVA',
    fechaDesasignacion: null,
    ...(excluirAsignacionId && tipoAsignacion === 'ITINERARIO'
      ? { NOT: { id: excluirAsignacionId } }
      : {}),
  };

  const itinerarioPermanente = await this.prisma.unidadItinerario.findFirst({
    where: whereItinerario,
    include: {
      itinerario: {
        select: { id: true, nombre: true, codigo: true, diasOperacion: true },
      },
    },
  });

  // 3. Verificar rutas excepcionales en el rango de fechas
  const whereRutasExcepcionales: any = {
    unidadId,
    activo: true,
    esUnaVez: true, // Solo rutas excepcionales
    ...(excluirAsignacionId && tipoAsignacion === 'RUTA_EXCEPCIONAL'
      ? { NOT: { id: excluirAsignacionId } }
      : {}),
  };

  if (fechaInicio && fechaFin) {
    whereRutasExcepcionales.fechaViajeEspecifico = {
      gte: fechaInicio,
      lte: fechaFin,
    };
  } else if (fechaInicio) {
    whereRutasExcepcionales.fechaViajeEspecifico = fechaInicio;
  }

  const rutasExcepcionales = await this.prisma.unidadRuta.findMany({
    where: whereRutasExcepcionales,
    include: {
      ruta: { select: { nombre: true, codigo: true } },
    },
  });

  // ============================================
  //  LÓGICA DE VALIDACIÓN SEGÚN TIPO DE UNIDAD
  // ============================================

  if (tipoAsignacion === 'RUTA_EXCEPCIONAL') {
    // CASO 1: UNIDAD DE SUPERVISIÓN → Permitir múltiples rutas
    if (permiteMultiplesRutas) {
      if (rutasExcepcionales.length > 0) {
        advertencias.push(
          `La unidad de supervisión ya tiene ${rutasExcepcionales.length} ruta(s) programadas para esta fecha. Se agregará una adicional.`
        );
      }

      // Validar con itinerario permanente (solo advertir)
      if (itinerarioPermanente) {
        const diaSemana = this.obtenerDiaSemana(fechaInicio!);
        const operaEseDia = itinerarioPermanente.diasEspecificos.includes(diaSemana);

        if (operaEseDia) {
          advertencias.push(
            `La unidad tiene itinerario permanente "${itinerarioPermanente.itinerario.nombre}" para este día. La ruta de supervisión se ejecutará adicionalmente.`
          );
        }
      }

      return { permitido: true, advertencias };
    }

    // CASO 2: UNIDAD OPERATIVA → Solo 1 ruta excepcional por día
    if (!permiteMultiplesRutas) {
      // Validar que no haya otra ruta excepcional en la misma fecha
      if (rutasExcepcionales.length > 0) {
        const ruta = rutasExcepcionales[0];
        const fecha = ruta.fechaViajeEspecifico?.toLocaleDateString('es-PE') || 'fecha no especificada';
        
        conflictos.push(
          `Ya existe una ruta excepcional "${ruta.ruta.nombre}" (${ruta.ruta.codigo}) programada para el ${fecha}.`
        );
        return { permitido: false, conflictos };
      }

      // Validar con itinerario permanente
      if (itinerarioPermanente) {
        const diaSemana = this.obtenerDiaSemana(fechaInicio!);
        const operaEseDia = itinerarioPermanente.diasEspecificos.includes(diaSemana);

        if (operaEseDia) {
          advertencias.push(
            `La ruta excepcional ANULARÁ el itinerario permanente "${itinerarioPermanente.itinerario.nombre}" para el ${fechaInicio!.toLocaleDateString('es-PE')} (${diaSemana}). Al día siguiente, la unidad volverá a su itinerario habitual.`
          );
        } else {
          advertencias.push(
            `La unidad tiene un itinerario permanente, pero no opera los ${diaSemana}. La ruta excepcional no genera conflicto.`
          );
        }
      }

      return { permitido: true, advertencias };
    }
  }

  // CASO 3: ASIGNACIÓN DE ITINERARIO (sin cambios)
  if (tipoAsignacion === 'ITINERARIO') {
    return this.validarAsignacionItinerario(
      itinerarioPermanente,
      rutasExcepcionales,
      conflictos,
      advertencias,
    );
  }

  return { permitido: true };
}

/**
 * 🆕 MÉTODO AUXILIAR: Determinar si una unidad permite múltiples rutas por día
 * Basado en el campo "operacion" de la unidad
 */
private esUnidadDeSupervision(operacion: string | null): boolean {
  if (!operacion) return false;

  const operacionNormalizada = operacion.toLowerCase().trim();

  // Lista de palabras clave que indican supervisión o múltiples rutas
  const palabrasClavesSupervision = [
    'supervision',
    'supervisión',
    'administrativa',
    'administrativo',
    'inspeccion',
    'inspección',
    'control',
    'auditoria',
    'auditoría',
    'camioneta',
    'pickup',
    'pick-up',
  ];

  return palabrasClavesSupervision.some(keyword => 
    operacionNormalizada.includes(keyword)
  );
}




  /**
   * Validar asignación de ITINERARIO PERMANENTE
   */
  private validarAsignacionItinerario(
    itinerarioPermanente: any,
    rutasExcepcionales: any[],
    conflictos: string[],
    advertencias: string[],
  ): ResultadoValidacion {
    // Regla 1: No puede haber otro itinerario permanente activo
    if (itinerarioPermanente) {
      conflictos.push(
        `La unidad ya tiene el itinerario permanente "${itinerarioPermanente.itinerario.nombre}" (${itinerarioPermanente.itinerario.codigo}) activo. Debe desasignarlo primero.`,
      );
      return { permitido: false, conflictos };
    }

    // Regla 2: Advertir sobre rutas excepcionales programadas
    if (rutasExcepcionales.length > 0) {
      const fechas = rutasExcepcionales
        .map((r) => r.fechaViajeEspecifico?.toLocaleDateString('es-PE'))
        .filter(Boolean)
        .slice(0, 3) // Mostrar máximo 3 fechas
        .join(', ');

      advertencias.push(
        `La unidad tiene ${rutasExcepcionales.length} ruta(s) excepcional(es) programadas (${fechas}${rutasExcepcionales.length > 3 ? '...' : ''}) que tendrán PRIORIDAD sobre el itinerario en esas fechas específicas.`,
      );
    }

    return { permitido: true, advertencias };
  }

  /**
   * Validar asignación de RUTA EXCEPCIONAL
   */
  private validarAsignacionRutaExcepcional(
    itinerarioPermanente: any,
    rutasExcepcionales: any[],
    fechaInicio: Date,
    conflictos: string[],
    advertencias: string[],
  ): ResultadoValidacion {
    // Regla 1: No puede haber otra ruta excepcional en la misma fecha
    if (rutasExcepcionales.length > 0) {
      const ruta = rutasExcepcionales[0];
      const fecha = ruta.fechaViajeEspecifico?.toLocaleDateString('es-PE') || 'fecha no especificada';
      
      conflictos.push(
        `Ya existe una ruta excepcional "${ruta.ruta.nombre}" (${ruta.ruta.codigo}) programada para el ${fecha}.`,
      );
      return { permitido: false, conflictos };
    }

    // Regla 2: Puede coexistir con itinerario permanente (advertir si anula)
    if (itinerarioPermanente) {
      const diaSemana = this.obtenerDiaSemana(fechaInicio);
      const operaEseDia = itinerarioPermanente.diasEspecificos.includes(diaSemana);

      if (operaEseDia) {
        advertencias.push(
          `La ruta excepcional ANULARÁ el itinerario permanente "${itinerarioPermanente.itinerario.nombre}" para el ${fechaInicio.toLocaleDateString('es-PE')} (${diaSemana}). Al día siguiente, la unidad volverá a su itinerario habitual.`,
        );
      } else {
        advertencias.push(
          `La unidad tiene un itinerario permanente, pero no opera los ${diaSemana}. La ruta excepcional no genera conflicto.`,
        );
      }
    }

    return { permitido: true, advertencias };
  }

  /**
   * Obtener qué debe ejecutar una unidad en una fecha específica
   * Respeta la PRIORIDAD: Ruta Excepcional > Itinerario Permanente > Libre
   */
  async obtenerAsignacionDelDia(
    unidadId: number,
    fecha: Date,
  ): Promise<AsignacionDelDia> {
    // Validar que la unidad existe
    const unidad = await this.prisma.unidad.findUnique({
      where: { id: unidadId },
      select: { id: true, placa: true },
    });

    if (!unidad) {
      return {
        tipoAsignacion: 'LIBRE',
        detalles: `La unidad con ID ${unidadId} no existe`,
      };
    }

    // 🔴 PRIORIDAD 1: Rutas excepcionales
    const rutaExcepcional = await this.prisma.unidadRuta.findFirst({
      where: {
        unidadId,
        activo: true,
        fechaViajeEspecifico: fecha,
      },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            origen: true,
            destino: true,
          },
        },
        asignadoPor: { 
          select: { 
            nombres: true, 
            apellidos: true 
          } 
        },
      },
    });

    if (rutaExcepcional) {
      return {
        tipoAsignacion: 'RUTA_EXCEPCIONAL',
        asignacion: rutaExcepcional,
        detalles: `Ruta excepcional: ${rutaExcepcional.ruta.nombre} (${rutaExcepcional.motivoAsignacion}) - Prioridad: ${rutaExcepcional.prioridad}`,
      };
    }

    // 🟡 PRIORIDAD 2: Itinerarios permanentes
    const itinerarioPermanente = await this.prisma.unidadItinerario.findFirst({
      where: {
        unidadId,
        estado: 'ACTIVA',
        fechaDesasignacion: null,
      },
      include: {
        itinerario: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoItinerario: true,
            diasOperacion: true,
          },
        },
      },
    });

    if (itinerarioPermanente) {
      const diaSemana = this.obtenerDiaSemana(fecha);
      const operaEseDia = itinerarioPermanente.diasEspecificos.includes(diaSemana);

      if (operaEseDia) {
        return {
          tipoAsignacion: 'ITINERARIO',
          asignacion: itinerarioPermanente,
          detalles: `Itinerario permanente: ${itinerarioPermanente.itinerario.nombre} (${diaSemana})`,
        };
      } else {
        return {
          tipoAsignacion: 'LIBRE',
          detalles: `La unidad tiene itinerario permanente "${itinerarioPermanente.itinerario.nombre}", pero no opera los ${diaSemana}`,
        };
      }
    }

    // 🟢 PRIORIDAD 3: Libre
    return {
      tipoAsignacion: 'LIBRE',
      detalles: `La unidad ${unidad.placa} está disponible el ${fecha.toLocaleDateString('es-PE')}`,
    };
  }

  /**
   * Verificar disponibilidad en un rango de fechas
   */
  async verificarDisponibilidadEnRango(
    unidadId: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<{
    diasLibres: Date[];
    diasOcupados: { fecha: Date; tipo: string; detalles: string }[];
    resumen: string;
  }> {
    const diasLibres: Date[] = [];
    const diasOcupados: { fecha: Date; tipo: string; detalles: string }[] = [];

    let fechaActual = new Date(fechaInicio);
    const fechaLimite = new Date(fechaFin);

    while (fechaActual <= fechaLimite) {
      const asignacion = await this.obtenerAsignacionDelDia(unidadId, fechaActual);

      if (asignacion.tipoAsignacion === 'LIBRE') {
        diasLibres.push(new Date(fechaActual));
      } else {
        diasOcupados.push({
          fecha: new Date(fechaActual),
          tipo: asignacion.tipoAsignacion,
          detalles: asignacion.detalles,
        });
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const totalDias = Math.ceil((fechaLimite.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const resumen = `${diasLibres.length}/${totalDias} días disponibles`;

    return { diasLibres, diasOcupados, resumen };
  }

  /**
   * Obtener día de la semana en español mayúsculas
   */
  private obtenerDiaSemana(fecha: Date): string {
    const dias = [
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
    ];
    return dias[fecha.getDay()];
  }
}
