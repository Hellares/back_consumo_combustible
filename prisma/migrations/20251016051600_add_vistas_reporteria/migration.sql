-- =====================================================
-- VISTAS PARA REPORTERÍA Y EXPORTACIÓN DE DATOS
-- Fecha: 2025-10-16
-- Descripción: Vistas optimizadas para reportes de abastecimiento
-- =====================================================

-- =====================================================
-- VISTA PRINCIPAL: REPORTE COMPLETO DE ABASTECIMIENTOS
-- =====================================================
CREATE OR REPLACE VIEW vista_reporte_abastecimientos AS
SELECT 
    -- INFORMACIÓN DEL TICKET
    t.id AS ticket_id,
    t.numero_ticket,
    t.fecha AS fecha_abastecimiento,
    t.hora AS hora_abastecimiento,
    
    -- UNIDAD
    u.id AS unidad_id,
    u.placa,
    u.marca,
    u.modelo,
    u.tipo_combustible AS tipo_combustible_unidad,
    u.capacidad_tanque,
    u.operacion,
    
    -- ZONA
    z.id AS zona_id,
    z.nombre AS zona,
    z.codigo AS zona_codigo,
    
    -- CONDUCTOR
    c.id AS conductor_id,
    CONCAT(c.nombres, ' ', c.apellidos) AS conductor_nombre_completo,
    c.dni AS conductor_dni,
    c.codigo_empleado AS conductor_codigo,
    
    -- GRIFO Y UBICACIÓN
    g.id AS grifo_id,
    g.nombre AS grifo_nombre,
    g.codigo AS grifo_codigo,
    g.direccion AS grifo_direccion,
    s.id AS sede_id,
    s.nombre AS sede_nombre,
    s.codigo AS sede_codigo,
    
    -- RUTA (si aplica)
    r.id AS ruta_id,
    r.nombre AS ruta_nombre,
    r.codigo AS ruta_codigo,
    r.origen AS ruta_origen,
    r.destino AS ruta_destino,
    r.distancia_km AS ruta_distancia,
    
    -- TURNO
    tu.id AS turno_id,
    tu.nombre AS turno,
    tu.hora_inicio AS turno_hora_inicio,
    tu.hora_fin AS turno_hora_fin,
    
    -- KILOMETRAJES
    t.kilometraje_actual,
    t.kilometraje_anterior,
    (t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) AS diferencia_kilometraje,
    
    -- PRECINTOS
    t.precinto_nuevo,
    d.precinto_anterior,
    d.precinto_2,
    
    -- COMBUSTIBLE SOLICITADO
    t.cantidad AS cantidad_solicitada,
    t.tipo_combustible,
    
    -- COMBUSTIBLE REAL ABASTECIDO
    d.cantidad_abastecida,
    d.motivo_diferencia,
    (t.cantidad - COALESCE(d.cantidad_abastecida, t.cantidad)) AS diferencia_cantidad,
    
    -- HOROMETROS
    d.horometro_actual,
    d.horometro_anterior,
    (COALESCE(d.horometro_actual, 0) - COALESCE(d.horometro_anterior, 0)) AS diferencia_horometro,
    
    -- COSTOS
    d.costo_por_unidad,
    d.costo_total,
    d.unidad_medida,
    
    -- RENDIMIENTO (km por galón)
    CASE 
        WHEN COALESCE(d.cantidad_abastecida, t.cantidad) > 0 
        THEN (t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) / COALESCE(d.cantidad_abastecida, t.cantidad)
        ELSE 0 
    END AS rendimiento_km_por_galon,
    
    -- DOCUMENTACIÓN
    d.numero_ticket_grifo,
    d.vale_diesel,
    d.numero_factura,
    d.importe_factura,
    d.requerimiento,
    d.numero_salida_almacen,
    
    -- ESTADO Y CONTROL
    e.id AS estado_id,
    e.nombre AS estado_ticket,
    e.descripcion AS estado_descripcion,
    e.color AS estado_color,
    d.estado AS estado_detalle,
    
    -- USUARIOS INVOLUCRADOS
    sol.id AS solicitado_por_id,
    CONCAT(sol.nombres, ' ', sol.apellidos) AS solicitado_por,
    sol.codigo_empleado AS solicitado_por_codigo,
    t.fecha_solicitud,
    
    apr.id AS aprobado_por_id,
    CONCAT(apr.nombres, ' ', apr.apellidos) AS aprobado_por,
    d.fecha_aprobacion,
    
    ctrl.id AS controlador_id,
    CONCAT(ctrl.nombres, ' ', ctrl.apellidos) AS controlador,
    d.observaciones_controlador,
    
    conc.id AS concluido_por_id,
    CONCAT(conc.nombres, ' ', conc.apellidos) AS concluido_por,
    d.fecha_concluido,
    
    -- RECHAZO (si aplica)
    t.motivo_rechazo,
    rech.id AS rechazado_por_id,
    CONCAT(rech.nombres, ' ', rech.apellidos) AS rechazado_por,
    t.fecha_rechazo,
    
    -- OBSERVACIONES
    t.observaciones_solicitud,
    
    -- AUDITORÍA
    t.created_at AS ticket_creado_en,
    t.updated_at AS ticket_actualizado_en,
    d.created_at AS detalle_creado_en,
    d.updated_at AS detalle_actualizado_en

