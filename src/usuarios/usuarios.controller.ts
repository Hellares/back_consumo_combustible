import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UsuarioWithRolesResponseDto } from 'src/roles/dto/create-role.dto';
import { AsignarRolDto, RevocarRolDto, RolAsignadoResponseDto } from './dto/asignar-rol.dto';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { JwtPermissionsGuard } from 'src/auth/jwt/jwt-permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Controller('user')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

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
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get('admin/export')
  @UseGuards(JwtAuthGuard, JwtPermissionsGuard)
  @Permissions({ resource: 'usuarios', actions: ['export'] })
  @ApiOperation({ summary: 'Exportar datos de usuarios (requiere permiso específico)' })
  @ApiResponse({
    status: 200,
    description: 'Datos de usuarios exportados exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para exportar datos de usuarios',
  })
  async exportUsers(@Query() paginationDto: PaginationDto) {
    // Ejemplo: solo usuarios con rol ADMIN pueden exportar
    return {
      message: 'Exportación de usuarios realizada exitosamente',
      data: await this.usuariosService.findAll(paginationDto)
    };
  }

 

  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.USER)
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.usuariosService.findAll(paginationDto);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Obtener usuario por ID con sus roles asignados' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario con roles encontrado exitosamente',
    type: UsuarioWithRolesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findOneWithRoles(@Param('id', ParseIntPipe) id: number): Promise<UsuarioWithRolesResponseDto> {
    return this.usuariosService.findOneWithRoles(id);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Asignar un rol adicional a un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 201,
    description: 'Rol asignado exitosamente',
    type: RolAsignadoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o rol no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene este rol asignado o conflicto de estado',
  })
  async asignarRol(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Body() asignarRolDto: AsignarRolDto,
  ): Promise<RolAsignadoResponseDto> {
    return this.usuariosService.asignarRol(usuarioId, asignarRolDto);
  }
  
  @Delete(':id/roles/:rolId')
  @ApiOperation({ summary: 'Revocar un rol específico de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiParam({ name: 'rolId', description: 'ID del rol a revocar' })
  @ApiResponse({
    status: 200,
    description: 'Rol revocado exitosamente',
    type: RolAsignadoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado o no tiene el rol asignado',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede revocar el último rol del usuario',
  })
  async revocarRol(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Param('rolId', ParseIntPipe) rolId: number,
    @Body() revocarRolDto?: RevocarRolDto,
  ): Promise<RolAsignadoResponseDto> {
    return this.usuariosService.revocarRol(usuarioId, rolId, revocarRolDto);
  }
  
  @Get(':id/roles/historial')
  @ApiOperation({ summary: 'Obtener historial completo de roles de un usuario (activos e inactivos)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Historial de roles obtenido exitosamente',
    type: [RolAsignadoResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getRolesHistorial(
    @Param('id', ParseIntPipe) usuarioId: number,
  ): Promise<RolAsignadoResponseDto[]> {
    return this.usuariosService.getRolesHistorial(usuarioId);
  }
}
