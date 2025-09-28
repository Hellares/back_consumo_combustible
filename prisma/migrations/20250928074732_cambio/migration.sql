-- CreateTable
CREATE TABLE "public"."estados_ticket_abastecimiento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "color" VARCHAR(7),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estados_ticket_abastecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tickets_abastecimiento" (
    "id" SERIAL NOT NULL,
    "numero_ticket" VARCHAR(50) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turno_id" INTEGER,
    "unidad_id" INTEGER NOT NULL,
    "conductor_id" INTEGER NOT NULL,
    "grifo_id" INTEGER NOT NULL,
    "ruta_id" INTEGER,
    "kilometraje_actual" DECIMAL(10,2) NOT NULL,
    "kilometraje_anterior" DECIMAL(10,2),
    "precinto_nuevo" VARCHAR(50) NOT NULL,
    "tipo_combustible" VARCHAR(30) NOT NULL DEFAULT 'DIESEL',
    "cantidad" DECIMAL(10,3) NOT NULL,
    "observaciones_solicitud" TEXT,
    "estado_id" INTEGER NOT NULL,
    "solicitado_por" INTEGER NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo_rechazo" TEXT,
    "rechazado_por" INTEGER,
    "fecha_rechazo" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_abastecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detalles_abastecimiento" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "horometro_actual" DECIMAL(10,2),
    "horometro_anterior" DECIMAL(10,2),
    "precinto_anterior" VARCHAR(50),
    "precinto_2" VARCHAR(50),
    "unidad_medida" VARCHAR(10) NOT NULL DEFAULT 'GALONES',
    "costo_por_unidad" DECIMAL(10,4) NOT NULL,
    "costo_total" DECIMAL(12,2) NOT NULL,
    "numero_ticket_grifo" VARCHAR(50),
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
    "observaciones_controlador" TEXT,
    "controlador_id" INTEGER,
    "aprobado_por" INTEGER NOT NULL,
    "fecha_aprobacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalles_abastecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_ticket_abastecimiento_nombre_key" ON "public"."estados_ticket_abastecimiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_abastecimiento_numero_ticket_key" ON "public"."tickets_abastecimiento"("numero_ticket");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_abastecimiento_ticket_id_key" ON "public"."detalles_abastecimiento"("ticket_id");

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_grifo_id_fkey" FOREIGN KEY ("grifo_id") REFERENCES "public"."grifos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."estados_ticket_abastecimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_solicitado_por_fkey" FOREIGN KEY ("solicitado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets_abastecimiento" ADD CONSTRAINT "tickets_abastecimiento_rechazado_por_fkey" FOREIGN KEY ("rechazado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalles_abastecimiento" ADD CONSTRAINT "detalles_abastecimiento_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets_abastecimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalles_abastecimiento" ADD CONSTRAINT "detalles_abastecimiento_controlador_id_fkey" FOREIGN KEY ("controlador_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalles_abastecimiento" ADD CONSTRAINT "detalles_abastecimiento_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
