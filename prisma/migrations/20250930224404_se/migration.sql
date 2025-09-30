/*
  Warnings:

  - You are about to drop the column `foto_precinto_2_url` on the `detalles_abastecimiento` table. All the data in the column will be lost.
  - You are about to drop the column `foto_precinto_nuevo_url` on the `detalles_abastecimiento` table. All the data in the column will be lost.
  - You are about to drop the column `foto_surtidor_url` on the `detalles_abastecimiento` table. All the data in the column will be lost.
  - You are about to drop the column `foto_tablero_url` on the `detalles_abastecimiento` table. All the data in the column will be lost.
  - You are about to drop the column `foto_ticket_url` on the `detalles_abastecimiento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."detalles_abastecimiento" DROP COLUMN "foto_precinto_2_url",
DROP COLUMN "foto_precinto_nuevo_url",
DROP COLUMN "foto_surtidor_url",
DROP COLUMN "foto_tablero_url",
DROP COLUMN "foto_ticket_url";

-- CreateTable
CREATE TABLE "public"."tipos_archivo_ticket" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(20) NOT NULL,
    "requerido" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_archivo_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."archivos_ticket" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "tipo_archivo_id" INTEGER NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
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

    CONSTRAINT "archivos_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_archivo_ticket_codigo_key" ON "public"."tipos_archivo_ticket"("codigo");

-- CreateIndex
CREATE INDEX "archivos_ticket_ticket_id_idx" ON "public"."archivos_ticket"("ticket_id");

-- CreateIndex
CREATE INDEX "archivos_ticket_tipo_archivo_id_idx" ON "public"."archivos_ticket"("tipo_archivo_id");

-- AddForeignKey
ALTER TABLE "public"."archivos_ticket" ADD CONSTRAINT "archivos_ticket_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets_abastecimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."archivos_ticket" ADD CONSTRAINT "archivos_ticket_tipo_archivo_id_fkey" FOREIGN KEY ("tipo_archivo_id") REFERENCES "public"."tipos_archivo_ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."archivos_ticket" ADD CONSTRAINT "archivos_ticket_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
