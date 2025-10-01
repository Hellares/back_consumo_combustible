// prisma/seed-eventos.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Iniciando seeding de eventos...');

  // 1. Crear Tipos de Evento
  console.log('📌 Creando tipos de evento...');
  const tiposEvento = await Promise.all([
    prisma.tipoEvento.upsert({
      where: { nombre: 'ACCIDENTE_TRANSITO' },
      update: {},
      create: {
        nombre: 'ACCIDENTE_TRANSITO',
        descripcion: 'Accidente de tránsito con otros vehículos',
        categoria: 'ACCIDENTE',
        requiereCambioEstado: true,
        prioridad: 'ALTA',
        color: '#DC3545'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'CHOQUE_MENOR' },
      update: {},
      create: {
        nombre: 'CHOQUE_MENOR',
        descripcion: 'Choque leve sin daños mayores',
        categoria: 'ACCIDENTE',
        requiereCambioEstado: false,
        prioridad: 'MEDIA',
        color: '#FFC107'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'ACCIDENTE_GRAVE' },
      update: {},
      create: {
        nombre: 'ACCIDENTE_GRAVE',
        descripcion: 'Accidente grave con lesiones o daños severos',
        categoria: 'ACCIDENTE',
        requiereCambioEstado: true,
        prioridad: 'CRITICA',
        color: '#721C24'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'INFRACCION_TRANSITO' },
      update: {},
      create: {
        nombre: 'INFRACCION_TRANSITO',
        descripcion: 'Multa o infracción de tránsito',
        categoria: 'INFRACCION',
        requiereCambioEstado: false,
        prioridad: 'BAJA',
        color: '#FD7E14'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'EXCESO_VELOCIDAD' },
      update: {},
      create: {
        nombre: 'EXCESO_VELOCIDAD',
        descripcion: 'Papeleta por exceso de velocidad',
        categoria: 'INFRACCION',
        requiereCambioEstado: false,
        prioridad: 'MEDIA',
        color: '#FF8C00'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'ROBO_UNIDAD' },
      update: {},
      create: {
        nombre: 'ROBO_UNIDAD',
        descripcion: 'Robo total de la unidad',
        categoria: 'ROBO',
        requiereCambioEstado: true,
        prioridad: 'CRITICA',
        color: '#6F42C1'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'ROBO_PARTES' },
      update: {},
      create: {
        nombre: 'ROBO_PARTES',
        descripcion: 'Robo de partes o accesorios del vehículo',
        categoria: 'ROBO',
        requiereCambioEstado: false,
        prioridad: 'ALTA',
        color: '#8B5CF6'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'REVISION_TECNICA' },
      update: {},
      create: {
        nombre: 'REVISION_TECNICA',
        descripcion: 'Revisión técnica vehicular',
        categoria: 'REVISION',
        requiereCambioEstado: false,
        prioridad: 'MEDIA',
        color: '#17A2B8'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'INCIDENTE_RUTA' },
      update: {},
      create: {
        nombre: 'INCIDENTE_RUTA',
        descripcion: 'Incidente durante la ruta sin daños mayores',
        categoria: 'OPERACIONAL',
        requiereCambioEstado: false,
        prioridad: 'BAJA',
        color: '#20C997'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'VANDALISMO' },
      update: {},
      create: {
        nombre: 'VANDALISMO',
        descripcion: 'Daños intencionales a la unidad',
        categoria: 'VANDALISMO',
        requiereCambioEstado: false,
        prioridad: 'ALTA',
        color: '#E83E8C'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'FALLA_MECANICA_RUTA' },
      update: {},
      create: {
        nombre: 'FALLA_MECANICA_RUTA',
        descripcion: 'Falla mecánica durante operación',
        categoria: 'MANTENIMIENTO',
        requiereCambioEstado: true,
        prioridad: 'ALTA',
        color: '#FF6B6B'
      }
    }),
    prisma.tipoEvento.upsert({
      where: { nombre: 'INSPECCION_POLICIAL' },
      update: {},
      create: {
        nombre: 'INSPECCION_POLICIAL',
        descripcion: 'Intervención o inspección policial',
        categoria: 'INFRACCION',
        requiereCambioEstado: false,
        prioridad: 'MEDIA',
        color: '#4ECDC4'
      }
    })
  ]);

  // 2. Crear Tipos de Archivo para Eventos
  console.log('📁 Creando tipos de archivo para eventos...');
  const tiposArchivoEvento = await Promise.all([
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'FOTO_EVENTO' },
      update: {},
      create: {
        nombre: 'FOTO_EVENTO',
        descripcion: 'Fotografías del evento/incidente',
        categoria: 'FOTO',
        extensionesPermitidas: ['.jpg', '.jpeg', '.png', '.heic', '.webp'],
        tamanioMaxMB: 10
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'FOTO_DANOS' },
      update: {},
      create: {
        nombre: 'FOTO_DANOS',
        descripcion: 'Fotografías de daños materiales',
        categoria: 'FOTO',
        extensionesPermitidas: ['.jpg', '.jpeg', '.png', '.heic'],
        tamanioMaxMB: 10
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'VIDEO_EVENTO' },
      update: {},
      create: {
        nombre: 'VIDEO_EVENTO',
        descripcion: 'Videos del evento o dashcam',
        categoria: 'VIDEO',
        extensionesPermitidas: ['.mp4', '.mov', '.avi', '.mkv'],
        tamanioMaxMB: 100
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'DOCUMENTO_POLICIAL' },
      update: {},
      create: {
        nombre: 'DOCUMENTO_POLICIAL',
        descripcion: 'Parte policial, atestado, denuncia',
        categoria: 'DOCUMENTO',
        extensionesPermitidas: ['.pdf', '.doc', '.docx'],
        tamanioMaxMB: 5
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'PAPELETA_INFRACCION' },
      update: {},
      create: {
        nombre: 'PAPELETA_INFRACCION',
        descripcion: 'Papeletas de infracción o multas',
        categoria: 'DOCUMENTO',
        extensionesPermitidas: ['.pdf', '.jpg', '.jpeg', '.png'],
        tamanioMaxMB: 5
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'DENUNCIA_ROBO' },
      update: {},
      create: {
        nombre: 'DENUNCIA_ROBO',
        descripcion: 'Denuncia policial por robo',
        categoria: 'DOCUMENTO',
        extensionesPermitidas: ['.pdf', '.doc', '.docx'],
        tamanioMaxMB: 5
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'CERTIFICADO_MEDICO' },
      update: {},
      create: {
        nombre: 'CERTIFICADO_MEDICO',
        descripcion: 'Certificados médicos de lesionados',
        categoria: 'DOCUMENTO',
        extensionesPermitidas: ['.pdf', '.jpg', '.jpeg', '.png'],
        tamanioMaxMB: 5
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'PERITAJE_VEHICULAR' },
      update: {},
      create: {
        nombre: 'PERITAJE_VEHICULAR',
        descripcion: 'Peritaje técnico vehicular',
        categoria: 'DOCUMENTO',
        extensionesPermitidas: ['.pdf', '.doc', '.docx'],
        tamanioMaxMB: 10
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'DOCUMENTO_SEGURO' },
      update: {},
      create: {
        nombre: 'DOCUMENTO_SEGURO',
        descripcion: 'Documentos de la aseguradora',
        categoria: 'DOCUMENTO',
        extensionesPermitidas: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
        tamanioMaxMB: 10
      }
    }),
    prisma.tipoArchivoEvento.upsert({
      where: { nombre: 'AUDIO_TESTIGO' },
      update: {},
      create: {
        nombre: 'AUDIO_TESTIGO',
        descripcion: 'Audio de testimonio o declaración',
        categoria: 'AUDIO',
        extensionesPermitidas: ['.mp3', '.wav', '.m4a', '.ogg'],
        tamanioMaxMB: 20
      }
    })
  ]);

  console.log('✅ Seeding de eventos completado exitosamente!');
  console.log('📊 Datos creados:');
  console.log(`   - ${tiposEvento.length} tipos de evento`);
  console.log(`   - ${tiposArchivoEvento.length} tipos de archivo para eventos`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding de eventos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  /*
    ***************************************************************************************
    Metodo: npx ts-node prisma/seeds/seed-eventos.ts
    Fecha: 01-10-2025
    Descripcion: seeding para tipos de eventos y tipos de archivo de eventos
    Autor: James Torres
    ***************************************************************************************
  */