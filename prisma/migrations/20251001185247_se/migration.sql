/*
  Warnings:

  - You are about to drop the column `activo` on the `rutas` table. All the data in the column will be lost.
  - Added the required column `motivo_asignacion` to the `unidades_rutas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EstadoRuta" AS ENUM ('ACTIVA', 'INACTIVA', 'EN_REVISION');

-- CreateEnum
CREATE TYPE "public"."EstadoItinerario" AS ENUM ('ACTIVO', 'INACTIVO', 'EN_MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "public"."FrecuenciaItinerario" AS ENUM ('DIARIO', 'SEMANAL', 'MENSUAL', 'LUNES_VIERNES', 'FINES_SEMANA');

-- CreateEnum
CREATE TYPE "public"."EstadoEjecucion" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "public"."EstadoTramo" AS ENUM ('PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'OMITIDO');

-- CreateEnum
CREATE TYPE "public"."TipoTramo" AS ENUM ('IDA', 'VUELTA', 'INTERMEDIO', 'CIRCULAR');

-- AlterTable
ALTER TABLE "public"."rutas" DROP COLUMN "activo",
ADD COLUMN     "estado" "public"."EstadoRuta" NOT NULL DEFAULT 'ACTIVA';

-- AlterTable
ALTER TABLE "public"."unidades_rutas" ADD COLUMN     "autorizado_por" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion_motivo" TEXT,
ADD COLUMN     "es_una_vez" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_autorizacion" TIMESTAMP(3),
ADD COLUMN     "fecha_viaje_especifico" DATE,
ADD COLUMN     "motivo_asignacion" VARCHAR(100) NOT NULL,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "prioridad" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "requiere_autorizacion" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "fecha_asignacion" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "fecha_desasignacion" SET DATA TYPE TIMESTAMP(3);

-- DropEnum
DROP TYPE "public"."EstadoTicket";

-- DropEnum
DROP TYPE "public"."TipoMantenimiento";

-- CreateTable
CREATE TABLE "public"."itinerarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "tipoItinerario" VARCHAR(30) NOT NULL,
    "distancia_total" DECIMAL(10,2) NOT NULL,
    "tiempo_estimado_total" INTEGER NOT NULL,
    "dias_operacion" TEXT[],
    "hora_inicio_habitual" VARCHAR(5),
    "duracion_estimada_horas" DECIMAL(5,2),
    "estado" "public"."EstadoItinerario" NOT NULL DEFAULT 'ACTIVO',
    "requiere_supervisor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tramos_itinerario" (
    "id" SERIAL NOT NULL,
    "itinerario_id" INTEGER NOT NULL,
    "ruta_id" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "tipo_tramo" "public"."TipoTramo" NOT NULL DEFAULT 'INTERMEDIO',
    "punto_parada" VARCHAR(200),
    "tiempo_parada_minutos" INTEGER,
    "es_parada_obligatoria" BOOLEAN NOT NULL DEFAULT false,
    "requiere_inspeccion" BOOLEAN NOT NULL DEFAULT false,
    "requiere_abastecimiento" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,

    CONSTRAINT "tramos_itinerario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unidades_itinerarios" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "itinerario_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desasignacion" TIMESTAMP(3),
    "frecuencia" "public"."FrecuenciaItinerario" NOT NULL DEFAULT 'DIARIO',
    "dias_especificos" TEXT[],
    "hora_inicio_personalizada" VARCHAR(5),
    "es_permanente" BOOLEAN NOT NULL DEFAULT true,
    "asignado_por" INTEGER,
    "motivo_cambio" TEXT,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_itinerarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ejecuciones_itinerario" (
    "id" SERIAL NOT NULL,
    "itinerario_id" INTEGER NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "conductor_id" INTEGER NOT NULL,
    "turno_id" INTEGER,
    "fecha_programada" DATE NOT NULL,
    "hora_inicio_estimada" VARCHAR(5),
    "hora_fin_estimada" VARCHAR(5),
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "kilometraje_inicial" DECIMAL(10,2) NOT NULL,
    "kilometraje_final" DECIMAL(10,2),
    "horometro_inicial" DECIMAL(10,2),
    "horometro_final" DECIMAL(10,2),
    "combustible_total" DECIMAL(8,2),
    "costo_total" DECIMAL(12,2),
    "estado" "public"."EstadoEjecucion" NOT NULL DEFAULT 'PROGRAMADO',
    "motivo_cancelacion" TEXT,
    "observaciones" TEXT,
    "requiere_supervision" BOOLEAN NOT NULL DEFAULT false,
    "supervisado_por" INTEGER,
    "fecha_supervision" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejecuciones_itinerario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registros_tramo" (
    "id" SERIAL NOT NULL,
    "ejecucion_id" INTEGER NOT NULL,
    "tramo_id" INTEGER NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3),
    "tiempo_parada_real" INTEGER,
    "kilometraje_inicio" DECIMAL(10,2) NOT NULL,
    "kilometraje_fin" DECIMAL(10,2),
    "combustible_usado" DECIMAL(8,2),
    "estado" "public"."EstadoTramo" NOT NULL DEFAULT 'PENDIENTE',
    "motivo_omision" TEXT,
    "tiene_incidentes" BOOLEAN NOT NULL DEFAULT false,
    "descripcion_incidentes" TEXT,
    "gravedad_incidente" VARCHAR(20),
    "condiciones_climaticas" VARCHAR(50),
    "condiciones_trafico" VARCHAR(50),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_tramo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "itinerarios_codigo_key" ON "public"."itinerarios"("codigo");

-- CreateIndex
CREATE INDEX "tramos_itinerario_itinerario_id_orden_idx" ON "public"."tramos_itinerario"("itinerario_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "tramos_itinerario_itinerario_id_orden_key" ON "public"."tramos_itinerario"("itinerario_id", "orden");

-- CreateIndex
CREATE INDEX "unidades_itinerarios_unidad_id_fecha_desasignacion_idx" ON "public"."unidades_itinerarios"("unidad_id", "fecha_desasignacion");

-- CreateIndex
CREATE INDEX "unidades_itinerarios_itinerario_id_idx" ON "public"."unidades_itinerarios"("itinerario_id");

-- CreateIndex
CREATE INDEX "ejecuciones_itinerario_unidad_id_fecha_programada_idx" ON "public"."ejecuciones_itinerario"("unidad_id", "fecha_programada");

-- CreateIndex
CREATE INDEX "ejecuciones_itinerario_conductor_id_fecha_programada_idx" ON "public"."ejecuciones_itinerario"("conductor_id", "fecha_programada");

-- CreateIndex
CREATE INDEX "ejecuciones_itinerario_estado_fecha_programada_idx" ON "public"."ejecuciones_itinerario"("estado", "fecha_programada");

-- CreateIndex
CREATE INDEX "ejecuciones_itinerario_itinerario_id_estado_idx" ON "public"."ejecuciones_itinerario"("itinerario_id", "estado");

-- CreateIndex
CREATE INDEX "registros_tramo_ejecucion_id_estado_idx" ON "public"."registros_tramo"("ejecucion_id", "estado");

-- CreateIndex
CREATE INDEX "registros_tramo_tramo_id_idx" ON "public"."registros_tramo"("tramo_id");

-- CreateIndex
CREATE INDEX "unidades_rutas_unidad_id_activo_idx" ON "public"."unidades_rutas"("unidad_id", "activo");

-- CreateIndex
CREATE INDEX "unidades_rutas_ruta_id_fecha_viaje_especifico_idx" ON "public"."unidades_rutas"("ruta_id", "fecha_viaje_especifico");

-- CreateIndex
CREATE INDEX "unidades_rutas_es_una_vez_activo_idx" ON "public"."unidades_rutas"("es_una_vez", "activo");

-- AddForeignKey
ALTER TABLE "public"."unidades_rutas" ADD CONSTRAINT "unidades_rutas_autorizado_por_fkey" FOREIGN KEY ("autorizado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tramos_itinerario" ADD CONSTRAINT "tramos_itinerario_itinerario_id_fkey" FOREIGN KEY ("itinerario_id") REFERENCES "public"."itinerarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tramos_itinerario" ADD CONSTRAINT "tramos_itinerario_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "public"."rutas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_itinerarios" ADD CONSTRAINT "unidades_itinerarios_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_itinerarios" ADD CONSTRAINT "unidades_itinerarios_itinerario_id_fkey" FOREIGN KEY ("itinerario_id") REFERENCES "public"."itinerarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unidades_itinerarios" ADD CONSTRAINT "unidades_itinerarios_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ejecuciones_itinerario" ADD CONSTRAINT "ejecuciones_itinerario_itinerario_id_fkey" FOREIGN KEY ("itinerario_id") REFERENCES "public"."itinerarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ejecuciones_itinerario" ADD CONSTRAINT "ejecuciones_itinerario_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ejecuciones_itinerario" ADD CONSTRAINT "ejecuciones_itinerario_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ejecuciones_itinerario" ADD CONSTRAINT "ejecuciones_itinerario_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "public"."turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ejecuciones_itinerario" ADD CONSTRAINT "ejecuciones_itinerario_supervisado_por_fkey" FOREIGN KEY ("supervisado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registros_tramo" ADD CONSTRAINT "registros_tramo_ejecucion_id_fkey" FOREIGN KEY ("ejecucion_id") REFERENCES "public"."ejecuciones_itinerario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registros_tramo" ADD CONSTRAINT "registros_tramo_tramo_id_fkey" FOREIGN KEY ("tramo_id") REFERENCES "public"."tramos_itinerario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
