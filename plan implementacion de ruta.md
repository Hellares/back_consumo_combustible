# 📋 PLAN DE IMPLEMENTACIÓN - SISTEMA DE RUTAS E ITINERARIOS

## 🎯 ALCANCE DEL SISTEMA

### Modelos Principales

1. ✅ `Ruta` - Rutas simples (punto A → punto B)
2. ✅ `Itinerario` - Itinerarios complejos con múltiples tramos
3. ✅ `TramoItinerario` - Cada segmento de un itinerario
4. ✅ `UnidadRuta` - Asignaciones excepcionales/una vez de unidad a ruta
5. ✅ `UnidadItinerario` - Asignaciones permanentes/programadas de unidad a itinerario
6. ✅ `EjecucionItinerario` - Viaje en tiempo real
7. ✅ `RegistroTramo` - Ejecución de cada tramo individual
8. ✅ `ItinerarioHistorial` - Auditoría de cambios
9. ✅ `AlertaDesvio` - Alertas de desviaciones
10. ✅ `UbicacionGPS` - Tracking GPS

### Enums Definidos

- `EstadoRuta`: ACTIVA, INACTIVA, EN_REVISION
- `EstadoItinerario`: ACTIVO, INACTIVO, EN_MANTENIMIENTO
- `FrecuenciaItinerario`: DIARIO, SEMANAL, MENSUAL, LUNES_VIERNES, FINES_SEMANA, PERSONALIZADO
- `EstadoEjecucion`: PROGRAMADO, EN_CURSO, COMPLETADO, CANCELADO
- `EstadoTramo`: PENDIENTE, EN_CURSO, COMPLETADO, OMITIDO
- `TipoTramo`: IDA, VUELTA, INTERMEDIO, CIRCULAR
- `TipoDesvio`: TIEMPO, KILOMETRAJE, COMBUSTIBLE, PARADA_NO_REALIZADA, RUTA_ALTERADA
- `SeveridadDesvio`: LEVE, MODERADO, GRAVE, CRITICO

---

## 🏗️ ESTRUCTURA DE MÓDULOS A CREAR

```
src/
├── rutas/
│   ├── rutas.module.ts
│   ├── rutas.controller.ts
│   ├── rutas.service.ts
│   ├── dto/
│   │   ├── create-ruta.dto.ts
│   │   ├── update-ruta.dto.ts
│   │   └── ruta-response.dto.ts
│   └── interfaces/
│       └── ruta.interface.ts
│
├── itinerarios/
│   ├── itinerarios.module.ts
│   ├── itinerarios.controller.ts
│   ├── itinerarios.service.ts
│   ├── dto/
│   │   ├── create-itinerario.dto.ts
│   │   ├── update-itinerario.dto.ts
│   │   ├── itinerario-response.dto.ts
│   │   ├── create-tramo.dto.ts
│   │   └── tramo-response.dto.ts
│   └── validators/
│       └── secuencia-tramos.validator.ts
│
├── asignaciones-rutas/
│   ├── asignaciones-rutas.module.ts
│   ├── asignaciones-rutas.controller.ts
│   ├── asignaciones-rutas.service.ts
│   └── dto/
│       ├── asignar-ruta-excepcional.dto.ts
│       ├── asignar-itinerario-permanente.dto.ts
│       └── autorizacion-ruta.dto.ts
│
├── ejecuciones/
│   ├── ejecuciones.module.ts
│   ├── ejecuciones.controller.ts
│   ├── ejecuciones.service.ts
│   ├── ejecuciones-ws.gateway.ts  // WebSocket para tiempo real
│   ├── dto/
│   │   ├── iniciar-ejecucion.dto.ts
│   │   ├── registrar-tramo.dto.ts
│   │   ├── finalizar-ejecucion.dto.ts
│   │   └── ejecucion-response.dto.ts
│   └── helpers/
│       ├── calculo-desviaciones.helper.ts
│       └── validacion-secuencia.helper.ts
│
├── alertas-desvio/
│   ├── alertas-desvio.module.ts
│   ├── alertas-desvio.controller.ts
│   ├── alertas-desvio.service.ts
│   ├── alertas-desvio-ws.gateway.ts
│   └── dto/
│       ├── alerta-desvio-response.dto.ts
│       └── resolver-alerta.dto.ts
│
├── tracking-gps/
│   ├── tracking-gps.module.ts
│   ├── tracking-gps.controller.ts
│   ├── tracking-gps.service.ts
│   ├── tracking-gps-ws.gateway.ts
│   ├── dto/
│   │   ├── registrar-ubicacion.dto.ts
│   │   └── ubicacion-response.dto.ts
│   └── helpers/
│       ├── calcular-distancia.helper.ts
│       └── detectar-desvios.helper.ts
│
└── reportes-rutas/
    ├── reportes-rutas.module.ts
    ├── reportes-rutas.controller.ts
    ├── reportes-rutas.service.ts
    └── dto/
        └── filtros-reporte-rutas.dto.ts
```

