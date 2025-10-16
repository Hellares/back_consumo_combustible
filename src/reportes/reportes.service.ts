import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FiltrosReporteDto, TipoReporte } from './dto/filtros-reporte.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerDatosReporte(filtros: FiltrosReporteDto) {
    switch (filtros.tipoReporte) {
      case TipoReporte.ABASTECIMIENTOS:
        return this.obtenerReporteAbastecimientos(filtros);
      case TipoReporte.CONSUMO_POR_UNIDAD:
        return this.obtenerReporteConsumoPorUnidad(filtros);
      case TipoReporte.ESTADISTICAS_GRIFO:
        return this.obtenerReporteEstadisticasGrifo(filtros);
      case TipoReporte.RENDIMIENTO:
        return this.obtenerReporteRendimiento(filtros);
      default:
        throw new BadRequestException('Tipo de reporte no válido');
    }
  }

  private async obtenerReporteAbastecimientos(filtros: FiltrosReporteDto) {
    const whereConditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.fechaInicio) {
      whereConditions.push(`fecha_abastecimiento >= $${paramIndex}`);
      params.push(new Date(filtros.fechaInicio));
      paramIndex++;
    }

    if (filtros.fechaFin) {
      whereConditions.push(`fecha_abastecimiento <= $${paramIndex}`);
      params.push(new Date(filtros.fechaFin));
      paramIndex++;
    }

    if (filtros.zonaId) {
      whereConditions.push(`zona_id = $${paramIndex}`);
      params.push(filtros.zonaId);
      paramIndex++;
    }

    if (filtros.sedeId) {
      whereConditions.push(`sede_id = $${paramIndex}`);
      params.push(filtros.sedeId);
      paramIndex++;
    }

    if (filtros.grifoId) {
      whereConditions.push(`grifo_id = $${paramIndex}`);
      params.push(filtros.grifoId);
      paramIndex++;
    }

    if (filtros.unidadId) {
      whereConditions.push(`unidad_id = $${paramIndex}`);
      params.push(filtros.unidadId);
      paramIndex++;
    }

    if (filtros.placa) {
      whereConditions.push(`placa ILIKE $${paramIndex}`);
      params.push(`%${filtros.placa}%`);
      paramIndex++;
    }

    if (filtros.conductorId) {
      whereConditions.push(`conductor_id = $${paramIndex}`);
      params.push(filtros.conductorId);
      paramIndex++;
    }

    if (filtros.rutaId) {
      whereConditions.push(`ruta_id = $${paramIndex}`);
      params.push(filtros.rutaId);
      paramIndex++;
    }

    if (filtros.estadoTicket) {
      whereConditions.push(`estado_ticket = $${paramIndex}`);
      params.push(filtros.estadoTicket);
      paramIndex++;
    }

    if (filtros.tipoCombustible) {
      whereConditions.push(`tipo_combustible = $${paramIndex}`);
      params.push(filtros.tipoCombustible);
      paramIndex++;
    }

    if (filtros.soloCompletados) {
      whereConditions.push(`estado_detalle = 'CONCLUIDO'`);
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT
        ticket_id, numero_ticket, fecha_abastecimiento, hora_abastecimiento,
        unidad_id, placa, marca, modelo, tipo_combustible_unidad, capacidad_tanque, operacion,
        zona_id, zona, zona_codigo,
        conductor_id, conductor_nombre_completo, conductor_dni, conductor_codigo,
        grifo_id, grifo_nombre, grifo_codigo, grifo_direccion,
        sede_id, sede_nombre, sede_codigo,
        ruta_id, ruta_nombre, ruta_codigo, ruta_origen, ruta_destino, ruta_distancia,
        turno_id, turno, turno_hora_inicio, turno_hora_fin,
        kilometraje_actual, kilometraje_anterior, diferencia_kilometraje,
        precinto_nuevo, precinto_anterior, precinto_2,
        cantidad_solicitada, tipo_combustible, cantidad_abastecida, motivo_diferencia, diferencia_cantidad,
        horometro_actual, horometro_anterior, diferencia_horometro,
        costo_por_unidad, costo_total, unidad_medida, rendimiento_km_por_galon,
        numero_ticket_grifo, vale_diesel, numero_factura, importe_factura, requerimiento, numero_salida_almacen,
        estado_id, estado_ticket, estado_descripcion, estado_color, estado_detalle,
        solicitado_por_id, solicitado_por, solicitado_por_codigo, fecha_solicitud,
        aprobado_por_id, aprobado_por, fecha_aprobacion,
        controlador_id, controlador, observaciones_controlador,
        concluido_por_id, concluido_por, fecha_concluido,
        motivo_rechazo, rechazado_por_id, rechazado_por, fecha_rechazo,
        observaciones_solicitud,
        ticket_creado_en, ticket_actualizado_en, detalle_creado_en, detalle_actualizado_en
      FROM vista_reporte_abastecimientos
      WHERE ${whereClause}
      ORDER BY fecha_abastecimiento DESC, hora_abastecimiento DESC
    `;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  private async obtenerReporteConsumoPorUnidad(filtros: FiltrosReporteDto) {
    const whereConditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.zonaId) {
      whereConditions.push(`zona = (SELECT nombre FROM zonas WHERE id = $${paramIndex})`);
      params.push(filtros.zonaId);
      paramIndex++;
    }

    if (filtros.placa) {
      whereConditions.push(`placa ILIKE $${paramIndex}`);
      params.push(`%${filtros.placa}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        unidad_id, placa, marca, modelo, tipo_combustible, zona,
        total_abastecimientos, abastecimientos_aprobados,
        total_galones_consumidos, promedio_galones_por_abastecimiento,
        costo_total_acumulado, precio_promedio_galon,
        ultimo_kilometraje, total_km_recorridos,
        rendimiento_promedio_km_por_galon,
        ultimo_abastecimiento, primer_abastecimiento
      FROM vista_consumo_por_unidad
      WHERE ${whereClause}
      ORDER BY total_galones_consumidos DESC
    `;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  private async obtenerReporteEstadisticasGrifo(filtros: FiltrosReporteDto) {
    const whereConditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.zonaId) {
      whereConditions.push(`zona_nombre = (SELECT nombre FROM zonas WHERE id = $${paramIndex})`);
      params.push(filtros.zonaId);
      paramIndex++;
    }

    if (filtros.sedeId) {
      whereConditions.push(`sede_nombre = (SELECT nombre FROM sedes WHERE id = $${paramIndex})`);
      params.push(filtros.sedeId);
      paramIndex++;
    }

    if (filtros.grifoId) {
      whereConditions.push(`grifo_id = $${paramIndex}`);
      params.push(filtros.grifoId);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        grifo_id, grifo_nombre, grifo_codigo, sede_nombre, zona_nombre,
        total_abastecimientos, total_unidades_atendidas, total_conductores_atendidos,
        total_galones_despachados, promedio_galones_por_ticket,
        total_ingresos, promedio_ingreso_por_ticket, precio_promedio_galon,
        ultimo_abastecimiento, primer_abastecimiento
      FROM vista_estadisticas_por_grifo
      WHERE ${whereClause}
      ORDER BY total_ingresos DESC
    `;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  private async obtenerReporteRendimiento(filtros: FiltrosReporteDto) {
    const whereConditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filtros.fechaInicio) {
      whereConditions.push(`fecha >= $${paramIndex}`);
      params.push(new Date(filtros.fechaInicio));
      paramIndex++;
    }

    if (filtros.fechaFin) {
      whereConditions.push(`fecha <= $${paramIndex}`);
      params.push(new Date(filtros.fechaFin));
      paramIndex++;
    }

    if (filtros.unidadId) {
      whereConditions.push(`placa = (SELECT placa FROM unidades WHERE id = $${paramIndex})`);
      params.push(filtros.unidadId);
      paramIndex++;
    }

    if (filtros.placa) {
      whereConditions.push(`placa ILIKE $${paramIndex}`);
      params.push(`%${filtros.placa}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        ticket_id, numero_ticket, fecha, placa, marca, modelo, conductor,
        km_recorridos, galones_consumidos, rendimiento_km_por_galon,
        costo_por_km, costo_por_unidad, costo_total, grifo, ruta
      FROM vista_rendimiento_detallado
      WHERE ${whereClause}
      ORDER BY fecha DESC
    `;

    return this.prisma.$queryRawUnsafe(query, ...params);
  }

  /**
   * Sanitizar valor para evitar problemas de encoding
   */
  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      return value.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
    }
    
    return value;
  }

  /**
   * Convertir fecha de forma segura
   */
  private safeDate(value: any): Date | null {
    if (!value) return null;
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  }

  /**
   * Convertir número de forma segura
   */
  private safeNumber(value: any, decimals: number = 2): number {
    if (value === null || value === undefined) return 0;
    
    const num = Number(value);
    if (isNaN(num)) return 0;
    
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * ✅ SOLUCIÓN DEFINITIVA: Generar Excel sin estilos ni configuraciones problemáticas
   */
  async generarExcel(datos: any[], tipoReporte: TipoReporte, filtros: FiltrosReporteDto): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // NO establecer propiedades del workbook que puedan causar problemas
    // workbook.creator = 'Sistema de Gestion de Combustible';
    // workbook.created = new Date();
    // workbook.modified = new Date();

    switch (tipoReporte) {
      case TipoReporte.ABASTECIMIENTOS:
        this.crearHojaAbastecimientos(workbook, datos);
        break;
      case TipoReporte.CONSUMO_POR_UNIDAD:
        this.crearHojaConsumoPorUnidad(workbook, datos);
        break;
      case TipoReporte.ESTADISTICAS_GRIFO:
        this.crearHojaEstadisticasGrifo(workbook, datos);
        break;
      case TipoReporte.RENDIMIENTO:
        this.crearHojaRendimiento(workbook, datos);
        break;
    }

    this.agregarHojaInformacion(workbook, filtros, datos.length);

    // Generar buffer con opciones mínimas
    const buffer = await workbook.xlsx.writeBuffer({});
    return Buffer.from(buffer);
  }

  private crearHojaAbastecimientos(workbook: ExcelJS.Workbook, datos: any[]) {
    const worksheet = workbook.addWorksheet('Abastecimientos');

    // Definir columnas SIN formato en la definición
    worksheet.columns = [
      { header: 'ID Ticket', key: 'ticket_id', width: 10 },
      { header: 'N° Ticket', key: 'numero_ticket', width: 20 },
      { header: 'Fecha', key: 'fecha_abastecimiento', width: 12 },
      { header: 'Hora', key: 'hora_abastecimiento', width: 10 },
      { header: 'ID Unidad', key: 'unidad_id', width: 10 },
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Tipo Combustible Unidad', key: 'tipo_combustible_unidad', width: 20 },
      { header: 'Capacidad Tanque', key: 'capacidad_tanque', width: 15 },
      { header: 'Operacion', key: 'operacion', width: 20 },
      { header: 'ID Zona', key: 'zona_id', width: 10 },
      { header: 'Zona', key: 'zona', width: 15 },
      { header: 'Codigo Zona', key: 'zona_codigo', width: 12 },
      { header: 'ID Conductor', key: 'conductor_id', width: 12 },
      { header: 'Conductor', key: 'conductor_nombre_completo', width: 30 },
      { header: 'DNI Conductor', key: 'conductor_dni', width: 12 },
      { header: 'Codigo Conductor', key: 'conductor_codigo', width: 15 },
      { header: 'ID Grifo', key: 'grifo_id', width: 10 },
      { header: 'Grifo', key: 'grifo_nombre', width: 25 },
      { header: 'Codigo Grifo', key: 'grifo_codigo', width: 12 },
      { header: 'Direccion Grifo', key: 'grifo_direccion', width: 30 },
      { header: 'ID Sede', key: 'sede_id', width: 10 },
      { header: 'Sede', key: 'sede_nombre', width: 20 },
      { header: 'Codigo Sede', key: 'sede_codigo', width: 12 },
      { header: 'ID Ruta', key: 'ruta_id', width: 10 },
      { header: 'Ruta', key: 'ruta_nombre', width: 25 },
      { header: 'Codigo Ruta', key: 'ruta_codigo', width: 12 },
      { header: 'Origen', key: 'ruta_origen', width: 20 },
      { header: 'Destino', key: 'ruta_destino', width: 20 },
      { header: 'Distancia Ruta (km)', key: 'ruta_distancia', width: 15 },
      { header: 'ID Turno', key: 'turno_id', width: 10 },
      { header: 'Turno', key: 'turno', width: 12 },
      { header: 'Hora Inicio Turno', key: 'turno_hora_inicio', width: 15 },
      { header: 'Hora Fin Turno', key: 'turno_hora_fin', width: 15 },
      { header: 'Km Actual', key: 'kilometraje_actual', width: 12 },
      { header: 'Km Anterior', key: 'kilometraje_anterior', width: 12 },
      { header: 'Diferencia Km', key: 'diferencia_kilometraje', width: 15 },
      { header: 'Precinto Nuevo', key: 'precinto_nuevo', width: 18 },
      { header: 'Precinto Anterior', key: 'precinto_anterior', width: 18 },
      { header: 'Precinto 2', key: 'precinto_2', width: 18 },
      { header: 'Cantidad Solicitada', key: 'cantidad_solicitada', width: 15 },
      { header: 'Tipo Combustible', key: 'tipo_combustible', width: 15 },
      { header: 'Cantidad Abastecida', key: 'cantidad_abastecida', width: 15 },
      { header: 'Motivo Diferencia', key: 'motivo_diferencia', width: 30 },
      { header: 'Diferencia Cantidad', key: 'diferencia_cantidad', width: 15 },
      { header: 'Horometro Actual', key: 'horometro_actual', width: 15 },
      { header: 'Horometro Anterior', key: 'horometro_anterior', width: 15 },
      { header: 'Diferencia Horometro', key: 'diferencia_horometro', width: 18 },
      { header: 'Costo por Unidad', key: 'costo_por_unidad', width: 15 },
      { header: 'Costo Total', key: 'costo_total', width: 12 },
      { header: 'Unidad Medida', key: 'unidad_medida', width: 12 },
      { header: 'Rendimiento Km/Gal', key: 'rendimiento_km_por_galon', width: 15 },
      { header: 'N° Ticket Grifo', key: 'numero_ticket_grifo', width: 18 },
      { header: 'Vale Diesel', key: 'vale_diesel', width: 15 },
      { header: 'N° Factura', key: 'numero_factura', width: 18 },
      { header: 'Importe Factura', key: 'importe_factura', width: 15 },
      { header: 'Requerimiento', key: 'requerimiento', width: 20 },
      { header: 'N° Salida Almacen', key: 'numero_salida_almacen', width: 18 },
      { header: 'ID Estado', key: 'estado_id', width: 10 },
      { header: 'Estado Ticket', key: 'estado_ticket', width: 15 },
      { header: 'Descripcion Estado', key: 'estado_descripcion', width: 25 },
      { header: 'Color Estado', key: 'estado_color', width: 12 },
      { header: 'Estado Detalle', key: 'estado_detalle', width: 15 },
      { header: 'ID Solicitado Por', key: 'solicitado_por_id', width: 15 },
      { header: 'Solicitado Por', key: 'solicitado_por', width: 25 },
      { header: 'Codigo Solicitante', key: 'solicitado_por_codigo', width: 18 },
      { header: 'Fecha Solicitud', key: 'fecha_solicitud', width: 18 },
      { header: 'ID Aprobado Por', key: 'aprobado_por_id', width: 15 },
      { header: 'Aprobado Por', key: 'aprobado_por', width: 25 },
      { header: 'Fecha Aprobacion', key: 'fecha_aprobacion', width: 18 },
      { header: 'ID Controlador', key: 'controlador_id', width: 12 },
      { header: 'Controlador', key: 'controlador', width: 25 },
      { header: 'Observaciones Controlador', key: 'observaciones_controlador', width: 35 },
      { header: 'ID Concluido Por', key: 'concluido_por_id', width: 15 },
      { header: 'Concluido Por', key: 'concluido_por', width: 25 },
      { header: 'Fecha Concluido', key: 'fecha_concluido', width: 18 },
      { header: 'Motivo Rechazo', key: 'motivo_rechazo', width: 30 },
      { header: 'ID Rechazado Por', key: 'rechazado_por_id', width: 15 },
      { header: 'Rechazado Por', key: 'rechazado_por', width: 25 },
      { header: 'Fecha Rechazo', key: 'fecha_rechazo', width: 18 },
      { header: 'Observaciones Solicitud', key: 'observaciones_solicitud', width: 35 },
      { header: 'Ticket Creado En', key: 'ticket_creado_en', width: 20 },
      { header: 'Ticket Actualizado En', key: 'ticket_actualizado_en', width: 20 },
      { header: 'Detalle Creado En', key: 'detalle_creado_en', width: 20 },
      { header: 'Detalle Actualizado En', key: 'detalle_actualizado_en', width: 20 },
    ];

    //FORMATO ESPECÍFICO PARA ABASTECIMIENTOS: Color azul de fondo, texto blanco, alto 50px
    const headerRow = worksheet.getRow(1);
    headerRow.height = 40;
    headerRow.font = { bold: true, size: 11 };

    // Aplicar color celeste solo a las celdas del encabezado que tienen datos (hasta CH)
    for (let colIndex = 1; colIndex <= worksheet.columns.length; colIndex++) {
      const cell = headerRow.getCell(colIndex);
      if (cell.value) { // Solo si la celda tiene valor (tiene datos)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF043261' } // Color AZUL de fondo
        };
        cell.font = { color: { argb: 'FFFFFFFF' } }; // Texto BLANCO
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }

    // Agregar datos
    datos.forEach((row) => {
      const newRow = worksheet.addRow({
        ticket_id: this.sanitizeValue(row.ticket_id),
        numero_ticket: this.sanitizeValue(row.numero_ticket),
        fecha_abastecimiento: this.safeDate(row.fecha_abastecimiento),
        hora_abastecimiento: this.sanitizeValue(row.hora_abastecimiento),
        unidad_id: this.sanitizeValue(row.unidad_id),
        placa: this.sanitizeValue(row.placa),
        marca: this.sanitizeValue(row.marca),
        modelo: this.sanitizeValue(row.modelo),
        tipo_combustible_unidad: this.sanitizeValue(row.tipo_combustible_unidad),
        capacidad_tanque: this.safeNumber(row.capacidad_tanque),
        operacion: this.sanitizeValue(row.operacion),
        zona_id: this.sanitizeValue(row.zona_id),
        zona: this.sanitizeValue(row.zona),
        zona_codigo: this.sanitizeValue(row.zona_codigo),
        conductor_id: this.sanitizeValue(row.conductor_id),
        conductor_nombre_completo: this.sanitizeValue(row.conductor_nombre_completo),
        conductor_dni: this.sanitizeValue(row.conductor_dni),
        conductor_codigo: this.sanitizeValue(row.conductor_codigo),
        grifo_id: this.sanitizeValue(row.grifo_id),
        grifo_nombre: this.sanitizeValue(row.grifo_nombre),
        grifo_codigo: this.sanitizeValue(row.grifo_codigo),
        grifo_direccion: this.sanitizeValue(row.grifo_direccion),
        sede_id: this.sanitizeValue(row.sede_id),
        sede_nombre: this.sanitizeValue(row.sede_nombre),
        sede_codigo: this.sanitizeValue(row.sede_codigo),
        ruta_id: this.sanitizeValue(row.ruta_id),
        ruta_nombre: this.sanitizeValue(row.ruta_nombre),
        ruta_codigo: this.sanitizeValue(row.ruta_codigo),
        ruta_origen: this.sanitizeValue(row.ruta_origen),
        ruta_destino: this.sanitizeValue(row.ruta_destino),
        ruta_distancia: this.safeNumber(row.ruta_distancia),
        turno_id: this.sanitizeValue(row.turno_id),
        turno: this.sanitizeValue(row.turno),
        turno_hora_inicio: this.sanitizeValue(row.turno_hora_inicio),
        turno_hora_fin: this.sanitizeValue(row.turno_hora_fin),
        kilometraje_actual: this.safeNumber(row.kilometraje_actual),
        kilometraje_anterior: this.safeNumber(row.kilometraje_anterior),
        diferencia_kilometraje: this.safeNumber(row.diferencia_kilometraje),
        precinto_nuevo: this.sanitizeValue(row.precinto_nuevo),
        precinto_anterior: this.sanitizeValue(row.precinto_anterior),
        precinto_2: this.sanitizeValue(row.precinto_2),
        cantidad_solicitada: this.safeNumber(row.cantidad_solicitada, 3),
        tipo_combustible: this.sanitizeValue(row.tipo_combustible),
        cantidad_abastecida: this.safeNumber(row.cantidad_abastecida, 3),
        motivo_diferencia: this.sanitizeValue(row.motivo_diferencia),
        diferencia_cantidad: this.safeNumber(row.diferencia_cantidad, 3),
        horometro_actual: this.safeNumber(row.horometro_actual),
        horometro_anterior: this.safeNumber(row.horometro_anterior),
        diferencia_horometro: this.safeNumber(row.diferencia_horometro),
        costo_por_unidad: this.safeNumber(row.costo_por_unidad, 4),
        costo_total: this.safeNumber(row.costo_total),
        unidad_medida: this.sanitizeValue(row.unidad_medida),
        rendimiento_km_por_galon: this.safeNumber(row.rendimiento_km_por_galon),
        numero_ticket_grifo: this.sanitizeValue(row.numero_ticket_grifo),
        vale_diesel: this.sanitizeValue(row.vale_diesel),
        numero_factura: this.sanitizeValue(row.numero_factura),
        importe_factura: this.safeNumber(row.importe_factura),
        requerimiento: this.sanitizeValue(row.requerimiento),
        numero_salida_almacen: this.sanitizeValue(row.numero_salida_almacen),
        estado_id: this.sanitizeValue(row.estado_id),
        estado_ticket: this.sanitizeValue(row.estado_ticket),
        estado_descripcion: this.sanitizeValue(row.estado_descripcion),
        estado_color: this.sanitizeValue(row.estado_color),
        estado_detalle: this.sanitizeValue(row.estado_detalle),
        solicitado_por_id: this.sanitizeValue(row.solicitado_por_id),
        solicitado_por: this.sanitizeValue(row.solicitado_por),
        solicitado_por_codigo: this.sanitizeValue(row.solicitado_por_codigo),
        fecha_solicitud: this.safeDate(row.fecha_solicitud),
        aprobado_por_id: this.sanitizeValue(row.aprobado_por_id),
        aprobado_por: this.sanitizeValue(row.aprobado_por),
        fecha_aprobacion: this.safeDate(row.fecha_aprobacion),
        controlador_id: this.sanitizeValue(row.controlador_id),
        controlador: this.sanitizeValue(row.controlador),
        observaciones_controlador: this.sanitizeValue(row.observaciones_controlador),
        concluido_por_id: this.sanitizeValue(row.concluido_por_id),
        concluido_por: this.sanitizeValue(row.concluido_por),
        fecha_concluido: this.safeDate(row.fecha_concluido),
        motivo_rechazo: this.sanitizeValue(row.motivo_rechazo),
        rechazado_por_id: this.sanitizeValue(row.rechazado_por_id),
        rechazado_por: this.sanitizeValue(row.rechazado_por),
        fecha_rechazo: this.safeDate(row.fecha_rechazo),
        observaciones_solicitud: this.sanitizeValue(row.observaciones_solicitud),
        ticket_creado_en: this.safeDate(row.ticket_creado_en),
        ticket_actualizado_en: this.safeDate(row.ticket_actualizado_en),
        detalle_creado_en: this.safeDate(row.detalle_creado_en),
        detalle_actualizado_en: this.safeDate(row.detalle_actualizado_en),
      });

      // SIN FORMATOS DE NÚMERO NI FECHA PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    });

    // SIN FILTROS NI VISTAS CONGELADAS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
  }

  private getColumnLetter(columnNumber: number): string {
    let letter = '';
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return letter;
  }

  private crearHojaConsumoPorUnidad(workbook: ExcelJS.Workbook, datos: any[]) {
    const worksheet = workbook.addWorksheet('Consumo por Unidad');

    worksheet.columns = [
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Combustible', key: 'tipo_combustible', width: 12 },
      { header: 'Zona', key: 'zona', width: 15 },
      { header: 'Total Abastecimientos', key: 'total_abastecimientos', width: 20 },
      { header: 'Abast. Aprobados', key: 'abastecimientos_aprobados', width: 18 },
      { header: 'Total Galones', key: 'total_galones_consumidos', width: 15 },
      { header: 'Promedio Gal/Abast', key: 'promedio_galones_por_abastecimiento', width: 18 },
      { header: 'Costo Total', key: 'costo_total_acumulado', width: 15 },
      { header: 'Precio Prom/Gal', key: 'precio_promedio_galon', width: 15 },
      { header: 'Ultimo Km', key: 'ultimo_kilometraje', width: 12 },
      { header: 'Total Km', key: 'total_km_recorridos', width: 12 },
      { header: 'Rendimiento Km/Gal', key: 'rendimiento_promedio_km_por_galon', width: 18 },
      { header: 'Ultimo Abast.', key: 'ultimo_abastecimiento', width: 15 },
    ];

    // ✅ FORMATO ESPECÍFICO PARA CONSUMO POR UNIDAD: Color azul de fondo, texto blanco, alto 40px
    const headerRow = worksheet.getRow(1);
    headerRow.height = 40;
    headerRow.font = { bold: true, size: 11 };

    // Aplicar color azul solo a las celdas del encabezado que tienen datos
    for (let colIndex = 1; colIndex <= worksheet.columns.length; colIndex++) {
      const cell = headerRow.getCell(colIndex);
      if (cell.value) { // Solo si la celda tiene valor (tiene datos)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF043261' } // Color AZUL de fondo
        };
        cell.font = { color: { argb: 'FFFFFFFF' } }; // Texto BLANCO
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }

    // Agregar datos
    datos.forEach((row) => {
      const newRow = worksheet.addRow({
        placa: this.sanitizeValue(row.placa),
        marca: this.sanitizeValue(row.marca),
        modelo: this.sanitizeValue(row.modelo),
        tipo_combustible: this.sanitizeValue(row.tipo_combustible),
        zona: this.sanitizeValue(row.zona),
        total_abastecimientos: this.safeNumber(row.total_abastecimientos, 0),
        abastecimientos_aprobados: this.safeNumber(row.abastecimientos_aprobados, 0),
        total_galones_consumidos: this.safeNumber(row.total_galones_consumidos, 3),
        promedio_galones_por_abastecimiento: this.safeNumber(row.promedio_galones_por_abastecimiento, 3),
        costo_total_acumulado: this.safeNumber(row.costo_total_acumulado),
        precio_promedio_galon: this.safeNumber(row.precio_promedio_galon, 4),
        ultimo_kilometraje: this.safeNumber(row.ultimo_kilometraje),
        total_km_recorridos: this.safeNumber(row.total_km_recorridos),
        rendimiento_promedio_km_por_galon: this.safeNumber(row.rendimiento_promedio_km_por_galon),
        ultimo_abastecimiento: this.safeDate(row.ultimo_abastecimiento),
      });

      // SIN FORMATOS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    });

    // SIN FILTROS NI VISTAS CONGELADAS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
  }

  private crearHojaEstadisticasGrifo(workbook: ExcelJS.Workbook, datos: any[]) {
    const worksheet = workbook.addWorksheet('Estadisticas por Grifo');

    worksheet.columns = [
      { header: 'Grifo', key: 'grifo_nombre', width: 25 },
      { header: 'Codigo', key: 'grifo_codigo', width: 12 },
      { header: 'Sede', key: 'sede_nombre', width: 20 },
      { header: 'Zona', key: 'zona_nombre', width: 15 },
      { header: 'Total Abastecimientos', key: 'total_abastecimientos', width: 20 },
      { header: 'Unidades Atendidas', key: 'total_unidades_atendidas', width: 18 },
      { header: 'Conductores', key: 'total_conductores_atendidos', width: 15 },
      { header: 'Galones Despachados', key: 'total_galones_despachados', width: 18 },
      { header: 'Prom. Gal/Ticket', key: 'promedio_galones_por_ticket', width: 15 },
      { header: 'Total Ingresos', key: 'total_ingresos', width: 15 },
      { header: 'Prom. Ingreso/Ticket', key: 'promedio_ingreso_por_ticket', width: 18 },
      { header: 'Precio Prom/Gal', key: 'precio_promedio_galon', width: 15 },
    ];

    // ✅ FORMATO ESPECÍFICO PARA ESTADÍSTICAS POR GRIFO: Color azul de fondo, texto blanco, alto 40px
    const headerRow = worksheet.getRow(1);
    headerRow.height = 40;
    headerRow.font = { bold: true, size: 11 };

    // Aplicar color azul solo a las celdas del encabezado que tienen datos
    for (let colIndex = 1; colIndex <= worksheet.columns.length; colIndex++) {
      const cell = headerRow.getCell(colIndex);
      if (cell.value) { // Solo si la celda tiene valor (tiene datos)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF043261' } // Color AZUL de fondo
        };
        cell.font = { color: { argb: 'FFFFFFFF' } }; // Texto BLANCO
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }

    datos.forEach((row) => {
      const newRow = worksheet.addRow({
        grifo_nombre: this.sanitizeValue(row.grifo_nombre),
        grifo_codigo: this.sanitizeValue(row.grifo_codigo),
        sede_nombre: this.sanitizeValue(row.sede_nombre),
        zona_nombre: this.sanitizeValue(row.zona_nombre),
        total_abastecimientos: this.safeNumber(row.total_abastecimientos, 0),
        total_unidades_atendidas: this.safeNumber(row.total_unidades_atendidas, 0),
        total_conductores_atendidos: this.safeNumber(row.total_conductores_atendidos, 0),
        total_galones_despachados: this.safeNumber(row.total_galones_despachados, 3),
        promedio_galones_por_ticket: this.safeNumber(row.promedio_galones_por_ticket, 3),
        total_ingresos: this.safeNumber(row.total_ingresos),
        promedio_ingreso_por_ticket: this.safeNumber(row.promedio_ingreso_por_ticket),
        precio_promedio_galon: this.safeNumber(row.precio_promedio_galon, 4),
      });

      // SIN FORMATOS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    });

    // SIN FILTROS NI VISTAS CONGELADAS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
  }

  private crearHojaRendimiento(workbook: ExcelJS.Workbook, datos: any[]) {
    const worksheet = workbook.addWorksheet('Rendimiento');

    worksheet.columns = [
      { header: 'N° Ticket', key: 'numero_ticket', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Placa', key: 'placa', width: 12 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Conductor', key: 'conductor', width: 30 },
      { header: 'Km Recorridos', key: 'km_recorridos', width: 15 },
      { header: 'Galones', key: 'galones_consumidos', width: 12 },
      { header: 'Km/Gal', key: 'rendimiento_km_por_galon', width: 10 },
      { header: 'Costo/Km', key: 'costo_por_km', width: 12 },
      { header: 'Precio/Gal', key: 'costo_por_unidad', width: 12 },
      { header: 'Costo Total', key: 'costo_total', width: 12 },
      { header: 'Grifo', key: 'grifo', width: 25 },
      { header: 'Ruta', key: 'ruta', width: 25 },
    ];

    // ✅ FORMATO ESPECÍFICO PARA RENDIMIENTO: Color azul de fondo, texto blanco, alto 40px
    const headerRow = worksheet.getRow(1);
    headerRow.height = 40;
    headerRow.font = { bold: true, size: 11 };

    // Aplicar color azul solo a las celdas del encabezado que tienen datos
    for (let colIndex = 1; colIndex <= worksheet.columns.length; colIndex++) {
      const cell = headerRow.getCell(colIndex);
      if (cell.value) { // Solo si la celda tiene valor (tiene datos)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF043261' } // Color AZUL de fondo
        };
        cell.font = { color: { argb: 'FFFFFFFF' } }; // Texto BLANCO
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }

    datos.forEach((row) => {
      const newRow = worksheet.addRow({
        numero_ticket: this.sanitizeValue(row.numero_ticket),
        fecha: this.safeDate(row.fecha),
        placa: this.sanitizeValue(row.placa),
        marca: this.sanitizeValue(row.marca),
        modelo: this.sanitizeValue(row.modelo),
        conductor: this.sanitizeValue(row.conductor),
        km_recorridos: this.safeNumber(row.km_recorridos),
        galones_consumidos: this.safeNumber(row.galones_consumidos, 3),
        rendimiento_km_por_galon: this.safeNumber(row.rendimiento_km_por_galon),
        costo_por_km: this.safeNumber(row.costo_por_km, 4),
        costo_por_unidad: this.safeNumber(row.costo_por_unidad, 4),
        costo_total: this.safeNumber(row.costo_total),
        grifo: this.sanitizeValue(row.grifo),
        ruta: this.sanitizeValue(row.ruta),
      });

      // SIN FORMATOS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    });

    // SIN FILTROS NI VISTAS CONGELADAS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
  }

  private agregarHojaInformacion(workbook: ExcelJS.Workbook, filtros: FiltrosReporteDto, totalRegistros: number) {
    const worksheet = workbook.addWorksheet('Informacion', { state: 'visible' });
    
    worksheet.columns = [
      { width: 25 },
      { width: 40 }
    ];

    // Título SIN FORMATO PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DE ABASTECIMIENTO DE COMBUSTIBLE';
    // worksheet.getRow(1).height = 30;

    // Información del reporte
    worksheet.addRow([]);
    worksheet.addRow(['Fecha de Generacion:', new Date().toLocaleString('es-PE')]);
    worksheet.addRow(['Tipo de Reporte:', (filtros.tipoReporte?.toUpperCase() || 'ABASTECIMIENTOS').replace(/_/g, ' ')]);
    worksheet.addRow(['Total de Registros:', totalRegistros]);
    worksheet.addRow([]);

    // Filtros aplicados SIN FORMATO PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    const filtrosRow = worksheet.addRow(['FILTROS APLICADOS']);
    // filtrosRow.getCell(1).font = { bold: true, size: 12 };
    
    if (filtros.fechaInicio) {
      worksheet.addRow(['Fecha Inicio:', filtros.fechaInicio]);
    }
    if (filtros.fechaFin) {
      worksheet.addRow(['Fecha Fin:', filtros.fechaFin]);
    }
    if (filtros.zonaId) {
      worksheet.addRow(['Zona ID:', filtros.zonaId]);
    }
    if (filtros.grifoId) {
      worksheet.addRow(['Grifo ID:', filtros.grifoId]);
    }
    if (filtros.placa) {
      worksheet.addRow(['Placa:', filtros.placa]);
    }
    if (filtros.estadoTicket) {
      worksheet.addRow(['Estado:', filtros.estadoTicket]);
    }

    // SIN ESTILOS PARA EVITAR PROBLEMAS DE COMPATIBILIDAD
    // for (let i = 3; i <= worksheet.rowCount; i++) {
    //   const cell = worksheet.getCell(`A${i}`);
    //   cell.font = { bold: true };
    // }
  }

  async generarCSV(datos: any[]): Promise<string> {
    if (datos.length === 0) {
      return '';
    }

    const headers = Object.keys(datos[0]);
    const csvRows = [headers.join(',')];

    for (const row of datos) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = ('' + (value ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}