FROM tickets_abastecimiento t
LEFT JOIN detalles_abastecimiento d ON t.id = d.ticket_id
INNER JOIN unidades u ON t.unidad_id = u.id
LEFT JOIN zonas z ON u.zona_operacion_id = z.id
INNER JOIN usuarios c ON t.conductor_id = c.id
INNER JOIN grifos g ON t.grifo_id = g.id
INNER JOIN sedes s ON g.sede_id = s.id
LEFT JOIN rutas r ON t.ruta_id = r.id
LEFT JOIN turnos tu ON t.turno_id = tu.id
INNER JOIN estados_ticket_abastecimiento e ON t.estado_id = e.id
INNER JOIN usuarios sol ON t.solicitado_por = sol.id
LEFT JOIN usuarios apr ON d.aprobado_por = apr.id
LEFT JOIN usuarios ctrl ON d.controlador_id = ctrl.id
LEFT JOIN usuarios conc ON d.concluido_por = conc.id
LEFT JOIN usuarios rech ON t.rechazado_por = rech.id;

-- =====================================================
-- VISTA: CONSUMO Y ESTADÍSTICAS POR UNIDAD
-- =====================================================
CREATE OR REPLACE VIEW vista_consumo_por_unidad AS
SELECT 
    u.id AS unidad_id,
    u.placa,
    u.marca,
    u.modelo,
    u.tipo_combustible,
    u.capacidad_tanque,
    z.nombre AS zona,
    
    -- ESTADÍSTICAS DE ABASTECIMIENTOS
    COUNT(t.id) AS total_abastecimientos,
    COUNT(CASE WHEN e.nombre = 'APROBADO' THEN 1 END) AS abastecimientos_aprobados,
    COUNT(CASE WHEN e.nombre = 'RECHAZADO' THEN 1 END) AS abastecimientos_rechazados,
    
    -- CONSUMO TOTAL
    SUM(COALESCE(d.cantidad_abastecida, t.cantidad)) AS total_galones_consumidos,
    AVG(COALESCE(d.cantidad_abastecida, t.cantidad)) AS promedio_galones_por_abastecimiento,
    
    -- COSTOS
    SUM(d.costo_total) AS costo_total_acumulado,
    AVG(d.costo_por_unidad) AS precio_promedio_galon,
    
    -- KILOMETRAJES
    MAX(t.kilometraje_actual) AS ultimo_kilometraje,
    SUM(t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) AS total_km_recorridos,
    
    -- RENDIMIENTO PROMEDIO
    CASE 
        WHEN SUM(COALESCE(d.cantidad_abastecida, t.cantidad)) > 0 
        THEN SUM(t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) / SUM(COALESCE(d.cantidad_abastecida, t.cantidad))
        ELSE 0 
    END AS rendimiento_promedio_km_por_galon,
    
    -- FECHAS
    MAX(t.fecha) AS ultimo_abastecimiento,
    MIN(t.fecha) AS primer_abastecimiento

FROM unidades u
LEFT JOIN tickets_abastecimiento t ON u.id = t.unidad_id
LEFT JOIN detalles_abastecimiento d ON t.id = d.ticket_id
LEFT JOIN estados_ticket_abastecimiento e ON t.estado_id = e.id
LEFT JOIN zonas z ON u.zona_operacion_id = z.id
GROUP BY u.id, u.placa, u.marca, u.modelo, u.tipo_combustible, u.capacidad_tanque, z.nombre;

