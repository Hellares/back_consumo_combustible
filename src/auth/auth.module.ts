import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/database/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtPermissionsGuard } from './jwt/jwt-permissions.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupTokensTask } from './tasks/cleanup-tokens.task';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any // Access token de corta duración
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtPermissionsGuard, CleanupTokensTask],
  exports: [JwtPermissionsGuard, AuthService],
})
export class AuthModule {}
