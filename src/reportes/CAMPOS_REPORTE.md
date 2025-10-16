# Campos Completos del Reporte de Abastecimientos

## 📊 Total de Campos: 73

Este documento lista TODOS los campos incluidos en el reporte de abastecimientos exportado.

---

## 🎫 INFORMACIÓN DEL TICKET (4 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `ticket_id` | ID único del ticket | Integer |
| `numero_ticket` | Número de ticket generado (TK-YYYY-MM-XXXXXX) | String |
| `fecha_abastecimiento` | Fecha del abastecimiento | Date |
| `hora_abastecimiento` | Hora del abastecimiento | Time |

---

## 🚗 UNIDAD (7 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `unidad_id` | ID de la unidad | Integer |
| `placa` | Placa del vehículo | String |
| `marca` | Marca del vehículo | String |
| `modelo` | Modelo del vehículo | String |
| `tipo_combustible_unidad` | Tipo de combustible que usa la unidad | String |
| `capacidad_tanque` | Capacidad del tanque en galones | Decimal |
| `operacion` | Tipo de operación de la unidad | String |

---

## 🗺️ ZONA (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `zona_id` | ID de la zona | Integer |
| `zona` | Nombre de la zona | String |
| `zona_codigo` | Código de la zona | String |

---

## 👤 CONDUCTOR (4 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `conductor_id` | ID del conductor | Integer |
| `conductor_nombre_completo` | Nombre completo del conductor | String |
| `conductor_dni` | DNI del conductor | String |
| `conductor_codigo` | Código de empleado del conductor | String |

---

## ⛽ GRIFO Y UBICACIÓN (7 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `grifo_id` | ID del grifo | Integer |
| `grifo_nombre` | Nombre del grifo | String |
| `grifo_codigo` | Código del grifo | String |
| `grifo_direccion` | Dirección del grifo | String |
| `sede_id` | ID de la sede | Integer |
| `sede_nombre` | Nombre de la sede | String |
| `sede_codigo` | Código de la sede | String |

---

## 🛣️ RUTA (6 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `ruta_id` | ID de la ruta | Integer |
| `ruta_nombre` | Nombre de la ruta | String |
| `ruta_codigo` | Código de la ruta | String |
| `ruta_origen` | Ciudad de origen | String |
| `ruta_destino` | Ciudad de destino | String |
| `ruta_distancia` | Distancia de la ruta en km | Decimal |

---

## ⏰ TURNO (4 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `turno_id` | ID del turno | Integer |
| `turno` | Nombre del turno | String |
| `turno_hora_inicio` | Hora de inicio del turno | Time |
| `turno_hora_fin` | Hora de fin del turno | Time |

---

## 📏 KILOMETRAJES (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `kilometraje_actual` | Kilometraje actual de la unidad | Decimal |
| `kilometraje_anterior` | Kilometraje del abastecimiento anterior | Decimal |
| `diferencia_kilometraje` | Km recorridos desde el último abastecimiento | Decimal (calculado) |

---

## 🔒 PRECINTOS (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `precinto_nuevo` | Número del precinto nuevo instalado | String |
| `precinto_anterior` | Número del precinto anterior | String |
| `precinto_2` | Número del segundo precinto (si aplica) | String |

---

## ⛽ COMBUSTIBLE SOLICITADO (2 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `cantidad_solicitada` | Cantidad de galones solicitados | Decimal |
| `tipo_combustible` | Tipo de combustible solicitado | String |

---

## ✅ COMBUSTIBLE ABASTECIDO (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `cantidad_abastecida` | Cantidad real abastecida | Decimal |
| `motivo_diferencia` | Motivo si difiere de lo solicitado | String |
| `diferencia_cantidad` | Diferencia entre solicitado y abastecido | Decimal (calculado) |

---

## ⏱️ HORÓMETROS (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `horometro_actual` | Horómetro actual | Decimal |
| `horometro_anterior` | Horómetro anterior | Decimal |
| `diferencia_horometro` | Diferencia de horómetro | Decimal (calculado) |

---

## 💰 COSTOS (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `costo_por_unidad` | Precio por galón | Decimal |
| `costo_total` | Costo total del abastecimiento | Decimal |
| `unidad_medida` | Unidad de medida (GALONES) | String |

---

## 📈 RENDIMIENTO (1 campo)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `rendimiento_km_por_galon` | Kilómetros por galón | Decimal (calculado) |

---

## 📄 DOCUMENTACIÓN (6 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `numero_ticket_grifo` | Número de ticket del grifo | String |
| `vale_diesel` | Número de vale diesel | String |
| `numero_factura` | Número de factura | String |
| `importe_factura` | Importe de la factura | Decimal |
| `requerimiento` | Número de requerimiento | String |
| `numero_salida_almacen` | Número de salida de almacén | String |

---

## 🚦 ESTADO Y CONTROL (5 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `estado_id` | ID del estado del ticket | Integer |
| `estado_ticket` | Estado del ticket (SOLICITADO, APROBADO, etc.) | String |
| `estado_descripcion` | Descripción del estado | String |
| `estado_color` | Color hexadecimal del estado | String |
| `estado_detalle` | Estado del detalle (EN_PROGRESO, CONCLUIDO) | String |