---

## 📅 FASES DE IMPLEMENTACIÓN

### FASE 1: FUNDAMENTOS (Semana 1-2)
**Prioridad: CRÍTICA**

#### 1.1 Módulo de Rutas Básicas

**Objetivo**: CRUD completo de rutas simples

**Endpoints**:
- `POST /api/rutas` - Crear ruta
- `GET /api/rutas` - Listar rutas (paginado, filtros)
- `GET /api/rutas/:id` - Obtener ruta específica
- `PATCH /api/rutas/:id` - Actualizar ruta
- `DELETE /api/rutas/:id` - Eliminar/desactivar ruta
- `GET /api/rutas/codigo/:codigo` - Buscar por código

**Validaciones**:
- Código único
- Distancia > 0
- Tiempo estimado coherente
- Estados válidos

**Características**:
- Soft delete (cambio de estado a INACTIVA)
- Búsqueda por origen/destino
- Validación antes de eliminar (si tiene asignaciones activas)

---

#### 1.2 Módulo de Itinerarios

**Objetivo**: Gestión de itinerarios complejos con múltiples tramos

**Endpoints**:
- `POST /api/itinerarios` - Crear itinerario con tramos
- `GET /api/itinerarios` - Listar itinerarios
- `GET /api/itinerarios/:id` - Detalle completo con tramos
- `PATCH /api/itinerarios/:id` - Actualizar itinerario
- `POST /api/itinerarios/:id/tramos` - Agregar tramo
- `PATCH /api/itinerarios/:id/tramos/:tramoId` - Actualizar tramo
- `DELETE /api/itinerarios/:id/tramos/:tramoId` - Eliminar tramo
- `GET /api/itinerarios/:id/historial` - Ver historial de cambios

**Validaciones CRÍTICAS**:
- **Validación de secuencia**: Ciudad destino del tramo N debe ser ciudad origen del tramo N+1
- Orden de tramos consecutivo (1, 2, 3...)
- No permitir tramos duplicados en mismo itinerario
- Calcular automáticamente distancia y tiempo total
- Validar que las rutas asignadas a tramos existan

**Lógica de Negocio**:
- Al crear itinerario, crear tramos en cascada
- Al modificar tramos, recalcular totales automáticamente
- Al eliminar tramo, reordenar los siguientes
- Guardar historial de cambios en `ItinerarioHistorial`

---

### FASE 2: ASIGNACIONES (Semana 3-4)
**Prioridad: ALTA**

#### 2.1 Asignaciones Excepcionales (UnidadRuta)

**Objetivo**: Asignar unidades a rutas simples para viajes únicos o temporales

**Endpoints**:
- `POST /api/asignaciones-rutas/excepcional` - Asignar ruta excepcional
- `GET /api/asignaciones-rutas/excepcionales` - Listar asignaciones excepcionales
- `GET /api/asignaciones-rutas/excepcionales/:id` - Detalle
- `POST /api/asignaciones-rutas/excepcionales/:id/autorizar` - Autorizar asignación
- `DELETE /api/asignaciones-rutas/excepcionales/:id` - Desasignar

**Flujo de Autorización**:
1. Usuario con permisos crea asignación excepcional
2. Si `requiereAutorizacion: true`, queda pendiente
3. Supervisor/Admin autoriza la asignación
4. Asignación se activa para uso

**Casos de Uso**:
- Emergencias (unidad de reemplazo)
- Carga especial puntual
- Viaje único a ubicación no programada

---

#### 2.2 Asignaciones Permanentes (UnidadItinerario)

**Objetivo**: Asignar unidades a itinerarios con frecuencias programadas

**Endpoints**:
- `POST /api/asignaciones-rutas/permanente` - Asignar itinerario
- `GET /api/asignaciones-rutas/permanentes` - Listar asignaciones
- `GET /api/unidades/:id/itinerario-actual` - Itinerario activo de unidad
- `PATCH /api/asignaciones-rutas/permanentes/:id` - Modificar frecuencia
- `POST /api/asignaciones-rutas/permanentes/:id/desasignar` - Desasignar

**Validaciones**:
- Una unidad no puede tener 2 itinerarios permanentes activos simultáneamente
- Validar que la unidad esté disponible para las fechas/días seleccionados
- Validar que el itinerario esté activo

**Lógica de Frecuencias**:
- `DIARIO`: Se ejecuta todos los días
- `LUNES_VIERNES`: Solo días laborables
- `FINES_SEMANA`: Solo sábado y domingo
- `SEMANAL`: Una vez por semana (especificar día)
- `PERSONALIZADO`: Días específicos (array)

---

### FASE 3: EJECUCIONES EN TIEMPO REAL (Semana 5-6)
**Prioridad: CRÍTICA**

#### 3.1 Gestión de Ejecuciones

**Objetivo**: Controlar el inicio, progreso y finalización de viajes

**Endpoints**:
- `POST /api/ejecuciones/iniciar` - Iniciar ejecución de itinerario
- `GET /api/ejecuciones` - Listar ejecuciones (filtros por estado, fecha, conductor)
- `GET /api/ejecuciones/:id` - Detalle completo con tramos
- `GET /api/ejecuciones/en-curso` - Ejecuciones activas ahora mismo
- `POST /api/ejecuciones/:id/registrar-tramo` - Registrar inicio/fin de tramo
- `POST /api/ejecuciones/:id/finalizar` - Finalizar ejecución
- `POST /api/ejecuciones/:id/cancelar` - Cancelar ejecución
- `GET /api/ejecuciones/:id/desviaciones` - Ver desviaciones detectadas

**Flujo Completo de Ejecución**:

**A. INICIO DE EJECUCIÓN**:
```typescript
// Datos requeridos al iniciar:
{
  itinerarioId: number,
  unidadId: number,
  conductorId: number,
  turnoId?: number,
  fechaProgramada: Date,
  kilometrajeInicial: number,
  horometroInicial?: number,
  observaciones?: string
}
```

- Validar que unidad tenga itinerario asignado
- Validar que conductor esté asignado a la unidad
- Crear `EjecucionItinerario` con estado `PROGRAMADO`
- Cuando inicia realmente, cambiar a `EN_CURSO` y registrar `fechaInicio`
- Crear `RegistroTramo` para cada tramo del itinerario con estado `PENDIENTE`

**B. DURANTE LA EJECUCIÓN**:
- Conductor/sistema registra inicio de cada tramo
- Sistema calcula desviaciones en tiempo real (tiempo, km, paradas)
- Generar alertas si hay desviaciones significativas
- GPS envía ubicaciones periódicas
- Actualizar estado de tramos: `PENDIENTE` → `EN_CURSO` → `COMPLETADO`

**C. FINALIZACIÓN**:
```typescript
{
  kilometrajeFinal: number,
  horometroFinal?: number,
  combustibleTotal?: number,
  observaciones?: string
}
```

- Validar que todos los tramos obligatorios estén completados
- Calcular totales (km recorridos, combustible, tiempo real)
- Cambiar estado a `COMPLETADO`
- Generar resumen de desviaciones
- Opcionalmente generar reporte automático

---

