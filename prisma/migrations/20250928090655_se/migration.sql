/*
  Warnings:

  - You are about to drop the `abastecimientos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_aprobado_por_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_conductor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_controlador_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_estado_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_grifo_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_rechazado_por_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_ruta_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_turno_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."abastecimientos" DROP CONSTRAINT "abastecimientos_unidad_id_fkey";

-- DropTable
DROP TABLE "public"."abastecimientos";
