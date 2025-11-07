import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsuarioResponseDto } from 'src/usuarios/dto/usuario-response.dto';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    type: TokensResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado o inactivo',
  })
  async login(
    @Body() loginData: LoginAuthDto,
    @Req() request: Request
  ) {
    const metadata = {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
      dispositivoId: request.headers['x-device-id'] as string
    };
    
    return this.authService.login(loginData, metadata);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar tokens usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente',
    type: TokensResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, revocado o expirado',
  })
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
    @Req() request: Request
  ) {
    const metadata = {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
      dispositivoId: request.headers['x-device-id'] as string
    };
    
    return this.authService.refreshTokens(refreshDto.refreshToken, metadata);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión actual' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Refresh token no encontrado o ya revocado',
  })
  async logout(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.logout(refreshDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout-all')
  @ApiOperation({ summary: 'Cerrar todas las sesiones del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Todas las sesiones han sido cerradas',
  })
  async logoutAll(@CurrentUser() user: any) {
    await this.authService.revokeAllUserTokens(user.id, 'Logout de todas las sesiones');
    return {
      success: true,
      message: 'Todas las sesiones han sido cerradas exitosamente'
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UsuarioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un usuario con email, DNI o código de empleado duplicado',
  })
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.create(createUsuarioDto);
  }
}
