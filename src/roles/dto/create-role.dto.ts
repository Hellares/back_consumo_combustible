// =============================================
// DTOs para Rol
// =============================================

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsObject,
  MaxLength,
  IsNotEmpty,
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioResponseDto } from 'src/usuarios/dto/usuario-response.dto';

// DTO para definir la estructura de permisos
export class PermisosDto {
  @ApiPropertyOptional({
    description: 'Permisos de usuarios',
    example: {
      crear: true,
      leer: true,
      actualizar: true,
      eliminar: false
    }
  })
  @IsOptional()
  @IsObject()
  usuarios?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Permisos de unidades',
    example: {
      crear: true,
      leer: true,
      actualizar: true,
      eliminar: false,
      asignarConductor: true
    }
  })
  @IsOptional()
  @IsObject()
  unidades?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
    asignarConductor?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Permisos de abastecimientos',
    example: {
      crear: true,
      leer: true,
      actualizar: false,
      eliminar: false,
      aprobar: true,
      rechazar: true
    }
  })
  @IsOptional()
  @IsObject()
  abastecimientos?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
    aprobar?: boolean;
    rechazar?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Permisos de mantenimientos',
    example: {
      crear: true,
      leer: true,
      actualizar: true,
      programar: true
    }
  })
  @IsOptional()
  @IsObject()
  mantenimientos?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    programar?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Permisos de reportes',
    example: {
      ver: true,
      exportar: false,
      configurar: false
    }
  })
  @IsOptional()
  @IsObject()
  reportes?: {
    ver?: boolean;
    exportar?: boolean;
    configurar?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Permisos fallas tecnicas',
    example: {
      configurarSistema: false,
      gestionarRoles: false,
      verAuditoria: false
    }
  })
  @IsOptional()
  @IsObject()
  fallas?: {
    crear?: boolean;
    leer?: boolean;
    actualizar?: boolean;
    eliminar?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Permisos administrativos',
    example: {
      configurarSistema: false,
      gestionarRoles: true,
      verAuditoria: false
    }
  })
  @IsOptional()
  @IsObject()
  administrativo?: {
    configurarSistema?: boolean;
    gestionarRoles?: boolean;
    verAuditoria?: boolean;
  };
}

export class CreateRolDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'Supervisor de Flota',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Encargado de supervisar las operaciones de la flota de vehículos'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Permisos del rol en formato JSON',
    type: PermisosDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PermisosDto)
  permisos?: PermisosDto;

  @ApiPropertyOptional({
    description: 'Estado activo del rol',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}



export class RolResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiPropertyOptional()
  descripcion?: string;

  @ApiPropertyOptional()
  permisos?: any;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Cantidad de usuarios asignados a este rol'
  })
  usuariosCount?: number;
}

export class UsuarioWithRolesResponseDto extends UsuarioResponseDto {
  @ApiProperty({
    description: 'Roles asignados al usuario',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        fechaAsignacion: { type: 'string', format: 'date-time' },
        rol: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            permisos: { type: 'object' }
          }
        }
      }
    }
  })
  roles: {
    // id: number;
    fechaAsignacion: Date;
    rol: {
      id: number;
      nombre: string;
      descripcion?: string;
      permisos?: any;
    };
  }[];
}