---

## 👥 USUARIO SOLICITANTE (4 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `solicitado_por_id` | ID del usuario que solicitó | Integer |
| `solicitado_por` | Nombre completo del solicitante | String |
| `solicitado_por_codigo` | Código de empleado del solicitante | String |
| `fecha_solicitud` | Fecha y hora de la solicitud | DateTime |

---

## ✅ USUARIO APROBADOR (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `aprobado_por_id` | ID del usuario que aprobó | Integer |
| `aprobado_por` | Nombre completo del aprobador | String |
| `fecha_aprobacion` | Fecha y hora de aprobación | DateTime |

---

## 🔍 USUARIO CONTROLADOR (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `controlador_id` | ID del controlador | Integer |
| `controlador` | Nombre completo del controlador | String |
| `observaciones_controlador` | Observaciones del controlador | String |

---

## ✔️ USUARIO QUE CONCLUYÓ (3 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `concluido_por_id` | ID del usuario que concluyó | Integer |
| `concluido_por` | Nombre completo | String |
| `fecha_concluido` | Fecha y hora de conclusión | DateTime |

---

## ❌ RECHAZO (4 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `motivo_rechazo` | Motivo del rechazo (si aplica) | String |
| `rechazado_por_id` | ID del usuario que rechazó | Integer |
| `rechazado_por` | Nombre completo | String |
| `fecha_rechazo` | Fecha y hora del rechazo | DateTime |

---

## 📝 OBSERVACIONES (1 campo)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `observaciones_solicitud` | Observaciones de la solicitud | String |

---

## 🕐 AUDITORÍA (4 campos)

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `ticket_creado_en` | Fecha de creación del ticket | DateTime |
| `ticket_actualizado_en` | Última actualización del ticket | DateTime |
| `detalle_creado_en` | Fecha de creación del detalle | DateTime |
| `detalle_actualizado_en` | Última actualización del detalle | DateTime |

---

## 📊 Resumen por Categorías

| Categoría | Cantidad de Campos |
|-----------|-------------------|
| Información del Ticket | 4 |
| Unidad | 7 |
| Zona | 3 |
| Conductor | 4 |
| Grifo y Ubicación | 7 |
| Ruta | 6 |
| Turno | 4 |
| Kilometrajes | 3 |
| Precintos | 3 |
| Combustible Solicitado | 2 |
| Combustible Abastecido | 3 |
| Horómetros | 3 |
| Costos | 3 |
| Rendimiento | 1 |
| Documentación | 6 |
| Estado y Control | 5 |
| Usuario Solicitante | 4 |
| Usuario Aprobador | 3 |
| Usuario Controlador | 3 |
| Usuario que Concluyó | 3 |
| Rechazo | 4 |
| Observaciones | 1 |
| Auditoría | 4 |
| **TOTAL** | **73** |

---

## 🎨 Formato en Excel

