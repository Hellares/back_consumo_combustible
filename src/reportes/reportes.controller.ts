import { 
  Controller, 
  Get, 
  Query, 
  Res, 
  HttpStatus,
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { FiltrosReporteDto, FormatoExportacion, TipoReporte } from './dto/filtros-reporte.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Exportar reporte de abastecimientos
   */
  @Get('exportar')
  @ApiOperation({ 
    summary: 'Exportar reporte de abastecimientos',
    description: 'Genera y descarga un reporte en el formato especificado (Excel, CSV o JSON) con los filtros aplicados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo generado exitosamente',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' }
      },
      'text/csv': {
        schema: { type: 'string' }
      },
      'application/json': {
        schema: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async exportarReporte(
    @Query() filtros: FiltrosReporteDto,
    @Res() res: Response
  ) {
    try {
      // Obtener datos del reporte
      const datos = await this.reportesService.obtenerDatosReporte(filtros) as any[];

      if (!datos || datos.length === 0) {
        throw new BadRequestException('No se encontraron datos para los filtros especificados');
      }

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const tipoReporte = filtros.tipoReporte || TipoReporte.ABASTECIMIENTOS;
      const formato = filtros.formato || FormatoExportacion.EXCEL;

      // Generar archivo según el formato
      switch (formato) {
        case FormatoExportacion.EXCEL:
          const excelBuffer = await this.reportesService.generarExcel(datos, tipoReporte, filtros);
          const excelFilename = `Reporte_${tipoReporte}_${timestamp}.xlsx`;
          
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${excelFilename}"`);
          res.setHeader('Content-Length', excelBuffer.length);
          return res.send(excelBuffer);

        case FormatoExportacion.CSV:
          const csvData = await this.reportesService.generarCSV(datos);
          const csvFilename = `Reporte_${tipoReporte}_${timestamp}.csv`;
          
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${csvFilename}"`);
          // Agregar BOM para Excel
          return res.send('\uFEFF' + csvData);

        case FormatoExportacion.JSON:
          const jsonFilename = `Reporte_${tipoReporte}_${timestamp}.json`;
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${jsonFilename}"`);
          return res.json({
            success: true,
            tipoReporte,
            filtros: {
              fechaInicio: filtros.fechaInicio,
              fechaFin: filtros.fechaFin,
              zonaId: filtros.zonaId,
              grifoId: filtros.grifoId,
              unidadId: filtros.unidadId,
              placa: filtros.placa,
            },
            totalRegistros: datos.length,
            fechaGeneracion: new Date().toISOString(),
            datos
          });

        default:
          throw new BadRequestException('Formato de exportación no válido');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al generar el reporte: ${error.message}`);
    }
  }

  /**
   * Obtener datos del reporte en formato JSON (sin descarga)
   */
  @Get('datos')
  @ApiOperation({ 
    summary: 'Obtener datos del reporte',
    description: 'Retorna los datos del reporte en formato JSON sin generar archivo de descarga'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Datos obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        tipoReporte: { type: 'string' },
        totalRegistros: { type: 'number' },
        datos: { type: 'array' }
      }
    }
  })
  async obtenerDatosReporte(@Query() filtros: FiltrosReporteDto) {
    const datos = await this.reportesService.obtenerDatosReporte(filtros) as any[];
    
    return {
      success: true,
      tipoReporte: filtros.tipoReporte || TipoReporte.ABASTECIMIENTOS,
      filtros: {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        zonaId: filtros.zonaId,
        grifoId: filtros.grifoId,
        unidadId: filtros.unidadId,
        placa: filtros.placa,
        conductorId: filtros.conductorId,
        rutaId: filtros.rutaId,
        estadoTicket: filtros.estadoTicket,
      },
      totalRegistros: datos.length,
      fechaConsulta: new Date().toISOString(),
      datos
    };
  }

  /**
   * Exportar reporte de abastecimientos (endpoint específico)
   */
  @Get('exportar/abastecimientos')
  @ApiOperation({ 
    summary: 'Exportar reporte de abastecimientos',
    description: 'Endpoint específico para exportar el reporte completo de abastecimientos'
  })
  @ApiQuery({ name: 'formato', enum: FormatoExportacion, required: false })
  async exportarAbastecimientos(
    @Query() filtros: FiltrosReporteDto,
    @Res() res: Response
  ) {
    filtros.tipoReporte = TipoReporte.ABASTECIMIENTOS;
    return this.exportarReporte(filtros, res);
  }

  /**
   * Exportar reporte de consumo por unidad
   */
  @Get('exportar/consumo-por-unidad')
  @ApiOperation({ 
    summary: 'Exportar reporte de consumo por unidad',
    description: 'Genera reporte con estadísticas de consumo agrupadas por unidad vehicular'
  })
  @ApiQuery({ name: 'formato', enum: FormatoExportacion, required: false })
  async exportarConsumoPorUnidad(
    @Query() filtros: FiltrosReporteDto,
    @Res() res: Response
  ) {
    filtros.tipoReporte = TipoReporte.CONSUMO_POR_UNIDAD;
    return this.exportarReporte(filtros, res);
  }

  /**
   * Exportar reporte de estadísticas por grifo
   */
  @Get('exportar/estadisticas-grifo')
  @ApiOperation({ 
    summary: 'Exportar estadísticas por grifo',
    description: 'Genera reporte con estadísticas de operación y ventas por grifo'
  })
  @ApiQuery({ name: 'formato', enum: FormatoExportacion, required: false })
  async exportarEstadisticasGrifo(
    @Query() filtros: FiltrosReporteDto,
    @Res() res: Response
  ) {
    filtros.tipoReporte = TipoReporte.ESTADISTICAS_GRIFO;
    return this.exportarReporte(filtros, res);
  }

  /**
   * Exportar reporte de rendimiento
   */
  @Get('exportar/rendimiento')
  @ApiOperation({ 
    summary: 'Exportar reporte de rendimiento',
    description: 'Genera reporte detallado de rendimiento (km/galón) por abastecimiento'
  })
  @ApiQuery({ name: 'formato', enum: FormatoExportacion, required: false })
  async exportarRendimiento(
    @Query() filtros: FiltrosReporteDto,
    @Res() res: Response
  ) {
    filtros.tipoReporte = TipoReporte.RENDIMIENTO;
    return this.exportarReporte(filtros, res);
  }

  /**
   * Obtener resumen de datos disponibles para reportes
   */
  @Get('resumen')
  @ApiOperation({ 
    summary: 'Obtener resumen de datos disponibles',
    description: 'Retorna un resumen con contadores de registros disponibles para reportes'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen obtenido exitosamente'
  })
  async obtenerResumen() {
    const [
      totalAbastecimientos,
      totalUnidades,
      totalGrifos,
      fechaPrimerRegistro,
      fechaUltimoRegistro
    ] = await Promise.all([
      this.reportesService['prisma'].$queryRaw`
        SELECT COUNT(*) as total FROM vista_reporte_abastecimientos
      `,
      this.reportesService['prisma'].$queryRaw`
        SELECT COUNT(DISTINCT unidad_id) as total FROM vista_reporte_abastecimientos
      `,
      this.reportesService['prisma'].$queryRaw`
        SELECT COUNT(DISTINCT grifo_id) as total FROM vista_reporte_abastecimientos
      `,
      this.reportesService['prisma'].$queryRaw`
        SELECT MIN(fecha_abastecimiento) as fecha FROM vista_reporte_abastecimientos
      `,
      this.reportesService['prisma'].$queryRaw`
        SELECT MAX(fecha_abastecimiento) as fecha FROM vista_reporte_abastecimientos
      `
    ]);

    return {
      success: true,
      resumen: {
        totalAbastecimientos: Number(totalAbastecimientos[0]?.total || 0),
        totalUnidades: Number(totalUnidades[0]?.total || 0),
        totalGrifos: Number(totalGrifos[0]?.total || 0),
        fechaPrimerRegistro: fechaPrimerRegistro[0]?.fecha,
        fechaUltimoRegistro: fechaUltimoRegistro[0]?.fecha,
      },
      tiposReporteDisponibles: [
        {
          tipo: TipoReporte.ABASTECIMIENTOS,
          nombre: 'Reporte Completo de Abastecimientos',
          descripcion: 'Detalle completo de todos los abastecimientos con información de tickets, unidades, conductores y costos'
        },
        {
          tipo: TipoReporte.CONSUMO_POR_UNIDAD,
          nombre: 'Consumo por Unidad',
          descripcion: 'Estadísticas agregadas de consumo, costos y rendimiento por unidad vehicular'
        },
        {
          tipo: TipoReporte.ESTADISTICAS_GRIFO,
          nombre: 'Estadísticas por Grifo',
          descripcion: 'Análisis de operaciones, volumen de ventas e ingresos por grifo'
        },
        {
          tipo: TipoReporte.RENDIMIENTO,
          nombre: 'Rendimiento Detallado',
          descripcion: 'Análisis detallado de rendimiento (km/galón) y costo por kilómetro'
        }
      ],
      formatosDisponibles: [
        { formato: FormatoExportacion.EXCEL, extension: '.xlsx', descripcion: 'Excel con formato profesional' },
        { formato: FormatoExportacion.CSV, extension: '.csv', descripcion: 'CSV compatible con Excel' },
        { formato: FormatoExportacion.JSON, extension: '.json', descripcion: 'JSON para integraciones' }
      ]
    };
  }
}