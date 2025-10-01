/*
  Warnings:

  - Added the required column `ciudad_destino` to the `tramos_itinerario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad_origen` to the `tramos_itinerario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tramos_itinerario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipoDesvio" AS ENUM ('TIEMPO', 'KILOMETRAJE', 'COMBUSTIBLE', 'PARADA_NO_REALIZADA', 'RUTA_ALTERADA');

-- CreateEnum
CREATE TYPE "public"."SeveridadDesvio" AS ENUM ('LEVE', 'MODERADO', 'GRAVE', 'CRITICO');

-- AlterEnum
ALTER TYPE "public"."FrecuenciaItinerario" ADD VALUE 'PERSONALIZADO';

-- AlterTable
ALTER TABLE "public"."tramos_itinerario" ADD COLUMN     "ciudad_destino" VARCHAR(100) NOT NULL,
ADD COLUMN     "ciudad_origen" VARCHAR(100) NOT NULL,
ADD COLUMN     "coordenadas_parada" VARCHAR(50),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "direccion_parada" VARCHAR(300),
ADD COLUMN     "horario_preferido" VARCHAR(50),
ADD COLUMN     "requiere_documentacion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "restricciones_climaticas" TEXT,
ADD COLUMN     "tolerancia_km" DECIMAL(5,2),
ADD COLUMN     "tolerancia_tiempo" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."itinerario_historial" (
    "id" SERIAL NOT NULL,
    "itinerario_id" INTEGER NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cambiosJson" JSONB,
    "modificado_por" INTEGER NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerario_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alertas_desvio" (
    "id" SERIAL NOT NULL,
    "ejecucion_id" INTEGER NOT NULL,
    "registro_tramo_id" INTEGER,
    "tipo_desvio" "public"."TipoDesvio" NOT NULL,
    "valor_esperado" DECIMAL(10,2),
    "valor_real" DECIMAL(10,2),
    "porcentaje_desvio" DECIMAL(5,2) NOT NULL,
    "severidad" "public"."SeveridadDesvio" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_deteccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resuelto_por" INTEGER,
    "fecha_resolucion" TIMESTAMP(3),
    "comentarios" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_desvio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ubicaciones_gps" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "ejecucion_id" INTEGER,
    "registro_tramo_id" INTEGER,
    "latitud" DECIMAL(10,8) NOT NULL,
    "longitud" DECIMAL(11,8) NOT NULL,
    "altitud" DECIMAL(8,2),
    "precision" DECIMAL(6,2),
    "velocidad" DECIMAL(5,2),
    "rumbo" DECIMAL(5,2),
    "kilometraje" DECIMAL(10,2),
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedor" VARCHAR(50),
    "bateria" INTEGER,
    "senal_gps" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ubicaciones_gps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "itinerario_historial_itinerario_id_fecha_cambio_idx" ON "public"."itinerario_historial"("itinerario_id", "fecha_cambio");

-- CreateIndex
CREATE INDEX "alertas_desvio_ejecucion_id_severidad_idx" ON "public"."alertas_desvio"("ejecucion_id", "severidad");

-- CreateIndex
CREATE INDEX "alertas_desvio_estado_fecha_deteccion_idx" ON "public"."alertas_desvio"("estado", "fecha_deteccion");

-- CreateIndex
CREATE INDEX "alertas_desvio_tipo_desvio_severidad_idx" ON "public"."alertas_desvio"("tipo_desvio", "severidad");

-- CreateIndex
CREATE INDEX "ubicaciones_gps_unidad_id_fecha_hora_idx" ON "public"."ubicaciones_gps"("unidad_id", "fecha_hora");

-- CreateIndex
CREATE INDEX "ubicaciones_gps_ejecucion_id_fecha_hora_idx" ON "public"."ubicaciones_gps"("ejecucion_id", "fecha_hora");

-- CreateIndex
CREATE INDEX "ubicaciones_gps_fecha_hora_idx" ON "public"."ubicaciones_gps"("fecha_hora");

-- CreateIndex
CREATE INDEX "itinerarios_estado_tipoItinerario_idx" ON "public"."itinerarios"("estado", "tipoItinerario");

-- CreateIndex
CREATE INDEX "rutas_estado_idx" ON "public"."rutas"("estado");

-- CreateIndex
CREATE INDEX "rutas_origen_destino_idx" ON "public"."rutas"("origen", "destino");

-- CreateIndex
CREATE INDEX "tramos_itinerario_ciudad_origen_ciudad_destino_idx" ON "public"."tramos_itinerario"("ciudad_origen", "ciudad_destino");

-- AddForeignKey
ALTER TABLE "public"."itinerario_historial" ADD CONSTRAINT "itinerario_historial_itinerario_id_fkey" FOREIGN KEY ("itinerario_id") REFERENCES "public"."itinerarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itinerario_historial" ADD CONSTRAINT "itinerario_historial_modificado_por_fkey" FOREIGN KEY ("modificado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas_desvio" ADD CONSTRAINT "alertas_desvio_ejecucion_id_fkey" FOREIGN KEY ("ejecucion_id") REFERENCES "public"."ejecuciones_itinerario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas_desvio" ADD CONSTRAINT "alertas_desvio_registro_tramo_id_fkey" FOREIGN KEY ("registro_tramo_id") REFERENCES "public"."registros_tramo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas_desvio" ADD CONSTRAINT "alertas_desvio_resuelto_por_fkey" FOREIGN KEY ("resuelto_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ubicaciones_gps" ADD CONSTRAINT "ubicaciones_gps_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ubicaciones_gps" ADD CONSTRAINT "ubicaciones_gps_ejecucion_id_fkey" FOREIGN KEY ("ejecucion_id") REFERENCES "public"."ejecuciones_itinerario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ubicaciones_gps" ADD CONSTRAINT "ubicaciones_gps_registro_tramo_id_fkey" FOREIGN KEY ("registro_tramo_id") REFERENCES "public"."registros_tramo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
