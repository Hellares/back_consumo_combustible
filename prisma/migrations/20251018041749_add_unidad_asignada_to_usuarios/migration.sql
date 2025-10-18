-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "unidad_asignada" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_unidad_asignada_fkey" FOREIGN KEY ("unidad_asignada") REFERENCES "public"."unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
