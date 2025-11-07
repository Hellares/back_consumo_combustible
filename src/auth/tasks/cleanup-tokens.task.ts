import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CleanupTokensTask {
  private readonly logger = new Logger(CleanupTokensTask.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Limpia tokens expirados y revocados antiguos
   * Se ejecuta diariamente a las 3:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup() {
    this.logger.log('Iniciando limpieza de tokens...');

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Eliminar tokens expirados
      const expiredResult = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: now }
        }
      });

      // Eliminar tokens revocados hace más de 30 días
      const revokedResult = await this.prisma.refreshToken.deleteMany({
        where: {
          revocado: true,
          fechaRevocado: { lt: thirtyDaysAgo }
        }
      });

      this.logger.log(
        `Limpieza completada: ${expiredResult.count} tokens expirados eliminados, ` +
        `${revokedResult.count} tokens revocados antiguos eliminados`
      );
    } catch (error) {
      this.logger.error('Error durante la limpieza de tokens:', error);
    }
  }

  /**
   * Limpieza manual de tokens (puede ser llamado desde un endpoint admin)
   */
  async manualCleanup(): Promise<{ 
    success: boolean; 
    expiredDeleted: number; 
    revokedDeleted: number 
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const expiredResult = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });

    const revokedResult = await this.prisma.refreshToken.deleteMany({
      where: {
        revocado: true,
        fechaRevocado: { lt: thirtyDaysAgo }
      }
    });

    return {
      success: true,
      expiredDeleted: expiredResult.count,
      revokedDeleted: revokedResult.count
    };
  }
}