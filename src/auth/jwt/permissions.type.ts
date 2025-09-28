// Tipos para el sistema de permisos
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';

export type PermissionResource = 'usuarios' | 'unidades' | 'abastecimientos' | 'reportes' | 'configuracion' | 'mantenimientos' | 'fallas' | 'inspecciones';

export interface Permission {
  [resource: string]: PermissionAction[];
}

export interface UserPermissions {
  [resource: string]: PermissionAction[];
}