#### 3.2 Sistema de Detección de Desviaciones

**Objetivo**: Detectar automáticamente cuando la ejecución se desvía del plan

**Tipos de Desviaciones**:

**TIEMPO**:
- Llegada tarde/temprano a puntos de control
- Exceso en tiempo de parada
- Retraso acumulado en itinerario

**KILOMETRAJE**:
- Diferencia significativa entre km programado vs real
- Detección de ruta alterada

**COMBUSTIBLE**:
- Consumo anormal (muy alto o muy bajo)
- Posible fuga o problema mecánico

**PARADA_NO_REALIZADA**:
- Omisión de parada obligatoria
- No registrar punto de control

**RUTA_ALTERADA**:
- GPS detecta que no sigue el trazado esperado
- Cambio de ruta sin autorización

**Lógica de Severidad**:
- `LEVE`: Desviación dentro de tolerancia amplia (notificar pero no alertar)
- `MODERADO`: Supera tolerancia estándar (alertar a supervisor)
- `GRAVE`: Desviación importante (notificación inmediata + registro)
- `CRITICO`: Situación de emergencia (alerta máxima, posible auxilio)

**Endpoints**:
- `GET /api/alertas-desvio` - Listar alertas
- `GET /api/alertas-desvio/:id` - Detalle de alerta
- `POST /api/alertas-desvio/:id/resolver` - Resolver alerta
- `GET /api/alertas-desvio/activas` - Alertas pendientes de atención

---

### FASE 4: TRACKING GPS Y TIEMPO REAL (Semana 7-8)
**Prioridad: ALTA**

#### 4.1 Registro de Ubicaciones GPS

**Objetivo**: Almacenar y procesar ubicaciones GPS en tiempo real

**Endpoints**:
- `POST /api/tracking-gps/ubicacion` - Registrar nueva ubicación
- `GET /api/tracking-gps/unidad/:id` - Últimas ubicaciones de unidad
- `GET /api/tracking-gps/ejecucion/:id` - Recorrido completo de ejecución
- `GET /api/tracking-gps/unidad/:id/ultima` - Última ubicación conocida
- `GET /api/tracking-gps/en-ruta` - Todas las unidades en movimiento ahora

**Datos de Ubicación**:
```typescript
{
  unidadId: number,
  ejecucionId?: number,
  registroTramoId?: number,
  latitud: number,
  longitud: number,
  altitud?: number,
  velocidad?: number,
  rumbo?: number,
  kilometraje?: number,
  precision?: number,
  proveedorGPS?: string,
  bateria?: number,
  senalGPS?: 'EXCELENTE' | 'BUENA' | 'REGULAR' | 'MALA'
}
```

**Optimizaciones**:
- Guardar ubicaciones cada 30-60 segundos (configurable)
- Implementar bulk insert para múltiples ubicaciones
- Limpiar ubicaciones antiguas automáticamente (ej: mayores a 6 meses)

---

#### 4.2 WebSocket para Tiempo Real

**Objetivo**: Actualizar dashboards en tiempo real sin polling

**Canales WebSocket**:

**Canal: `ejecuciones`**
- `ejecucion:iniciada` - Nueva ejecución comenzó
- `ejecucion:tramo-iniciado` - Tramo nuevo en curso
- `ejecucion:tramo-completado` - Tramo finalizado
- `ejecucion:finalizada` - Ejecución completada
- `ejecucion:cancelada` - Ejecución cancelada

**Canal: `alertas`**
- `alerta:nueva` - Nueva alerta de desviación
- `alerta:actualizada` - Cambio de severidad
- `alerta:resuelta` - Alerta resuelta

**Canal: `gps`**
- `gps:ubicacion` - Nueva ubicación GPS
- `gps:desconexion` - Dispositivo GPS sin señal
- `gps:reconexion` - GPS vuelve a conectar

**Implementación**:
```typescript
// ejecuciones-ws.gateway.ts
@WebSocketGateway({ namespace: '/ejecuciones' })
export class EjecucionesWsGateway {
  @WebSocketServer()
  server: Server;
  
  emitEjecucionIniciada(ejecucion: any) {
    this.server.emit('ejecucion:iniciada', ejecucion);
  }
}
```

