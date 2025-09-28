import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { CreateRolDto, PermisosDto, RolResponseDto, UsuarioWithRolesResponseDto } from './dto/create-role.dto';
import { UpdateRolDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolService: RolesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: RolResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un rol con este nombre',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - No tienes permisos para acceder a este recurso',
  })
  async create(@Body() createRolDto: CreateRolDto): Promise<RolResponseDto> {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, JwtRolesGuard)
  @HasRoles(JwtRole.ADMIN, JwtRole.SUPERVISOR)
  @ApiOperation({ summary: 'Obtener lista de roles con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad por página', example: 10 })
  @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo', type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('activo') activo?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const activoBoolean = activo !== undefined ? activo === 'true' : undefined;
    
    return this.rolService.findAll(pageNum, limitNum, activoBoolean);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener solo roles activos (sin paginación)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles activos obtenida exitosamente',
    type: [RolResponseDto],
  })
  async getRolesActivos(): Promise<RolResponseDto[]> {
    return this.rolService.getRolesActivos();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar roles por texto' })
  @ApiQuery({ name: 'q', required: true, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad por página', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
  })
  async search(
    @Query('q') searchTerm: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.rolService.searchRoles(searchTerm, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    type: RolResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RolResponseDto> {
    return this.rolService.findOne(id);
  }

  @Get(':id/permisos')
  @ApiOperation({ summary: 'Obtener permisos de un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Permisos del rol obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async getPermissions(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.rolService.getPermissions(id);
  }

  
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: RolResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con nombre duplicado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ): Promise<RolResponseDto> {
    return this.rolService.update(id, updateRolDto);
  }

  @Patch(':id/permisos')
  @ApiOperation({ summary: 'Actualizar permisos de un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Permisos actualizados exitosamente',
    type: RolResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() permisos: PermisosDto,
  ): Promise<RolResponseDto> {
    return this.rolService.updatePermissions(id, permisos);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol desactivado exitosamente',
    type: RolResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede desactivar porque tiene usuarios asignados',
  })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<RolResponseDto> {
    return this.rolService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol activado exitosamente',
    type: RolResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<RolResponseDto> {
    return this.rolService.activate(id);
  }
}