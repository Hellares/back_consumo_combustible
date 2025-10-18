// =============================================
// Eventos de WebSocket para tracking
// =============================================

import { LocationData, TrackingStatus } from './location-data.interface';

/**
 * Nombres de eventos WebSocket
 */
export enum TrackingEvents {
  // Eventos del cliente al servidor
  LOCATION_UPDATE = 'location:update',
  SUBSCRIBE_TRACKING = 'tracking:subscribe',
  UNSUBSCRIBE_TRACKING = 'tracking:unsubscribe',
  SUBSCRIBE_UNIT = 'unit:subscribe',
  UNSUBSCRIBE_UNIT = 'unit:unsubscribe',
  REQUEST_STATUS = 'status:request',

  // Eventos del servidor al cliente
  LOCATION_BROADCAST = 'location:broadcast',
  STATUS_UPDATE = 'status:update',
  UNIT_ONLINE = 'unit:online',
  UNIT_OFFLINE = 'unit:offline',
  GPS_DEVICE_ACTIVE = 'gps:device:active',
  GPS_DEVICE_INACTIVE = 'gps:device:inactive',
  CONNECTION_STATUS = 'connection:status',
  ERROR = 'error',
}

/**
 * Payload para location:update
 */
export interface LocationUpdatePayload {
  unidadId: number;
  latitud: number;
  longitud: number;
  altitud?: number;
  precision?: number;
  velocidad?: number;
  rumbo?: number;
  kilometraje?: number;
  fechaHora?: string; // ISO 8601 timestamp opcional
  proveedor: string;
  dispositivoId?: string;
  bateria?: number;
  señalGPS?: string;
  appVersion?: string;
  sistemaOperativo?: string;
  modeloDispositivo?: string;
  metadata?: Record<string, any>;
}

/**
 * Payload para location:broadcast
 */
export interface LocationBroadcastPayload {
  unidadId: number;
  placa: string;
  location: LocationData;
  conductor?: {
    id: number;
    nombreCompleto: string;
  };
}

/**
 * Payload para tracking:subscribe
 */
export interface SubscribeTrackingPayload {
  zonaId?: number;      // Suscribirse a una zona específica
  unidadesIds?: number[]; // Suscribirse a unidades específicas
  all?: boolean;        // Suscribirse a todas las unidades
}

/**
 * Payload para unit:subscribe
 */
export interface SubscribeUnitPayload {
  unidadId: number;
}

/**
 * Payload para status:update
 */
export interface StatusUpdatePayload {
  unidadId: number;
  status: TrackingStatus;
}

/**
 * Payload para gps:device:active/inactive
 */
export interface GpsDeviceStatusPayload {
  unidadId: number;
  isActive: boolean;
  proveedor: string;
  dispositivoId?: string;
}

/**
 * Payload para errores
 */
export interface ErrorPayload {
  event: string;
  message: string;
  code?: string;
  details?: any;
}