---

### FASE 5: REPORTES Y ANALÍTICAS (Semana 9)
**Prioridad: MEDIA**

#### 5.1 Reportes de Rutas e Itinerarios

**Endpoints**:
- `GET /api/reportes-rutas/resumen-ejecuciones` - Resumen general
- `GET /api/reportes-rutas/eficiencia-rutas` - Análisis de eficiencia por ruta
- `GET /api/reportes-rutas/cumplimiento-itinerarios` - % de cumplimiento
- `GET /api/reportes-rutas/desviaciones` - Reporte de desviaciones
- `GET /api/reportes-rutas/consumo-por-ruta` - Consumo de combustible por ruta
- `GET /api/reportes-rutas/conductor-performance` - Desempeño de conductores
- `GET /api/reportes-rutas/exportar` - Exportar en Excel/CSV/PDF

**Métricas Clave**:
- **Eficiencia de rutas**: Tiempo real vs estimado
- **Consumo de combustible**: Por ruta, por itinerario, por unidad
- **Cumplimiento de itinerarios**: % de viajes completados exitosamente
- **Desviaciones frecuentes**: Rutas/tramos con más problemas
- **Rendimiento de conductores**: Puntualidad, consumo, desviaciones

---

### FASE 6: INTEGRACIONES Y OPTIMIZACIONES (Semana 10-11)
**Prioridad: BAJA**

#### 6.1 Integración con otros módulos

**Abastecimientos**:
- Crear ticket de abastecimiento automático cuando ejecución detecta nivel bajo
- Validar que unidad tenga combustible suficiente antes de iniciar ejecución

**Mantenimientos**:
- Alertar si unidad tiene mantenimiento pendiente y se intenta asignar a ruta
- Bloquear asignación si unidad está en mantenimiento

**Inspecciones**:
- Requerir inspección previa para ciertos tipos de itinerarios
- Validar inspección vigente antes de iniciar ejecución

#### 6.2 Optimizaciones de Performance

**Índices de base de datos**: Ya creados en schema

**Caché**:
- Cachear itinerarios activos (Redis)
- Cachear última ubicación de unidades

**Bulk operations**:
- Inserción masiva de ubicaciones GPS
- Procesamiento por lotes de desviaciones

---

## 🔐 PERMISOS Y GUARDS

### Permisos Necesarios

```typescript
export enum PermisosRutas {
  // Rutas
  RUTAS_CREAR = 'rutas.crear',
  RUTAS_LEER = 'rutas.leer',
  RUTAS_ACTUALIZAR = 'rutas.actualizar',
  RUTAS_ELIMINAR = 'rutas.eliminar',
  
  // Itinerarios
  ITINERARIOS_CREAR = 'itinerarios.crear',
  ITINERARIOS_LEER = 'itinerarios.leer',
  ITINERARIOS_ACTUALIZAR = 'itinerarios.actualizar',
  ITINERARIOS_ELIMINAR = 'itinerarios.eliminar',
  
  // Asignaciones
  ASIGNACIONES_CREAR = 'asignaciones.crear',
  ASIGNACIONES_AUTORIZAR = 'asignaciones.autorizar',
  ASIGNACIONES_LEER = 'asignaciones.leer',
  ASIGNACIONES_MODIFICAR = 'asignaciones.modificar',
  
  // Ejecuciones
  EJECUCIONES_INICIAR = 'ejecuciones.iniciar',
  EJECUCIONES_REGISTRAR = 'ejecuciones.registrar',
  EJECUCIONES_FINALIZAR = 'ejecuciones.finalizar',
  EJECUCIONES_CANCELAR = 'ejecuciones.cancelar',
  EJECUCIONES_SUPERVISAR = 'ejecuciones.supervisar',
  
  // Alertas
  ALERTAS_VER = 'alertas.ver',
  ALERTAS_RESOLVER = 'alertas.resolver',
  
  // Tracking
  TRACKING_VER = 'tracking.ver',
  TRACKING_EXPORTAR = 'tracking.exportar',
  
  // Reportes
  REPORTES_VER = 'reportes.ver',
  REPORTES_EXPORTAR = 'reportes.exportar',
}
```

