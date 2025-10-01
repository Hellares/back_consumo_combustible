import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding tipos de archivo...');

  const tiposArchivo = [
    // IMÁGENES
    {
      codigo: 'FOTO_GRIFO',
      nombre: 'Foto del Grifo',
      descripcion: 'Fotografía del grifo donde se realizó el abastecimiento',
      categoria: 'IMAGEN',
      requerido: true,
      orden: 1
    },
    {
      codigo: 'FOTO_TABLERO',
      nombre: 'Foto del Tablero',
      descripcion: 'Fotografía del tablero mostrando el kilometraje',
      categoria: 'IMAGEN',
      requerido: true,
      orden: 2
    },
    {
      codigo: 'FOTO_PRECINTO',
      nombre: 'Foto del Precinto',
      descripcion: 'Fotografía del precinto del tanque de combustible',
      categoria: 'IMAGEN',
      requerido: true,
      orden: 3
    },
    {
      codigo: 'FOTO_UNIDAD',
      nombre: 'Foto de la Unidad',
      descripcion: 'Fotografía general de la unidad',
      categoria: 'IMAGEN',
      requerido: false,
      orden: 4
    },
    {
      codigo: 'FOTO_SURTIDOR',
      nombre: 'Foto del Surtidor',
      descripcion: 'Fotografía del surtidor con la cantidad de combustible',
      categoria: 'IMAGEN',
      requerido: false,
      orden: 5
    },
    
    // COMPROBANTES
    {
      codigo: 'COMPROBANTE_PAGO',
      nombre: 'Comprobante de Pago',
      descripcion: 'Boleta o ticket de pago del abastecimiento',
      categoria: 'COMPROBANTE',
      requerido: true,
      orden: 6
    },
    {
      codigo: 'FACTURA',
      nombre: 'Factura',
      descripcion: 'Factura del abastecimiento',
      categoria: 'COMPROBANTE',
      requerido: false,
      orden: 7
    },
    
    // DOCUMENTOS
    {
      codigo: 'DOCUMENTO_ADICIONAL',
      nombre: 'Documento Adicional',
      descripcion: 'Cualquier documento adicional relacionado al abastecimiento',
      categoria: 'DOCUMENTO',
      requerido: false,
      orden: 8
    },
    {
      codigo: 'AUTORIZACION',
      nombre: 'Autorización',
      descripcion: 'Documento de autorización especial',
      categoria: 'DOCUMENTO',
      requerido: false,
      orden: 9
    }
  ];

  for (const tipo of tiposArchivo) {
    await prisma.tipoArchivoTicket.upsert({
      where: { codigo: tipo.codigo },
      update: tipo,
      create: tipo
    });
  }

  console.log('✅ 9 tipos de archivo creados exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
  ***************************************************************************************
  Metodo: seed archivos
  Fecha: 01-10-2025
  Descripcion: crear seeds para la tabla tiposArchivoTicket
  Autor: James Torres
  ***************************************************************************************
*/