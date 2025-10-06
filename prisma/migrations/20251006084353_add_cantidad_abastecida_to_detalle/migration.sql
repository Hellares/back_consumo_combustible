-- AlterTable
ALTER TABLE "public"."detalles_abastecimiento" ADD COLUMN     "cantidad_abastecida" DECIMAL(10,3),
ADD COLUMN     "motivo_diferencia" VARCHAR(200);