---

## 🧪 TESTING

### Tests Unitarios (Jest)
- Servicios: Lógica de negocio de cada módulo
- Helpers: Cálculo de distancias, detección de desviaciones
- Validators: Validación de secuencia de tramos

### Tests de Integración
- Flujo completo: Crear itinerario → Asignar unidad → Iniciar ejecución → Finalizar
- WebSocket: Emisión y recepción de eventos
- GPS: Procesamiento de ubicaciones y detección de desviaciones

### Tests E2E
- Casos de uso completos desde API REST

---

## 📊 PRIORIDADES SUGERIDAS

### 🔴 CRÍTICO (Implementar primero)
1. Módulo de Rutas (CRUD básico)
2. Módulo de Itinerarios con validación de secuencia
3. Asignaciones permanentes (UnidadItinerario)
4. Ejecuciones: Iniciar, registrar tramos, finalizar

### 🟡 IMPORTANTE (Implementar segundo)
5. Asignaciones excepcionales con autorización
6. Sistema de detección de desviaciones
7. Registro de ubicaciones GPS
8. WebSocket para tiempo real

### 🟢 DESEABLE (Implementar después)
9. Reportes y analíticas
10. Integraciones con otros módulos
11. Optimizaciones de performance

---

## 🎯 VALIDACIONES CLAVE A IMPLEMENTAR

### Validación de Secuencia de Tramos

```typescript
// Ejemplo de lógica de validación
function validarSecuenciaTramos(tramos: TramoDto[]): boolean {
  for (let i = 0; i < tramos.length - 1; i++) {
    const tramoActual = tramos[i];
    const tramoSiguiente = tramos[i + 1];
    
    if (tramoActual.ciudadDestino !== tramoSiguiente.ciudadOrigen) {
      throw new BadRequestException(
        `Secuencia inválida: El destino del tramo ${i+1} (${tramoActual.ciudadDestino}) 
        debe coincidir con el origen del tramo ${i+2} (${tramoSiguiente.ciudadOrigen})`
      );
    }
  }
  return true;
}
```

### Detección de Desviaciones

```typescript
function calcularDesviacion(tramoEsperado, tramoReal): Desviacion {
  const desviacionTiempo = tramoReal.duracion - tramoEsperado.tiempoEstimado;
  const desviacionKm = tramoReal.kilometraje - tramoEsperado.distanciaKm;
  
  // Si supera tolerancia, crear alerta
  if (Math.abs(desviacionTiempo) > tramoEsperado.toleranciaTiempo) {
    return crearAlertaDesvio('TIEMPO', calcularSeveridad(desviacionTiempo));
  }
  
  if (Math.abs(desviacionKm) > tramoEsperado.toleranciaKm) {
    return crearAlertaDesvio('KILOMETRAJE', calcularSeveridad(desviacionKm));
  }
}
```

---

## 📝 NOTAS FINALES

### Fortalezas del Schema

1. **Schema bien diseñado** - Cubre todos los casos de uso importantes
2. **Relaciones bien estructuradas** - Cascadas configuradas correctamente
3. **Índices optimizados** - Ya tienes los índices necesarios para queries frecuentes
4. **Enums bien definidos** - Cubren todos los estados necesarios

### Sugerencias Adicionales

- Considera agregar campo `version` a Itinerario para versionado optimista
- Implementar soft delete en Rutas e Itinerarios (ya tienes campo `activo`)
- Agregar campo `esEmergencia` en UnidadRuta para priorizar visualización
- Considerar agregar `prioridad` en Itinerario para casos urgentes

---

## 📞 CONTACTO Y SOPORTE

Para dudas o consultas sobre la implementación, contactar al equipo de desarrollo.

**Versión del documento**: 1.0  
**Fecha**: 22 de Octubre, 2025  
**Autor**: Equipo de Desarrollo Backend