-- =====================================================
-- VISTA: ESTADÍSTICAS POR GRIFO
-- =====================================================
CREATE OR REPLACE VIEW vista_estadisticas_por_grifo AS
SELECT 
    g.id AS grifo_id,
    g.nombre AS grifo_nombre,
    g.codigo AS grifo_codigo,
    g.direccion AS grifo_direccion,
    s.nombre AS sede_nombre,
    z.nombre AS zona_nombre,
    
    -- ESTADÍSTICAS
    COUNT(t.id) AS total_abastecimientos,
    COUNT(DISTINCT t.unidad_id) AS total_unidades_atendidas,
    COUNT(DISTINCT t.conductor_id) AS total_conductores_atendidos,
    
    -- VOLUMEN
    SUM(COALESCE(d.cantidad_abastecida, t.cantidad)) AS total_galones_despachados,
    AVG(COALESCE(d.cantidad_abastecida, t.cantidad)) AS promedio_galones_por_ticket,
    
    -- INGRESOS
    SUM(d.costo_total) AS total_ingresos,
    AVG(d.costo_total) AS promedio_ingreso_por_ticket,
    AVG(d.costo_por_unidad) AS precio_promedio_galon,
    
    -- FECHAS
    MAX(t.fecha) AS ultimo_abastecimiento,
    MIN(t.fecha) AS primer_abastecimiento

FROM grifos g
INNER JOIN sedes s ON g.sede_id = s.id
INNER JOIN zonas z ON s.zona_id = z.id
LEFT JOIN tickets_abastecimiento t ON g.id = t.grifo_id
LEFT JOIN detalles_abastecimiento d ON t.id = d.ticket_id
LEFT JOIN estados_ticket_abastecimiento e ON t.estado_id = e.id
WHERE e.nombre IN ('APROBADO', 'CONCLUIDO') OR e.nombre IS NULL
GROUP BY g.id, g.nombre, g.codigo, g.direccion, s.nombre, z.nombre;

-- =====================================================
-- VISTA: RENDIMIENTO DETALLADO POR ABASTECIMIENTO
-- =====================================================
CREATE OR REPLACE VIEW vista_rendimiento_detallado AS
SELECT 
    t.id AS ticket_id,
    t.numero_ticket,
    t.fecha,
    u.placa,
    u.marca,
    u.modelo,
    CONCAT(c.nombres, ' ', c.apellidos) AS conductor,
    
    -- KILOMETRAJES
    t.kilometraje_actual,
    t.kilometraje_anterior,
    (t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) AS km_recorridos,
    
    -- COMBUSTIBLE
    COALESCE(d.cantidad_abastecida, t.cantidad) AS galones_consumidos,
    
    -- RENDIMIENTO
    CASE 
        WHEN COALESCE(d.cantidad_abastecida, t.cantidad) > 0 
        THEN (t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) / COALESCE(d.cantidad_abastecida, t.cantidad)
        ELSE 0 
    END AS rendimiento_km_por_galon,
    
    -- COSTO POR KM
    CASE 
        WHEN (t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0)) > 0 
        THEN d.costo_total / (t.kilometraje_actual - COALESCE(t.kilometraje_anterior, 0))
        ELSE 0 
    END AS costo_por_km,
    
    -- COSTOS
    d.costo_por_unidad,
    d.costo_total,
    
    -- UBICACIÓN
    g.nombre AS grifo,
    r.nombre AS ruta

FROM tickets_abastecimiento t
INNER JOIN unidades u ON t.unidad_id = u.id
INNER JOIN usuarios c ON t.conductor_id = c.id
INNER JOIN grifos g ON t.grifo_id = g.id
LEFT JOIN rutas r ON t.ruta_id = r.id
LEFT JOIN detalles_abastecimiento d ON t.id = d.ticket_id
WHERE t.kilometraje_anterior IS NOT NULL
  AND (t.kilometraje_actual - t.kilometraje_anterior) > 0
  AND t.estado_id IN (SELECT id FROM estados_ticket_abastecimiento WHERE nombre IN ('APROBADO', 'CONCLUIDO'));

-- =====================================================
-- COMENTARIOS EN LAS VISTAS
-- =====================================================
COMMENT ON VIEW vista_reporte_abastecimientos IS 'Vista principal para reportes completos de abastecimiento con toda la información consolidada';
COMMENT ON VIEW vista_consumo_por_unidad IS 'Estadísticas agregadas de consumo y costos por unidad vehicular';
COMMENT ON VIEW vista_estadisticas_por_grifo IS 'Estadísticas de operación y ventas por grifo';
COMMENT ON VIEW vista_rendimiento_detallado IS 'Análisis detallado de rendimiento (km/galón) por cada abastecimiento';