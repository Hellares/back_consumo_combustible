import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsuarioResponseDto } from 'src/usuarios/dto/usuario-response.dto';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
    login(@Body() loginData: LoginAuthDto ){
      return this.authService.login(loginData);
    }

    @Post()
      @ApiOperation({ summary: 'Crear un nuevo usuario' })
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
      async create(@Body() createUsuarioDto: CreateUsuarioDto) {
        return this.authService.create(createUsuarioDto);
      }

  }
