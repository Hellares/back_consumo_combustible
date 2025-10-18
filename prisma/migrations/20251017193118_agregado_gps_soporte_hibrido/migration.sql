-- DropIndex
DROP INDEX "public"."ubicaciones_gps_fecha_hora_idx";

-- DropIndex
DROP INDEX "public"."ubicaciones_gps_unidad_id_fecha_hora_idx";

-- AlterTable
ALTER TABLE "public"."ubicaciones_gps" ADD COLUMN     "app_version" VARCHAR(20),
ADD COLUMN     "dispositivo_id" VARCHAR(100),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "modelo_dispositivo" VARCHAR(100),
ADD COLUMN     "sistema_operativo" VARCHAR(50);

-- CreateTable
CREATE TABLE "public"."dispositivos_gps" (
    "id" SERIAL NOT NULL,
    "unidad_id" INTEGER NOT NULL,
    "imei" VARCHAR(20),
    "numero_serie" VARCHAR(50),
    "marca" VARCHAR(50) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "frecuencia_envio_segundos" INTEGER NOT NULL DEFAULT 10,
    "modo_ahorro_bateria" BOOLEAN NOT NULL DEFAULT false,
    "enviar_solo_en_movimiento" BOOLEAN NOT NULL DEFAULT false,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "fecha_instalacion" DATE NOT NULL,
    "fecha_ultima_senal" TIMESTAMP(3),
    "firmware_version" VARCHAR(20),
    "sim_card" VARCHAR(20),
    "operador_movil" VARCHAR(50),
    "configuracion" JSONB,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_gps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_gps_imei_key" ON "public"."dispositivos_gps"("imei");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_gps_numero_serie_key" ON "public"."dispositivos_gps"("numero_serie");

-- CreateIndex
CREATE INDEX "dispositivos_gps_unidad_id_idx" ON "public"."dispositivos_gps"("unidad_id");

-- CreateIndex
CREATE INDEX "dispositivos_gps_estado_idx" ON "public"."dispositivos_gps"("estado");

-- CreateIndex
CREATE INDEX "dispositivos_gps_imei_idx" ON "public"."dispositivos_gps"("imei");

-- CreateIndex
CREATE INDEX "ubicaciones_gps_unidad_id_fecha_hora_idx" ON "public"."ubicaciones_gps"("unidad_id", "fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "ubicaciones_gps_fecha_hora_idx" ON "public"."ubicaciones_gps"("fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "ubicaciones_gps_proveedor_fecha_hora_idx" ON "public"."ubicaciones_gps"("proveedor", "fecha_hora");

-- AddForeignKey
ALTER TABLE "public"."dispositivos_gps" ADD CONSTRAINT "dispositivos_gps_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
