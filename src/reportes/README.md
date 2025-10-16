# Módulo de Reportes y Exportación

Sistema completo de generación y exportación de reportes de abastecimiento de combustible.

## 📋 Características

- ✅ **4 tipos de reportes** predefinidos
- ✅ **3 formatos de exportación**: Excel (.xlsx), CSV, JSON
- ✅ **Vistas SQL optimizadas** para consultas rápidas
- ✅ **Filtros avanzados** por fecha, zona, grifo, unidad, conductor, etc.
- ✅ **Formato profesional** en archivos Excel con estilos y múltiples hojas
- ✅ **Documentación Swagger** completa

## 🗂️ Tipos de Reportes

### 1. Reporte Completo de Abastecimientos
**Vista SQL:** `vista_reporte_abastecimientos`

Incluye toda la información detallada de cada abastecimiento:
- Datos del ticket (número, fecha, hora)
- Información de la unidad (placa, marca, modelo)
- Conductor (nombre, DNI, código)
- Grifo y ubicación (sede, zona)
- Kilometrajes y diferencias
- Precintos (nuevo, anterior)
- Cantidades solicitadas vs abastecidas
- Costos detallados
- Rendimiento (km/galón)
- Documentación (ticket grifo, factura)
- Estados y usuarios involucrados

### 2. Consumo por Unidad
**Vista SQL:** `vista_consumo_por_unidad`

Estadísticas agregadas por unidad vehicular:
- Total de abastecimientos
- Total de galones consumidos
- Costos acumulados
- Rendimiento promedio
- Kilometrajes totales

### 3. Estadísticas por Grifo
**Vista SQL:** `vista_estadisticas_por_grifo`

Análisis de operación por grifo:
- Total de abastecimientos
- Unidades y conductores atendidos
- Galones despachados
- Ingresos totales y promedios

### 4. Rendimiento Detallado
**Vista SQL:** `vista_rendimiento_detallado`

Análisis de eficiencia:
- Km recorridos por abastecimiento
- Rendimiento km/galón
- Costo por kilómetro
- Comparativas por unidad

## 🚀 Endpoints Disponibles

### Exportar Reporte General
```http
GET /api/reportes/exportar
```

**Query Parameters:**
- `formato`: `excel` | `csv` | `json` (default: `excel`)
- `tipoReporte`: `abastecimientos` | `consumo_por_unidad` | `estadisticas_grifo` | `rendimiento`
- `fechaInicio`: `YYYY-MM-DD`
- `fechaFin`: `YYYY-MM-DD`
- `zonaId`: number
- `sedeId`: number
- `grifoId`: number
- `unidadId`: number
- `placa`: string
- `conductorId`: number
- `rutaId`: number
- `estadoTicket`: `SOLICITADO` | `APROBADO` | `RECHAZADO` | `CONCLUIDO`
- `tipoCombustible`: string
- `soloCompletados`: boolean

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/reportes/exportar?formato=excel&fechaInicio=2024-01-01&fechaFin=2024-12-31&zonaId=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output reporte.xlsx
```

### Endpoints Específicos

#### 1. Exportar Abastecimientos
```http
GET /api/reportes/exportar/abastecimientos?formato=excel&fechaInicio=2024-01-01
```

#### 2. Exportar Consumo por Unidad
```http
GET /api/reportes/exportar/consumo-por-unidad?formato=excel&zonaId=1
```

#### 3. Exportar Estadísticas por Grifo
```http
GET /api/reportes/exportar/estadisticas-grifo?formato=csv&sedeId=2
```

#### 4. Exportar Rendimiento
```http
GET /api/reportes/exportar/rendimiento?formato=json&placa=ABC-123
```

### Obtener Datos sin Descarga
```http
GET /api/reportes/datos?tipoReporte=abastecimientos&fechaInicio=2024-01-01
```

Retorna los datos en formato JSON sin generar archivo de descarga.

### Obtener Resumen
```http
GET /api/reportes/resumen
```

Retorna información sobre datos disponibles y tipos de reportes.

## 📊 Formatos de Exportación

### Excel (.xlsx)
- **Características:**
  - Múltiples hojas de cálculo
  - Formato profesional con colores
  - Encabezados en negrita
  - Filtros automáticos
  - Formato de números y fechas
  - Hoja de información del reporte
  - Anchos de columna optimizados

### CSV
- **Características:**
  - Compatible con Excel
  - Codificación UTF-8 con BOM
  - Separado por comas
  - Ideal para importación a otros sistemas

### JSON
- **Características:**
  - Estructura completa de datos
  - Metadatos del reporte
  - Información de filtros aplicados
  - Ideal para integraciones y APIs

## 🔧 Uso desde el Frontend

### Ejemplo con Fetch API
```typescript
async function descargarReporte() {
  const params = new URLSearchParams({
    formato: 'excel',
    tipoReporte: 'abastecimientos',
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    zonaId: '1'
  });

  const response = await fetch(
    `http://localhost:3000/api/reportes/exportar?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte_abastecimientos.xlsx';
  a.click();
}
```

### Ejemplo con Axios
```typescript
import axios from 'axios';

async function descargarReporte() {
  const response = await axios.get('/api/reportes/exportar', {
    params: {
      formato: 'excel',
      tipoReporte: 'abastecimientos',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    },
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'reporte.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
}
```

## 🗄️ Vistas SQL

Las vistas SQL están definidas en la migración:
```
prisma/migrations/20251016051600_add_vistas_reporteria/migration.sql
```

### Consultar vistas directamente
```sql
-- Ver todos los abastecimientos
SELECT * FROM vista_reporte_abastecimientos
WHERE fecha_abastecimiento BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY fecha_abastecimiento DESC;

-- Ver consumo por unidad
SELECT * FROM vista_consumo_por_unidad
ORDER BY total_galones_consumidos DESC;

-- Ver estadísticas por grifo
SELECT * FROM vista_estadisticas_por_grifo
ORDER BY total_ingresos DESC;

-- Ver rendimiento
SELECT * FROM vista_rendimiento_detallado
WHERE rendimiento_km_por_galon > 0
ORDER BY rendimiento_km_por_galon DESC;
```

## 🔐 Seguridad

- Todos los endpoints requieren autenticación JWT
- Usa el guard `JwtAuthGuard`
- Los usuarios deben tener un token válido

## 📝 Notas Importantes

1. **Performance**: Las vistas SQL están optimizadas para consultas rápidas
2. **Límites**: No hay límite de registros, pero se recomienda usar filtros de fecha
3. **Memoria**: Los archivos Excel se generan en memoria, ideal para reportes grandes
4. **Formato de fechas**: Usar formato ISO 8601 (YYYY-MM-DD)
5. **Zona horaria**: Las fechas se manejan en UTC

## 🐛 Troubleshooting

### Error: "No se encontraron datos"
- Verificar que los filtros sean correctos
- Confirmar que existen registros en el rango de fechas
- Revisar que las vistas SQL estén creadas

### Error: "Vista no existe"
- Ejecutar la migración: `npx prisma migrate deploy`
- Verificar conexión a la base de datos

### Archivo Excel corrupto
- Verificar que ExcelJS esté instalado: `npm list exceljs`
- Revisar logs del servidor para errores

## 📚 Documentación Adicional

- Swagger UI: `http://localhost:3000/api`
- Documentación de ExcelJS: https://github.com/exceljs/exceljs
- Prisma Views: https://www.prisma.io/docs/concepts/components/prisma-schema/views