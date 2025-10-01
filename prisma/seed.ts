// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // Limpiar datos existentes (opcional, comentar si no quieres borrar)
  // await prisma.alerta.deleteMany();
  // await prisma.abastecimiento.deleteMany();
  // ... otros modelos

  // 1. Crear Roles
  console.log('👥 Creando roles...');
  const roles = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'ADMIN' },
      update: {},
      create: {
        nombre: 'ADMIN',
        descripcion: 'Administrador del sistema con acceso completo',
        permisos: {
          usuarios: ['create', 'read', 'update', 'delete'],
          unidades: ['create', 'read', 'update', 'delete'],
          abastecimientos: ['create', 'read', 'update', 'delete', 'approve'],
          reportes: ['read', 'export'],
          configuracion: ['read', 'update']
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'SUPERVISOR' },
      update: {},
      create: {
        nombre: 'SUPERVISOR',
        descripcion: 'Supervisor de operaciones y personal',
        permisos: {
          usuarios: ['read', 'update'],
          unidades: ['read', 'update'],
          abastecimientos: ['read', 'approve'],
          reportes: ['read', 'export'],
          mantenimientos: ['create', 'read', 'update']
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'CONTROLADOR' },
      update: {},
      create: {
        nombre: 'CONTROLADOR',
        descripcion: 'Encargado de validar y controlar abastecimientos',
        permisos: {
          abastecimientos: ['read', 'update', 'approve'],
          unidades: ['read'],
          reportes: ['read']
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'CONDUCTOR' },
      update: {},
      create: {
        nombre: 'CONDUCTOR',
        descripcion: 'Conductor de unidades de transporte',
        permisos: {
          abastecimientos: ['create', 'read'],
          unidades: ['read'],
          inspecciones: ['create', 'read'],
          fallas: ['create', 'read']
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'TECNICO' },
      update: {},
      create: {
        nombre: 'TECNICO',
        descripcion: 'Técnico de mantenimiento',
        permisos: {
          mantenimientos: ['create', 'read', 'update'],
          fallas: ['read', 'update'],
          inspecciones: ['create', 'read', 'update'],
          unidades: ['read', 'update']
        }
      }
    }),
  ]);

  // 2. Crear Estados de Unidad
  console.log('🚛 Creando estados de unidad...');
  const estadosUnidad = await Promise.all([
    prisma.estadoUnidad.upsert({
      where: { nombre: 'OPERATIVO' },
      update: {},
      create: {
        nombre: 'OPERATIVO',
        descripcion: 'Unidad en condiciones normales de operación',
        color: '#28A745',
        requiereInspeccion: false,
        permiteOperacion: true
      }
    }),
    prisma.estadoUnidad.upsert({
      where: { nombre: 'MANTENIMIENTO_PREVENTIVO' },
      update: {},
      create: {
        nombre: 'MANTENIMIENTO_PREVENTIVO',
        descripcion: 'En mantenimiento programado',
        color: '#FFC107',
        requiereInspeccion: true,
        permiteOperacion: false
      }
    }),
    prisma.estadoUnidad.upsert({
      where: { nombre: 'MANTENIMIENTO_CORRECTIVO' },
      update: {},
      create: {
        nombre: 'MANTENIMIENTO_CORRECTIVO',
        descripcion: 'En reparación por falla',
        color: '#FF6B35',
        requiereInspeccion: true,
        permiteOperacion: false
      }
    }),
    prisma.estadoUnidad.upsert({
      where: { nombre: 'AVERIADO' },
      update: {},
      create: {
        nombre: 'AVERIADO',
        descripcion: 'Unidad con falla que impide operación',
        color: '#DC3545',
        requiereInspeccion: true,
        permiteOperacion: false
      }
    }),
    prisma.estadoUnidad.upsert({
      where: { nombre: 'FUERA_SERVICIO' },
      update: {},
      create: {
        nombre: 'FUERA_SERVICIO',
        descripcion: 'Temporalmente fuera de servicio',
        color: '#6C757D',
        requiereInspeccion: true,
        permiteOperacion: false
      }
    })
  ]);


  // 3.1 Crear Estados de Tickets de Abastecimiento
  console.log('🎫 Creando estados de tickets de abastecimiento...');
  const estadosTicket = await Promise.all([
    prisma.estadoTicketAbastecimiento.upsert({
      where: { nombre: 'SOLICITADO' },
      update: {},
      create: {
        nombre: 'SOLICITADO',
        descripcion: 'Ticket solicitado, pendiente de aprobación',
        color: '#FFA500'
      }
    }),
    prisma.estadoTicketAbastecimiento.upsert({
      where: { nombre: 'APROBADO' },
      update: {},
      create: {
        nombre: 'APROBADO',
        descripcion: 'Ticket aprobado, listo para abastecimiento',
        color: '#28A745'
      }
    }),
    prisma.estadoTicketAbastecimiento.upsert({
      where: { nombre: 'RECHAZADO' },
      update: {},
      create: {
        nombre: 'RECHAZADO',
        descripcion: 'Ticket rechazado por inconsistencias',
        color: '#DC3545'
      }
    })
  ]);

  // 4. Crear Turnos
  console.log('🕐 Creando turnos...');
  const turnos = await Promise.all([
    prisma.turno.upsert({
      where: { nombre: 'MAÑANA' },
      update: {},
      create: {
        nombre: 'MAÑANA',
        horaInicio: new Date('1970-01-01T06:00:00Z'),
        horaFin: new Date('1970-01-01T14:00:00Z')
      }
    }),
    prisma.turno.upsert({
      where: { nombre: 'TARDE' },
      update: {},
      create: {
        nombre: 'TARDE',
        horaInicio: new Date('1970-01-01T14:00:00Z'),
        horaFin: new Date('1970-01-01T22:00:00Z')
      }
    }),
    prisma.turno.upsert({
      where: { nombre: 'NOCHE' },
      update: {},
      create: {
        nombre: 'NOCHE',
        horaInicio: new Date('1970-01-01T22:00:00Z'),
        horaFin: new Date('1970-01-01T06:00:00Z')
      }
    })
  ]);

  // 5. Crear Tipos de Falla
  console.log('🔧 Creando tipos de falla...');
  const tiposFalla = await Promise.all([
    prisma.tipoFalla.upsert({
      where: { nombre: 'MECANICA_MOTOR' },
      update: {},
      create: {
        nombre: 'MECANICA_MOTOR',
        descripcion: 'Fallas relacionadas con el motor',
        prioridadDefault: 'ALTA',
        categoria: 'CORRECTIVO'
      }
    }),
    prisma.tipoFalla.upsert({
      where: { nombre: 'SISTEMA_FRENOS' },
      update: {},
      create: {
        nombre: 'SISTEMA_FRENOS',
        descripcion: 'Fallas en el sistema de frenos',
        prioridadDefault: 'CRITICA',
        categoria: 'CORRECTIVO'
      }
    }),
    prisma.tipoFalla.upsert({
      where: { nombre: 'SISTEMA_ELECTRICO' },
      update: {},
      create: {
        nombre: 'SISTEMA_ELECTRICO',
        descripcion: 'Fallas eléctricas generales',
        prioridadDefault: 'MEDIA',
        categoria: 'CORRECTIVO'
      }
    }),
    prisma.tipoFalla.upsert({
      where: { nombre: 'NEUMATICOS' },
      update: {},
      create: {
        nombre: 'NEUMATICOS',
        descripcion: 'Problemas con neumáticos',
        prioridadDefault: 'MEDIA',
        categoria: 'CORRECTIVO'
      }
    }),
    prisma.tipoFalla.upsert({
      where: { nombre: 'SISTEMA_COMBUSTIBLE' },
      update: {},
      create: {
        nombre: 'SISTEMA_COMBUSTIBLE',
        descripcion: 'Problemas con sistema de combustible',
        prioridadDefault: 'ALTA',
        categoria: 'CORRECTIVO'
      }
    })
  ]);

  // 6. Crear Tipos de Alerta
  console.log('🚨 Creando tipos de alerta...');
  const tiposAlerta = await Promise.all([
    prisma.tipoAlerta.upsert({
      where: { nombre: 'CONSUMO_ALTO' },
      update: {},
      create: {
        nombre: 'CONSUMO_ALTO',
        descripcion: 'Consumo de combustible por encima del promedio',
        categoria: 'COMBUSTIBLE'
      }
    }),
    prisma.tipoAlerta.upsert({
      where: { nombre: 'LICENCIA_VENCE' },
      update: {},
      create: {
        nombre: 'LICENCIA_VENCE',
        descripcion: 'Licencia de conducir próxima a vencer',
        categoria: 'PERSONAL'
      }
    }),
    prisma.tipoAlerta.upsert({
      where: { nombre: 'MANTENIMIENTO_VENCE' },
      update: {},
      create: {
        nombre: 'MANTENIMIENTO_VENCE',
        descripcion: 'Mantenimiento programado próximo a vencer',
        categoria: 'MANTENIMIENTO'
      }
    }),
    prisma.tipoAlerta.upsert({
      where: { nombre: 'FALLA_CRITICA' },
      update: {},
      create: {
        nombre: 'FALLA_CRITICA',
        descripcion: 'Falla crítica reportada en unidad',
        categoria: 'SEGURIDAD'
      }
    }),
    prisma.tipoAlerta.upsert({
      where: { nombre: 'KILOMETRAJE_INCONSISTENTE' },
      update: {},
      create: {
        nombre: 'KILOMETRAJE_INCONSISTENTE',
        descripcion: 'Kilometraje reportado es inconsistente',
        categoria: 'OPERACIONAL'
      }
    })
  ]);

  // 7. Crear Zonas de ejemplo
  console.log('🗺️ Creando zonas...');
  const zonas = await Promise.all([
    prisma.zona.upsert({
      where: { codigo: 'LIMA' },
      update: {},
      create: {
        nombre: 'Lima Metropolitana',
        codigo: 'LIMA',
        descripcion: 'Zona de operaciones en Lima y alrededores'
      }
    }),
    prisma.zona.upsert({
      where: { codigo: 'CALLAO' },
      update: {},
      create: {
        nombre: 'Callao',
        codigo: 'CALLAO',
        descripcion: 'Zona de operaciones en el Callao'
      }
    }),
    prisma.zona.upsert({
      where: { codigo: 'NORTE' },
      update: {},
      create: {
        nombre: 'Lima Norte',
        codigo: 'NORTE',
        descripcion: 'Zona norte de Lima (Comas, Los Olivos, etc.)'
      }
    })
  ]);

  // 8. Crear Sedes de ejemplo
  console.log('🏢 Creando sedes...');
  const sedes = await Promise.all([
    prisma.sede.upsert({
      where: { codigo: 'SEDE01' },
      update: {},
      create: {
        zonaId: zonas[0].id,
        nombre: 'Sede Central Lima',
        codigo: 'SEDE01',
        direccion: 'Av. Principal 123, Lima',
        telefono: '01-1234567'
      }
    }),
    prisma.sede.upsert({
      where: { codigo: 'SEDE02' },
      update: {},
      create: {
        zonaId: zonas[1].id,
        nombre: 'Sede Callao',
        codigo: 'SEDE02',
        direccion: 'Av. Colonial 456, Callao',
        telefono: '01-7654321'
      }
    })
  ]);

  // 9. Crear Grifos de ejemplo
  console.log('⛽ Creando grifos...');
  const grifos = await Promise.all([
    prisma.grifo.upsert({
      where: { codigo: 'GRIFO01' },
      update: {},
      create: {
        sedeId: sedes[0].id,
        nombre: 'Grifo Petroperu Lima Centro',
        codigo: 'GRIFO01',
        direccion: 'Av. Abancay 789, Lima',
        telefono: '01-9876543',
        horarioApertura: new Date('1970-01-01T06:00:00Z'),
        horarioCierre: new Date('1970-01-01T22:00:00Z')
      }
    }),
    prisma.grifo.upsert({
      where: { codigo: 'GRIFO02' },
      update: {},
      create: {
        sedeId: sedes[1].id,
        nombre: 'Grifo Repsol Callao',
        codigo: 'GRIFO02',
        direccion: 'Av. Argentina 321, Callao',
        telefono: '01-5432167',
        horarioApertura: new Date('1970-01-01T05:00:00Z'),
        horarioCierre: new Date('1970-01-01T23:00:00Z')
      }
    })
  ]);

  // 10. Crear Usuario Administrador
  console.log('👤 Creando usuario administrador...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@fuelcontrol.com' },
    update: {},
    create: {
      nombres: 'Administrador',
      apellidos: 'Sistema',
      email: 'admin@fuelcontrol.com',
      telefono: '999888777',
      dni: '12345678',
      codigoEmpleado: 'ADM001',
      passwordHash: adminPassword,
      fechaIngreso: new Date(),
      activo: true
    }
  });

  // Asignar rol de ADMIN al usuario
  await prisma.usuarioRol.upsert({
    where: {
      usuarioId_rolId_activo: {
        usuarioId: adminUser.id,
        rolId: roles[0].id, // ADMIN
        activo: true
      }
    },
    update: {},
    create: {
      usuarioId: adminUser.id,
      rolId: roles[0].id,
      fechaAsignacion: new Date(),
      activo: true
    }
  });

  // 11. Crear algunos usuarios de ejemplo
  console.log('👥 Creando usuarios de ejemplo...');
  const conductorPassword = await bcrypt.hash('conductor123', 10);
  
  const conductor1 = await prisma.usuario.upsert({
    where: { email: 'conductor1@fuelcontrol.com' },
    update: {},
    create: {
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      email: 'conductor1@fuelcontrol.com',
      telefono: '987654321',
      dni: '87654321',
      codigoEmpleado: 'COND001',
      passwordHash: conductorPassword,
      fechaIngreso: new Date(),
      activo: true
    }
  });

  // Asignar rol de CONDUCTOR
  await prisma.usuarioRol.upsert({
    where: {
      usuarioId_rolId_activo: {
        usuarioId: conductor1.id,
        rolId: roles.find(r => r.nombre === 'CONDUCTOR')!.id,
        activo: true
      }
    },
    update: {},
    create: {
      usuarioId: conductor1.id,
      rolId: roles.find(r => r.nombre === 'CONDUCTOR')!.id,
      fechaAsignacion: new Date(),
      activo: true
    }
  });

  // Crear licencia de conducir para el conductor
  await prisma.licenciaConducir.upsert({
    where: { numeroLicencia: 'A3C123456789' },
    update: {},
    create: {
      usuarioId: conductor1.id,
      numeroLicencia: 'A3C123456789',
      categoria: 'A3C',
      fechaEmision: new Date('2020-01-15'),
      fechaExpiracion: new Date('2025-01-15'),
      entidadEmisora: 'MTC',
      activo: true
    }
  });

  // 12. Crear Rutas de ejemplo
  console.log('🛣️ Creando rutas...');
  const rutas = await Promise.all([
    prisma.ruta.upsert({
      where: { codigo: 'RUTA01' },
      update: {},
      create: {
        nombre: 'Lima Centro - Callao',
        codigo: 'RUTA01',
        descripcion: 'Ruta principal Lima Centro hacia Callao',
        origen: 'Lima Centro',
        destino: 'Callao',
        distanciaKm: 15.5,
        tiempoEstimadoMinutos: 45
      }
    }),
    prisma.ruta.upsert({
      where: { codigo: 'RUTA02' },
      update: {},
      create: {
        nombre: 'Lima Norte - Centro',
        codigo: 'RUTA02',
        descripcion: 'Ruta desde Lima Norte al Centro',
        origen: 'Lima Norte',
        destino: 'Lima Centro',
        distanciaKm: 12.8,
        tiempoEstimadoMinutos: 35
      }
    })
  ]);

  // 13. Crear Unidades de ejemplo
  console.log('🚛 Creando unidades...');
  const unidades = await Promise.all([
    prisma.unidad.upsert({
      where: { placa: 'ABC-123' },
      update: {},
      create: {
        placa: 'ABC-123',
        conductorOperadorId: conductor1.id,
        operacion: 'Transporte de Carga',
        marca: 'Volvo',
        modelo: 'FH 460',
        anio: 2018,
        nroVin: 'YV2A1234567890123',
        nroMotor: 'D13F460EC06',
        zonaOperacionId: zonas[0].id,
        capacidadTanque: 400.00,
        tipoCombustible: 'DIESEL',
        odometroInicial: 50000.00,
        horometroInicial: 5000.00,
        fechaAdquisicion: new Date('2018-03-15'),
        estado: 'OPERATIVO',
        activo: true
      }
    }),
    prisma.unidad.upsert({
      where: { placa: 'DEF-456' },
      update: {},
      create: {
        placa: 'DEF-456',
        operacion: 'Transporte de Personal',
        marca: 'Mercedes-Benz',
        modelo: 'Sprinter 515',
        anio: 2020,
        nroVin: 'WDB9066631B123456',
        nroMotor: 'OM651955',
        zonaOperacionId: zonas[1].id,
        capacidadTanque: 75.00,
        tipoCombustible: 'DIESEL',
        odometroInicial: 25000.00,
        horometroInicial: 2500.00,
        fechaAdquisicion: new Date('2020-08-10'),
        estado: 'OPERATIVO',
        activo: true
      }
    })
  ]);

  console.log('✅ Seeding completado exitosamente!');
  console.log('📊 Datos creados:');
  console.log(`   - ${roles.length} roles`);
  console.log(`   - ${estadosUnidad.length} estados de unidad`);
  console.log(`   - ${estadosTicket.length} estados de tickets de abastecimiento`);
  console.log(`   - ${turnos.length} turnos`);
  console.log(`   - ${tiposFalla.length} tipos de falla`);
  console.log(`   - ${tiposAlerta.length} tipos de alerta`);
  console.log(`   - ${zonas.length} zonas`);
  console.log(`   - ${sedes.length} sedes`);
  console.log(`   - ${grifos.length} grifos`);
  console.log(`   - ${rutas.length} rutas`);
  console.log(`   - ${unidades.length} unidades`);
  console.log(`   - 1 usuario administrador (admin@fuelcontrol.com / admin123)`);
  console.log(`   - 1 conductor de ejemplo (conductor1@fuelcontrol.com / conductor123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });