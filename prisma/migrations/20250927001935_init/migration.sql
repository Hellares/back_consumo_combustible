-- CreateTable
CREATE TABLE "public"."zonas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(10),
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zonas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sedes" (
    "id" SERIAL NOT NULL,
    "zona_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(10),
    "direccion" TEXT,
    "telefono" VARCHAR(20),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grifos" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(10),
    "direccion" TEXT,
    "telefono" VARCHAR(20),
    "horario_apertura" TIME,
    "horario_cierre" TIME,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grifos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "permisos" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "telefono" VARCHAR(20),
    "dni" VARCHAR(15),
    "codigo_empleado" VARCHAR(20),
    "password_hash" TEXT,
    "fecha_ingreso" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios_roles" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "fecha_asignacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revocacion" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignado_por" INTEGER,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."licencias_conducir" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "numero_licencia" VARCHAR(50) NOT NULL,
    "categoria" VARCHAR(20) NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "fecha_expiracion" DATE NOT NULL,
    "entidad_emisora" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licencias_conducir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unidades" (
    "id" SERIAL NOT NULL,
    "placa" VARCHAR(20) NOT NULL,
    "conductor_operador_id" INTEGER,
    "operacion" VARCHAR(100),
    "marca" VARCHAR(50) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "anio" INTEGER,
    "nro_vin" VARCHAR(50),
    "nro_motor" VARCHAR(50),
    "zona_operacion_id" INTEGER,
    "capacidad_tanque" DECIMAL(8,2),
    "tipo_combustible" VARCHAR(30) NOT NULL DEFAULT 'DIESEL',
    "odometro_inicial" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "horometro_inicial" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fecha_adquisicion" DATE,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'OPERATIVO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estados_unidad" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "color" VARCHAR(7),
    "requiere_inspeccion" BOOLEAN NOT NULL DEFAULT false,
    "permite_operacion" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estados_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."historial_estados_unidad" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "estado_anterior_id" INTEGER,
    "estado_nuevo_id" INTEGER NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kilometraje_momento" DECIMAL(10,2),
    "horometro_momento" DECIMAL(10,2),
    "motivo_cambio" TEXT NOT NULL,
    "observaciones" TEXT,
    "reportado_por" INTEGER NOT NULL,
    "autorizado_por" INTEGER,
    "ubicacion" VARCHAR(200),
    "costo_estimado" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipos_falla" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "prioridad_default" VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    "categoria" VARCHAR(30),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_falla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fallas_unidad" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "tipo_falla_id" INTEGER NOT NULL,
    "fecha_deteccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kilometraje_deteccion" DECIMAL(10,2),
    "horometro_deteccion" DECIMAL(10,2),
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion_detallada" TEXT NOT NULL,
    "sintomas" TEXT,
    "causa_probable" TEXT,
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    "impacto_operacion" VARCHAR(30) NOT NULL DEFAULT 'NINGUNO',
    "detectado_por" INTEGER NOT NULL,
    "verificado_por" INTEGER,
    "fecha_verificacion" TIMESTAMP(3),
    "estado_falla" VARCHAR(30) NOT NULL DEFAULT 'REPORTADA',
    "solucion_aplicada" TEXT,
    "repuestos_utilizados" TEXT,
    "costo_reparacion" DECIMAL(12,2),
    "fecha_reparacion" TIMESTAMP(3),
    "reparado_por" INTEGER,
    "tiempo_parada_horas" DECIMAL(8,2),
    "requiere_seguimiento" BOOLEAN NOT NULL DEFAULT false,
    "fecha_proximo_control" DATE,
    "fotos_urls" TEXT[],
    "documentos_urls" TEXT[],
    "observaciones_cierre" TEXT,
    "cerrado_por" INTEGER,
    "fecha_cierre" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fallas_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inspecciones_unidad" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "tipo_inspeccion" VARCHAR(30) NOT NULL,
    "fecha_inspeccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kilometraje" DECIMAL(10,2),
    "horometro" DECIMAL(10,2),
    "inspector_id" INTEGER NOT NULL,
    "conductor_entrante_id" INTEGER,
    "conductor_saliente_id" INTEGER,
    "nivel_combustible" VARCHAR(20),
    "nivel_aceite" VARCHAR(20),
    "estado_neumaticos" VARCHAR(30),
    "estado_frenos" VARCHAR(30),
    "luces_funcionamiento" VARCHAR(30),
    "limpieza_general" VARCHAR(20),
    "documentos_vehiculo" VARCHAR(20),
    "extintor_estado" VARCHAR(20),
    "botiquin_estado" VARCHAR(20),
    "triangulos_seguridad" VARCHAR(20),
    "chaleco_reflectivo" VARCHAR(20),
    "observaciones_generales" TEXT,
    "anomalias_detectadas" TEXT,
    "recomendaciones" TEXT,
    "resultado" VARCHAR(20) NOT NULL DEFAULT 'APROBADA',
    "motivo_rechazo" TEXT,
    "requiere_atencion_inmediata" BOOLEAN NOT NULL DEFAULT false,
    "fotos_inspeccion_urls" TEXT[],
    "firma_inspector" TEXT,
    "firma_conductor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspecciones_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mantenimientos_unidad" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "tipo_mantenimiento" VARCHAR(30) NOT NULL,
    "categoria" VARCHAR(50),
    "fecha_programada" DATE,
    "kilometraje_programado" DECIMAL(10,2),
    "horometro_programado" DECIMAL(10,2),
    "fecha_realizada" TIMESTAMP(3),
    "kilometraje_realizado" DECIMAL(10,2),
    "horometro_realizado" DECIMAL(10,2),
    "descripcion_trabajo" TEXT NOT NULL,
    "repuestos_utilizados" TEXT,
    "costo_total" DECIMAL(12,2),
    "proveedor_servicio" VARCHAR(200),
    "numero_factura" VARCHAR(50),
    "realizado_por" INTEGER,
    "taller_externo" VARCHAR(200),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    "observaciones" TEXT,
    "proximo_km" DECIMAL(10,2),
    "proximo_horas" DECIMAL(10,2),
    "proxima_fecha" DATE,
    "documentos_urls" TEXT[],
    "fotos_urls" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mantenimientos_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unidades_conductores_historial" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "conductor_id" INTEGER NOT NULL,
    "fecha_asignacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desasignacion" DATE,
    "motivo_cambio" TEXT,
    "asignado_por" INTEGER,
    "inspeccion_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_conductores_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rutas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(20),
    "descripcion" TEXT,
    "origen" VARCHAR(200),
    "destino" VARCHAR(200),
    "distancia_km" DECIMAL(8,2),
    "tiempo_estimado_minutos" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unidades_rutas" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "ruta_id" INTEGER NOT NULL,
    "fecha_asignacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desasignacion" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "asignado_por" INTEGER,

    CONSTRAINT "unidades_rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."turnos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estados_abastecimiento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "color" VARCHAR(7),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estados_abastecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."abastecimientos" (
    "id" SERIAL NOT NULL,
    "numero_abastecimiento" VARCHAR(50) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turno_id" INTEGER,
    "unidad_id" INTEGER NOT NULL,
    "conductor_id" INTEGER NOT NULL,
    "controlador_id" INTEGER,
    "grifo_id" INTEGER NOT NULL,
    "ruta_id" INTEGER,
    "kilometraje_actual" DECIMAL(10,2) NOT NULL,
    "kilometraje_anterior" DECIMAL(10,2),
    "horometro_actual" DECIMAL(10,2),
    "horometro_anterior" DECIMAL(10,2),
    "precinto_anterior" VARCHAR(50),
    "precinto_nuevo" VARCHAR(50) NOT NULL,
    "precinto_2" VARCHAR(50),
    "tipo_combustible" VARCHAR(50) NOT NULL DEFAULT 'DIESEL',
    "cantidad" DECIMAL(10,3) NOT NULL,
    "unidad_medida" VARCHAR(10) NOT NULL DEFAULT 'GALONES',
    "costo_por_unidad" DECIMAL(10,4) NOT NULL,
    "costo_total" DECIMAL(12,2) NOT NULL,
    "numero_ticket" VARCHAR(50),
    "vale_diesel" VARCHAR(50),
    "numero_factura" VARCHAR(50),
    "importe_factura" DECIMAL(12,2),
    "requerimiento" TEXT,
    "numero_salida_almacen" VARCHAR(50),
    "foto_surtidor_url" TEXT,
    "foto_tablero_url" TEXT,
    "foto_precinto_nuevo_url" TEXT,
    "foto_precinto_2_url" TEXT,
    "foto_ticket_url" TEXT,
    "estado_id" INTEGER NOT NULL DEFAULT 1,
    "observaciones" TEXT,
    "observaciones_controlador" TEXT,
    "motivo_rechazo" TEXT,
    "aprobado_por" INTEGER,
    "fecha_aprobacion" TIMESTAMP(3),
    "rechazado_por" INTEGER,
    "fecha_rechazo" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abastecimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipos_alerta" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(30),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alertas" (
    "id" SERIAL NOT NULL,
    "tipo_alerta_id" INTEGER NOT NULL,
    "unidad_id" INTEGER,
    "conductor_id" INTEGER,
    "falla_id" INTEGER,
    "mantenimiento_id" INTEGER,
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "fecha_alerta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMP(3),
    "resuelto_por" INTEGER,
    "notas_resolucion" TEXT,
    "es_recurrente" BOOLEAN NOT NULL DEFAULT false,
    "frecuencia_dias" INTEGER,
    "proxima_alerta" DATE,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zonas_codigo_key" ON "public"."zonas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sedes_codigo_key" ON "public"."sedes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "grifos_codigo_key" ON "public"."grifos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "public"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_dni_key" ON "public"."usuarios"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_codigo_empleado_key" ON "public"."usuarios"("codigo_empleado");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_roles_usuario_id_rol_id_activo_key" ON "public"."usuarios_roles"("usuario_id", "rol_id", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "licencias_conducir_numero_licencia_key" ON "public"."licencias_conducir"("numero_licencia");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_placa_key" ON "public"."unidades"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_nro_vin_key" ON "public"."unidades"("nro_vin");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_nro_motor_key" ON "public"."unidades"("nro_motor");

-- CreateIndex
CREATE UNIQUE INDEX "estados_unidad_nombre_key" ON "public"."estados_unidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_falla_nombre_key" ON "public"."tipos_falla"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "rutas_codigo_key" ON "public"."rutas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_nombre_key" ON "public"."turnos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_abastecimiento_nombre_key" ON "public"."estados_abastecimiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "abastecimientos_numero_abastecimiento_key" ON "public"."abastecimientos"("numero_abastecimiento");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_alerta_nombre_key" ON "public"."tipos_alerta"("nombre");

-- AddForeignKey
ALTER TABLE "public"."sedes" ADD CONSTRAINT "sedes_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "public"."zonas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grifos" ADD CONSTRAINT "grifos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."licencias_conducir" ADD CONSTRAINT "licencias_conducir_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades" ADD CONSTRAINT "unidades_conductor_operador_id_fkey" FOREIGN KEY ("conductor_operador_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades" ADD CONSTRAINT "unidades_zona_operacion_id_fkey" FOREIGN KEY ("zona_operacion_id") REFERENCES "public"."zonas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_estados_unidad" ADD CONSTRAINT "historial_estados_unidad_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_estados_unidad" ADD CONSTRAINT "historial_estados_unidad_estado_anterior_id_fkey" FOREIGN KEY ("estado_anterior_id") REFERENCES "public"."estados_unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_estados_unidad" ADD CONSTRAINT "historial_estados_unidad_estado_nuevo_id_fkey" FOREIGN KEY ("estado_nuevo_id") REFERENCES "public"."estados_unidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_estados_unidad" ADD CONSTRAINT "historial_estados_unidad_reportado_por_fkey" FOREIGN KEY ("reportado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_estados_unidad" ADD CONSTRAINT "historial_estados_unidad_autorizado_por_fkey" FOREIGN KEY ("autorizado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fallas_unidad" ADD CONSTRAINT "fallas_unidad_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fallas_unidad" ADD CONSTRAINT "fallas_unidad_tipo_falla_id_fkey" FOREIGN KEY ("tipo_falla_id") REFERENCES "public"."tipos_falla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fallas_unidad" ADD CONSTRAINT "fallas_unidad_detectado_por_fkey" FOREIGN KEY ("detectado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fallas_unidad" ADD CONSTRAINT "fallas_unidad_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fallas_unidad" ADD CONSTRAINT "fallas_unidad_reparado_por_fkey" FOREIGN KEY ("reparado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fallas_unidad" ADD CONSTRAINT "fallas_unidad_cerrado_por_fkey" FOREIGN KEY ("cerrado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspecciones_unidad" ADD CONSTRAINT "inspecciones_unidad_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspecciones_unidad" ADD CONSTRAINT "inspecciones_unidad_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspecciones_unidad" ADD CONSTRAINT "inspecciones_unidad_conductor_entrante_id_fkey" FOREIGN KEY ("conductor_entrante_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inspecciones_unidad" ADD CONSTRAINT "inspecciones_unidad_conductor_saliente_id_fkey" FOREIGN KEY ("conductor_saliente_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mantenimientos_unidad" ADD CONSTRAINT "mantenimientos_unidad_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mantenimientos_unidad" ADD CONSTRAINT "mantenimientos_unidad_realizado_por_fkey" FOREIGN KEY ("realizado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_conductores_historial" ADD CONSTRAINT "unidades_conductores_historial_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_conductores_historial" ADD CONSTRAINT "unidades_conductores_historial_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_conductores_historial" ADD CONSTRAINT "unidades_conductores_historial_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_conductores_historial" ADD CONSTRAINT "unidades_conductores_historial_inspeccion_id_fkey" FOREIGN KEY ("inspeccion_id") REFERENCES "public"."inspecciones_unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_rutas" ADD CONSTRAINT "unidades_rutas_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_rutas" ADD CONSTRAINT "unidades_rutas_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_rutas" ADD CONSTRAINT "unidades_rutas_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_controlador_id_fkey" FOREIGN KEY ("controlador_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_grifo_id_fkey" FOREIGN KEY ("grifo_id") REFERENCES "public"."grifos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."estados_abastecimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."abastecimientos" ADD CONSTRAINT "abastecimientos_rechazado_por_fkey" FOREIGN KEY ("rechazado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_tipo_alerta_id_fkey" FOREIGN KEY ("tipo_alerta_id") REFERENCES "public"."tipos_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_falla_id_fkey" FOREIGN KEY ("falla_id") REFERENCES "public"."fallas_unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "public"."mantenimientos_unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_resuelto_por_fkey" FOREIGN KEY ("resuelto_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
