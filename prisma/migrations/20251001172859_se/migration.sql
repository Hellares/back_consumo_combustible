-- CreateTable
CREATE TABLE "public"."tipos_evento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(30) NOT NULL,
    "requiere_cambio_estado" BOOLEAN NOT NULL DEFAULT false,
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    "color" VARCHAR(7),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."eventos_unidad" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "tipo_evento_id" INTEGER NOT NULL,
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_evento" VARCHAR(5),
    "ubicacion" VARCHAR(200),
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "gravedad" VARCHAR(20) NOT NULL DEFAULT 'LEVE',
    "unidad_involucrada_id" INTEGER,
    "conductor_responsable_id" INTEGER,
    "reportado_por" INTEGER NOT NULL,
    "danos_materiales" BOOLEAN NOT NULL DEFAULT false,
    "personas_afectadas" BOOLEAN NOT NULL DEFAULT false,
    "genero_cambio_estado" BOOLEAN NOT NULL DEFAULT false,
    "historial_estado_id" INTEGER,
    "costo_estimado" DECIMAL(12,2),
    "numero_policial" VARCHAR(50),
    "aseguradora_involucrada" VARCHAR(100),
    "numero_siniestro" VARCHAR(50),
    "estadoResolucion" VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    "fecha_resolucion" TIMESTAMP(3),
    "resolucion" TEXT,
    "observaciones" TEXT,
    "requiere_seguimiento" BOOLEAN NOT NULL DEFAULT false,
    "fecha_seguimiento" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipos_archivo_evento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(30) NOT NULL,
    "extensiones_permitidas" TEXT[],
    "tamanio_max_mb" INTEGER NOT NULL DEFAULT 10,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_archivo_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."archivos_evento" (
    "id" SERIAL NOT NULL,
    "evento_id" INTEGER NOT NULL,
    "tipo_archivo_id" INTEGER NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_almacenado" VARCHAR(255) NOT NULL,
    "url_publica" TEXT NOT NULL,
    "url_thumbnail" TEXT,
    "ruta_almacenamiento" TEXT NOT NULL,
    "tipo_mime" VARCHAR(100) NOT NULL,
    "tamano_bytes" BIGINT NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "metadatos" JSONB,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "subido_por" INTEGER NOT NULL,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_evento_nombre_key" ON "public"."tipos_evento"("nombre");

-- CreateIndex
CREATE INDEX "eventos_unidad_unidad_id_fecha_evento_idx" ON "public"."eventos_unidad"("unidad_id", "fecha_evento");

-- CreateIndex
CREATE INDEX "eventos_unidad_tipo_evento_id_idx" ON "public"."eventos_unidad"("tipo_evento_id");

-- CreateIndex
CREATE INDEX "eventos_unidad_estadoResolucion_idx" ON "public"."eventos_unidad"("estadoResolucion");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_archivo_evento_nombre_key" ON "public"."tipos_archivo_evento"("nombre");

-- CreateIndex
CREATE INDEX "archivos_evento_evento_id_idx" ON "public"."archivos_evento"("evento_id");

-- CreateIndex
CREATE INDEX "archivos_evento_tipo_archivo_id_idx" ON "public"."archivos_evento"("tipo_archivo_id");

-- AddForeignKey
ALTER TABLE "public"."eventos_unidad" ADD CONSTRAINT "eventos_unidad_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eventos_unidad" ADD CONSTRAINT "eventos_unidad_tipo_evento_id_fkey" FOREIGN KEY ("tipo_evento_id") REFERENCES "public"."tipos_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eventos_unidad" ADD CONSTRAINT "eventos_unidad_unidad_involucrada_id_fkey" FOREIGN KEY ("unidad_involucrada_id") REFERENCES "public"."unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eventos_unidad" ADD CONSTRAINT "eventos_unidad_conductor_responsable_id_fkey" FOREIGN KEY ("conductor_responsable_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eventos_unidad" ADD CONSTRAINT "eventos_unidad_reportado_por_fkey" FOREIGN KEY ("reportado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eventos_unidad" ADD CONSTRAINT "eventos_unidad_historial_estado_id_fkey" FOREIGN KEY ("historial_estado_id") REFERENCES "public"."historial_estados_unidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."archivos_evento" ADD CONSTRAINT "archivos_evento_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos_unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."archivos_evento" ADD CONSTRAINT "archivos_evento_tipo_archivo_id_fkey" FOREIGN KEY ("tipo_archivo_id") REFERENCES "public"."tipos_archivo_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."archivos_evento" ADD CONSTRAINT "archivos_evento_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
