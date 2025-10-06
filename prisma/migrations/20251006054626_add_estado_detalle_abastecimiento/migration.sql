-- AlterTable
ALTER TABLE "public"."detalles_abastecimiento" ADD COLUMN     "concluido_por" INTEGER,
ADD COLUMN     "estado" VARCHAR(20) NOT NULL DEFAULT 'EN_PROGRESO',
ADD COLUMN     "fecha_concluido" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "detalles_abastecimiento_estado_idx" ON "public"."detalles_abastecimiento"("estado");

-- AddForeignKey
ALTER TABLE "public"."detalles_abastecimiento" ADD CONSTRAINT "detalles_abastecimiento_concluido_por_fkey" FOREIGN KEY ("concluido_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
