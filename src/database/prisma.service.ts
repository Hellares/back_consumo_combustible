import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'colorless',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Manejar eventos de log
    this.$on('error' as never, (e: any) => {
      this.logger.error('Prisma Error:', e);
      this.handleConnectionError(e);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn('Prisma Warning:', e);
    });

    this.$on('query' as never, (e: any) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
      }
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
      this.reconnectAttempts = 0;
      
      // Configurar health check periódico
      this.startHealthCheck();
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Maneja errores de conexión y reintenta conectar si es necesario
   */
  private async handleConnectionError(error: any) {
    const errorMessage = error?.message || '';
    
    // Detectar errores de conexión
    if (
      errorMessage.includes('Connection') ||
      errorMessage.includes('ECONNRESET') ||
      errorMessage.includes('10054') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')
    ) {
      this.logger.warn(`Connection error detected. Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        await this.reconnect();
      } else {
        this.logger.error('Max reconnection attempts reached');
        this.reconnectAttempts = 0;
      }
    }
  }

  /**
   * Reintenta la conexión a la base de datos
   */
  private async reconnect() {
    try {
      await this.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 1000 * this.reconnectAttempts));
      await this.$connect();
      this.logger.log('Reconnected to database successfully');
      this.reconnectAttempts = 0;
    } catch (error) {
      this.logger.error('Reconnection failed:', error);
    }
  }

  /**
   * Health check periódico para mantener la conexión activa
   */
  private startHealthCheck() {
    setInterval(async () => {
      try {
        await this.$queryRaw`SELECT 1`;
      } catch (error) {
        this.logger.warn('Health check failed, attempting reconnection');
        await this.handleConnectionError(error);
      }
    }, 30000); // Cada 30 segundos
  }

  /**
   * Ejecuta una query con retry automático en caso de error de conexión
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || '';
        
        // Solo reintentar en errores de conexión
        if (
          errorMessage.includes('Connection') ||
          errorMessage.includes('ECONNRESET') ||
          errorMessage.includes('10054') ||
          errorMessage.includes('timeout')
        ) {
          this.logger.warn(`Query failed (attempt ${attempt}/${maxRetries}), retrying...`);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            await this.reconnect();
          }
        } else {
          // Si no es error de conexión, lanzar inmediatamente
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  // Métodos de utilidad para transacciones
  async executeTransaction<T>(
    operations: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(operations);
  }

  // Método helper para logging de queries (reemplaza el middleware)
  private logQuery(model: string, action: string, startTime: number) {
    const duration = Date.now() - startTime;
    console.log(`Query ${model}.${action} took ${duration}ms`);
  }

  // Wrapper methods con logging y auto-update de updatedAt
  async updateWithLog(model: string, args: any) {
    const startTime = Date.now();
    
    // Auto-agregar updatedAt
    if (args.data && typeof args.data === 'object') {
      args.data.updatedAt = new Date();
    }

    const result = await this[model].update(args);
    this.logQuery(model, 'update', startTime);
    return result;
  }

  async updateManyWithLog(model: string, args: any) {
    const startTime = Date.now();
    
    // Auto-agregar updatedAt
    if (args.data && typeof args.data === 'object') {
      args.data.updatedAt = new Date();
    }

    const result = await this[model].updateMany(args);
    this.logQuery(model, 'updateMany', startTime);
    return result;
  }

  // Método para limpiar la base de datos (solo para testing)
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase solo puede ejecutarse en entorno de test');
    }

    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        } catch (error) {
          console.log({ error });
        }
      }
    }
  }

  // Métodos de utilidad para validaciones comunes
  async isUniqueField(
    model: string,
    field: string,
    value: any,
    excludeId?: number
  ): Promise<boolean> {
    const where = { [field]: value };
    if (excludeId) {
      where['id'] = { not: excludeId };
    }

    const count = await this[model].count({ where });
    return count === 0;
  }

  // Método para verificar si un precinto ya fue usado
  // async isPrecintoDuplicado(precinto: string, excludeId?: number): Promise<boolean> {
  //   const where = {
  //     OR: [
  //       { precintoNuevo: precinto },
  //       { precinto2: precinto },
  //       { precintoAnterior: precinto },
  //     ],
  //   };

  //   if (excludeId) {
  //     where['id'] = { not: excludeId };
  //   }

  //   const count = await this.abastecimiento.count({ where });
  //   return count > 0;
  // }

  // Método para obtener el último kilometraje de una unidad
  // async getUltimoKilometrajeUnidad(unidadId: number): Promise<number | null> {
  //   const ultimoAbastecimiento = await this.abastecimiento.findFirst({
  //     where: { unidadId },
  //     orderBy: { fecha: 'desc' },
  //     select: { kilometrajeActual: true },
  //   });

  //   return ultimoAbastecimiento?.kilometrajeActual?.toNumber() || null;
  // }

  // Método para obtener el estado actual de una unidad
  async getEstadoActualUnidad(unidadId: number): Promise<string> {
    const ultimoEstado = await this.historialEstadoUnidad.findFirst({
      where: { unidadId },
      orderBy: { fechaCambio: 'desc' },
      include: { estadoNuevo: true },
    });

    return ultimoEstado?.estadoNuevo.nombre || 'OPERATIVO';
  }

  // Método para validar coherencia de kilometraje
  // async validarKilometrajeCoherente(
  //   unidadId: number,
  //   kilometrajeNuevo: number,
  //   excludeId?: number
  // ): Promise<{ esValido: boolean; ultimoKilometraje?: number }> {
  //   const where = { unidadId };
  //   if (excludeId) {
  //     where['id'] = { not: excludeId };
  //   }

  //   const ultimoAbastecimiento = await this.abastecimiento.findFirst({
  //     where,
  //     orderBy: { fecha: 'desc' },
  //     select: { kilometrajeActual: true },
  //   });

  //   const ultimoKilometraje = ultimoAbastecimiento?.kilometrajeActual?.toNumber();
    
  //   if (!ultimoKilometraje) {
  //     return { esValido: true };
  //   }

  //   return {
  //     esValido: kilometrajeNuevo >= ultimoKilometraje,
  //     ultimoKilometraje,
  //   };
  // }

  // Método para calcular consumo promedio
  // async calcularConsumoPromedio(
  //   unidadId: number,
  //   diasAtras: number = 30
  // ): Promise<number | null> {
  //   const fechaInicio = new Date();
  //   fechaInicio.setDate(fechaInicio.getDate() - diasAtras);

  //   const abastecimientos = await this.abastecimiento.findMany({
  //     where: {
  //       unidadId,
  //       fecha: { gte: fechaInicio },
  //       estadoId: 2, // Solo aprobados
  //       kilometrajeAnterior: { not: null },
  //     },
  //     orderBy: { fecha: 'asc' },
  //   });

  //   if (abastecimientos.length < 2) return null;

  //   let totalCombustible = 0;
  //   let totalKilometros = 0;

  //   for (const abastecimiento of abastecimientos) {
  //     totalCombustible += abastecimiento.cantidad.toNumber();
  //     if (abastecimiento.kilometrajeAnterior) {
  //       totalKilometros += 
  //         abastecimiento.kilometrajeActual.toNumber() - 
  //         abastecimiento.kilometrajeAnterior.toNumber();
  //     }
  //   }

  //   return totalKilometros > 0 ? totalCombustible / totalKilometros : null;
  // }

  // Método para obtener alertas pendientes de una unidad
  async getAlertasPendientesUnidad(unidadId: number) {
    return this.alerta.findMany({
      where: {
        unidadId,
        estado: 'PENDIENTE',
      },
      include: {
        tipoAlerta: true,
      },
      orderBy: {
        fechaAlerta: 'desc',
      },
    });
  }

  // Método para verificar si una unidad puede operar
  async puedeOperarUnidad(unidadId: number): Promise<boolean> {
    const estadoActual = await this.getEstadoActualUnidad(unidadId);
    
    const estadoInfo = await this.estadoUnidad.findUnique({
      where: { nombre: estadoActual },
    });

    return estadoInfo?.permiteOperacion ?? false;
  }
}