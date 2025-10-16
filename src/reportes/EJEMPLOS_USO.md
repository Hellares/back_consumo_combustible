# Ejemplos de Uso - Módulo de Reportes

## 📋 Ejemplos Prácticos

### 1. Exportar Reporte Completo de Abastecimientos en Excel

**Escenario:** Necesitas un reporte de todos los abastecimientos del mes de enero 2024 de la zona 1.

```bash
curl -X GET "http://localhost:3000/api/reportes/exportar/abastecimientos?formato=excel&fechaInicio=2024-01-01&fechaFin=2024-01-31&zonaId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output reporte_enero_2024.xlsx
```

**Resultado:** Archivo Excel con:
- Hoja "Abastecimientos" con todos los registros
- Hoja "Información" con metadatos del reporte
- Formato profesional con colores y filtros

---

### 2. Exportar Consumo por Unidad en CSV

**Escenario:** Necesitas importar datos de consumo a otro sistema.

```bash
curl -X GET "http://localhost:3000/api/reportes/exportar/consumo-por-unidad?formato=csv" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output consumo_unidades.csv
```

**Resultado:** Archivo CSV compatible con Excel y otros sistemas.

---

### 3. Obtener Datos en JSON para Dashboard

**Escenario:** Tu frontend necesita datos para mostrar gráficos.

```javascript
// Frontend - React/Vue/Angular
const obtenerDatosReporte = async () => {
  const response = await fetch(
    'http://localhost:3000/api/reportes/datos?tipoReporte=consumo_por_unidad&zonaId=1',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log(data);
  // {
  //   success: true,
  //   tipoReporte: "consumo_por_unidad",
  //   totalRegistros: 25,
  //   datos: [...]
  // }
  
  return data.datos;
};
```

---

### 4. Reporte de Rendimiento de una Unidad Específica

**Escenario:** Analizar el rendimiento histórico de la unidad ABC-123.

```bash
curl -X GET "http://localhost:3000/api/reportes/exportar/rendimiento?formato=excel&placa=ABC-123&fechaInicio=2024-01-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output rendimiento_ABC123.xlsx
```

---

### 5. Estadísticas de un Grifo Específico

**Escenario:** Reporte mensual de operaciones del grifo ID 5.

```bash
curl -X GET "http://localhost:3000/api/reportes/exportar/estadisticas-grifo?formato=excel&grifoId=5&fechaInicio=2024-01-01&fechaFin=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output estadisticas_grifo_5.xlsx
```

---

### 6. Reporte Solo de Tickets Completados

**Escenario:** Necesitas solo los abastecimientos que ya fueron concluidos.

```bash
curl -X GET "http://localhost:3000/api/reportes/exportar?formato=excel&soloCompletados=true&fechaInicio=2024-01-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output completados_2024.xlsx
```

---

### 7. Obtener Resumen de Datos Disponibles

**Escenario:** Verificar qué datos hay disponibles antes de generar reportes.

```bash
curl -X GET "http://localhost:3000/api/reportes/resumen" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "resumen": {
    "totalAbastecimientos": 1250,
    "totalUnidades": 45,
    "totalGrifos": 8,
    "fechaPrimerRegistro": "2023-01-15",
    "fechaUltimoRegistro": "2024-12-31"
  },
  "tiposReporteDisponibles": [...],
  "formatosDisponibles": [...]
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Reporte Mensual para Gerencia

```javascript
// Generar reporte del mes anterior
const generarReporteMensual = async () => {
  const hoy = new Date();
  const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  
  const params = new URLSearchParams({
    formato: 'excel',
    tipoReporte: 'abastecimientos',
    fechaInicio: primerDiaMesAnterior.toISOString().split('T')[0],
    fechaFin: ultimoDiaMesAnterior.toISOString().split('T')[0]
  });
  
  const response = await fetch(
    `http://localhost:3000/api/reportes/exportar?${params}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Mensual_${primerDiaMesAnterior.toISOString().slice(0, 7)}.xlsx`;
  a.click();
};
```

---

### Caso 2: Análisis de Rendimiento por Zona

```javascript
// Comparar rendimiento de todas las zonas
const analizarRendimientoPorZona = async () => {
  const zonas = [1, 2, 3, 4]; // IDs de zonas
  const reportes = [];
  
  for (const zonaId of zonas) {
    const response = await fetch(
      `http://localhost:3000/api/reportes/datos?tipoReporte=consumo_por_unidad&zonaId=${zonaId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const data = await response.json();
    reportes.push({
      zonaId,
      datos: data.datos
    });
  }
  
  return reportes;
};
```

---

### Caso 3: Exportación Programada (Backend)

```typescript
// Servicio para generar reportes automáticos
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReportesService } from './reportes.service';
import * as fs from 'fs';

@Injectable()
export class ReportesAutomaticosService {
  constructor(private readonly reportesService: ReportesService) {}
  
  // Ejecutar cada primer día del mes a las 8:00 AM
  @Cron('0 8 1 * *')
  async generarReporteMensual() {
    const hoy = new Date();
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    
    const filtros = {
      fechaInicio: mesAnterior.toISOString().split('T')[0],
      fechaFin: finMesAnterior.toISOString().split('T')[0],
      tipoReporte: 'abastecimientos' as any,
      formato: 'excel' as any
    };
    
    const datos = await this.reportesService.obtenerDatosReporte(filtros);
    const buffer = await this.reportesService.generarExcel(
      datos as any[], 
      filtros.tipoReporte, 
      filtros
    );
    
    // Guardar en servidor o enviar por email
    const filename = `Reporte_${mesAnterior.toISOString().slice(0, 7)}.xlsx`;
    fs.writeFileSync(`./reportes/${filename}`, buffer);
    
    console.log(`Reporte mensual generado: ${filename}`);
  }
}
```

---

### Caso 4: Botón de Descarga en Frontend (React)

```tsx
import React, { useState } from 'react';
import axios from 'axios';

const BotonDescargarReporte: React.FC = () => {
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    formato: 'excel',
    tipoReporte: 'abastecimientos'
  });
  
  const descargarReporte = async () => {
    setCargando(true);
    
    try {
      const response = await axios.get('/api/reportes/exportar', {
        params: filtros,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${filtros.tipoReporte}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al generar el reporte');
    } finally {
      setCargando(false);
    }
  };
  
  return (
    <div>
      <h3>Generar Reporte</h3>
      
      <input
        type="date"
        value={filtros.fechaInicio}
        onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
      />
      
      <input
        type="date"
        value={filtros.fechaFin}
        onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
      />
      
      <select
        value={filtros.tipoReporte}
        onChange={(e) => setFiltros({...filtros, tipoReporte: e.target.value})}
      >
        <option value="abastecimientos">Abastecimientos</option>
        <option value="consumo_por_unidad">Consumo por Unidad</option>
        <option value="estadisticas_grifo">Estadísticas Grifo</option>
        <option value="rendimiento">Rendimiento</option>
      </select>
      
      <button onClick={descargarReporte} disabled={cargando}>
        {cargando ? 'Generando...' : 'Descargar Reporte'}
      </button>
    </div>
  );
};

export default BotonDescargarReporte;
```

---

## 🔍 Consultas SQL Directas

Si necesitas consultar las vistas directamente desde la base de datos:

```sql
-- Ver últimos 10 abastecimientos
SELECT 
  numero_ticket,
  fecha_abastecimiento,
  placa,
  conductor_nombre_completo,
  cantidad_solicitada,
  costo_total,
  estado_ticket
FROM vista_reporte_abastecimientos
ORDER BY fecha_abastecimiento DESC
LIMIT 10;

-- Unidades con mayor consumo
SELECT 
  placa,
  marca,
  modelo,
  total_galones_consumidos,
  costo_total_acumulado,
  rendimiento_promedio_km_por_galon
FROM vista_consumo_por_unidad
ORDER BY total_galones_consumidos DESC
LIMIT 10;

-- Grifos más utilizados
SELECT 
  grifo_nombre,
  total_abastecimientos,
  total_galones_despachados,
  total_ingresos
FROM vista_estadisticas_por_grifo
ORDER BY total_abastecimientos DESC;

-- Mejor rendimiento
SELECT 
  placa,
  fecha,
  km_recorridos,
  galones_consumidos,
  rendimiento_km_por_galon
FROM vista_rendimiento_detallado
WHERE rendimiento_km_por_galon > 0
ORDER BY rendimiento_km_por_galon DESC
LIMIT 10;
```

---

## 📊 Tips y Mejores Prácticas

1. **Usa filtros de fecha** para reportes grandes
2. **Formato Excel** para reportes ejecutivos
3. **Formato CSV** para importar a otros sistemas
4. **Formato JSON** para dashboards y gráficos
5. **Consulta el resumen** antes de generar reportes grandes
6. **Guarda el token JWT** de forma segura
7. **Maneja errores** apropiadamente en el frontend
8. **Usa loading states** mientras se genera el reporte