### Encabezados
- **Color de fondo**: Azul (#0070C0)
- **Color de texto**: Blanco
- **Fuente**: Negrita
- **Altura**: 30px
- **Alineación**: Centro con ajuste de texto

### Datos Numéricos
- **Kilometrajes**: `#,##0.00` (ej: 125,420.50)
- **Galones**: `#,##0.000` (ej: 48.500)
- **Costos**: `S/ #,##0.00` (ej: S/ 1,250.00)
- **Precio por galón**: `S/ #,##0.0000` (ej: S/ 15.5000)

### Fechas
- **Fecha simple**: `dd/mm/yyyy` (ej: 15/01/2024)
- **Fecha y hora**: `dd/mm/yyyy hh:mm:ss` (ej: 15/01/2024 14:30:00)

### Características
- ✅ Filtros automáticos en todas las columnas
- ✅ Primera fila congelada para scroll
- ✅ Anchos de columna optimizados
- ✅ Hoja adicional con información del reporte

---

## 💡 Campos Calculados

Estos campos se calculan automáticamente en la vista SQL:

1. **`diferencia_kilometraje`**: `kilometraje_actual - kilometraje_anterior`
2. **`diferencia_cantidad`**: `cantidad_solicitada - cantidad_abastecida`
3. **`diferencia_horometro`**: `horometro_actual - horometro_anterior`
4. **`rendimiento_km_por_galon`**: `diferencia_kilometraje / cantidad_abastecida`

---

## 🔍 Campos Opcionales (pueden ser NULL)

Los siguientes campos pueden estar vacíos dependiendo del estado del ticket:

- Todos los campos de **Ruta** (si no se asignó ruta)
- Todos los campos de **Turno** (si no se asignó turno)
- `kilometraje_anterior` (primer abastecimiento)
- `cantidad_abastecida` (si el ticket no está aprobado)
- `motivo_diferencia` (si no hay diferencia)
- Todos los campos de **Detalle** (si el ticket no está aprobado)
- Todos los campos de **Rechazo** (si el ticket no fue rechazado)
- Campos de **Controlador** (si no se asignó)
- Campos de **Concluido Por** (si no está concluido)

---

## 📥 Ejemplo de Registro Completo

```json
{
  "ticket_id": 1,
  "numero_ticket": "TK-2024-01-000001",
  "fecha_abastecimiento": "2024-01-15",
  "hora_abastecimiento": "14:30:00",
  "unidad_id": 5,
  "placa": "ABC-123",
  "marca": "VOLVO",
  "modelo": "FH-460",
  "tipo_combustible_unidad": "DIESEL",
  "capacidad_tanque": 300.00,
  "operacion": "CARGA PESADA",
  "zona_id": 1,
  "zona": "NORTE",
  "zona_codigo": "ZN-01",
  "conductor_id": 3,
  "conductor_nombre_completo": "Juan Carlos García López",
  "conductor_dni": "12345678",
  "conductor_codigo": "EMP001",
  "grifo_id": 2,
  "grifo_nombre": "PRIMAX NORTE",
  "grifo_codigo": "GRF-001",
  "grifo_direccion": "Av. Norte 123",
  "sede_id": 1,
  "sede_nombre": "SEDE CENTRAL",
  "sede_codigo": "SD-01",
  "ruta_id": 1,
  "ruta_nombre": "LIMA - AREQUIPA",
  "ruta_codigo": "RT-001",
  "ruta_origen": "Lima",
  "ruta_destino": "Arequipa",
  "ruta_distancia": 1025.50,
  "turno_id": 1,
  "turno": "MAÑANA",
  "turno_hora_inicio": "06:00:00",
  "turno_hora_fin": "14:00:00",
  "kilometraje_actual": 125420.50,
  "kilometraje_anterior": 125380.25,
  "diferencia_kilometraje": 40.25,
  "precinto_nuevo": "PR-2024-001234",
  "precinto_anterior": "PR-2024-001233",
  "precinto_2": null,
  "cantidad_solicitada": 50.000,
  "tipo_combustible": "DIESEL",
  "cantidad_abastecida": 48.500,
  "motivo_diferencia": "Tanque no tenía capacidad completa",
  "diferencia_cantidad": 1.500,
  "horometro_actual": 12345.50,
  "horometro_anterior": 12100.00,
  "diferencia_horometro": 245.50,
  "costo_por_unidad": 15.5000,
  "costo_total": 751.75,
  "unidad_medida": "GALONES",
  "rendimiento_km_por_galon": 0.83,
  "numero_ticket_grifo": "TG-2024-0456",
  "vale_diesel": "VD-789",
  "numero_factura": "F001-00123",
  "importe_factura": 751.75,
  "requerimiento": "REQ-2024-456",
  "numero_salida_almacen": "SA-2024-789",
  "estado_id": 2,
  "estado_ticket": "APROBADO",
  "estado_descripcion": "Ticket aprobado para abastecimiento",
  "estado_color": "#28a745",
  "estado_detalle": "CONCLUIDO",
  "solicitado_por_id": 3,
  "solicitado_por": "Juan Carlos García López",
  "solicitado_por_codigo": "EMP001",
  "fecha_solicitud": "2024-01-15T14:30:00.000Z",
  "aprobado_por_id": 2,
  "aprobado_por": "María Rodríguez",
  "fecha_aprobacion": "2024-01-15T14:35:00.000Z",
  "controlador_id": 4,
  "controlador": "Pedro Sánchez",
  "observaciones_controlador": "Se verificó el precinto correctamente",
  "concluido_por_id": 4,
  "concluido_por": "Pedro Sánchez",
  "fecha_concluido": "2024-01-15T16:00:00.000Z",
  "motivo_rechazo": null,
  "rechazado_por_id": null,
  "rechazado_por": null,
  "fecha_rechazo": null,
  "observaciones_solicitud": "Abastecimiento para ruta larga",
  "ticket_creado_en": "2024-01-15T14:30:00.000Z",
  "ticket_actualizado_en": "2024-01-15T16:00:00.000Z",
  "detalle_creado_en": "2024-01-15T14:35:00.000Z",
  "detalle_actualizado_en": "2024-01-15T16:00:00.000Z"
}
```

---

## 🎯 Uso de los Campos

### Para Análisis Financiero
- `costo_total`, `costo_por_unidad`, `importe_factura`
- `numero_factura`, `requerimiento`, `numero_salida_almacen`

### Para Análisis de Rendimiento
- `rendimiento_km_por_galon`
- `diferencia_kilometraje`, `cantidad_abastecida`
- `diferencia_horometro`

### Para Control Operativo
- `estado_ticket`, `estado_detalle`
- `precinto_nuevo`, `precinto_anterior`
- `controlador`, `observaciones_controlador`

### Para Auditoría
- Todos los campos de usuarios (`solicitado_por`, `aprobado_por`, etc.)
- Todos los campos de fechas de auditoría
- `motivo_rechazo`, `observaciones_solicitud`

### Para Reportes Gerenciales
- `zona`, `sede_nombre`, `grifo_nombre`
- `placa`, `conductor_nombre_completo`
- `ruta_nombre`, `ruta_origen`, `ruta_destino`
- Todos los campos de costos y cantidades