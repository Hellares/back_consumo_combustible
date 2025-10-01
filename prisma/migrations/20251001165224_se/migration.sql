/*
  Warnings:

  - The `horario_apertura` column on the `grifos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `horario_cierre` column on the `grifos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[usuario_id,rol_id]` on the table `usuarios_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."EstadoTicket" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'APROBADO', 'RECHAZADO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "public"."TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO', 'URGENTE');

-- DropIndex
DROP INDEX "public"."usuarios_roles_usuario_id_rol_id_activo_key";

-- AlterTable
ALTER TABLE "public"."grifos" DROP COLUMN "horario_apertura",
ADD COLUMN     "horario_apertura" VARCHAR(5),
DROP COLUMN "horario_cierre",
ADD COLUMN     "horario_cierre" VARCHAR(5);

-- CreateIndex
CREATE INDEX "grifos_sede_id_idx" ON "public"."grifos"("sede_id");

-- CreateIndex
CREATE INDEX "tickets_abastecimiento_unidad_id_fecha_idx" ON "public"."tickets_abastecimiento"("unidad_id", "fecha");

-- CreateIndex
CREATE INDEX "tickets_abastecimiento_conductor_id_fecha_idx" ON "public"."tickets_abastecimiento"("conductor_id", "fecha");

-- CreateIndex
CREATE INDEX "tickets_abastecimiento_estado_id_fecha_idx" ON "public"."tickets_abastecimiento"("estado_id", "fecha");

-- CreateIndex
CREATE INDEX "tickets_abastecimiento_grifo_id_idx" ON "public"."tickets_abastecimiento"("grifo_id");

-- CreateIndex
CREATE INDEX "usuarios_roles_usuario_id_activo_idx" ON "public"."usuarios_roles"("usuario_id", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_roles_usuario_id_rol_id_key" ON "public"."usuarios_roles"("usuario_id", "rol_id");
