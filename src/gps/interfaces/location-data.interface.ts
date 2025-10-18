// =============================================
// Interfaces para datos de ubicación
// =============================================

/**
 * Tipo de proveedor de GPS
 */
export enum GpsProviderType {
  MOBILE_APP = 'MOBILE_APP',                 // App móvil del conductor
  GPS_DEVICE = 'GPS_DEVICE',                 // GPS vehicular genérico
  GPS_DEVICE_OBD = 'GPS_DEVICE_OBD',         // GPS con OBD-II
  GPS_DEVICE_HARDWIRED = 'GPS_DEVICE_HARDWIRED', // GPS cableado permanente
  EXTERNAL_API = 'EXTERNAL_API',             // API externa (Traccar, Wialon, etc.)
}

/**
 * Calidad de señal GPS
 */
export enum GpsSignalQuality {
  EXCELENTE = 'EXCELENTE',  // < 5m precisión
  BUENA = 'BUENA',          // 5-15m precisión
  REGULAR = 'REGULAR',      // 15-30m precisión
  POBRE = 'POBRE',          // > 30m precisión
  SIN_SENAL = 'SIN_SENAL',  // Sin señal
}

/**
 * Interface principal para datos de ubicación
 * Formato interno unificado usado en todo el backend
 */
export interface LocationData {
  // Identificación
  unidadId: number;
  ejecucionId?: number;
  registroTramoId?: number;

  // Coordenadas
  latitud: number;
  longitud: number;
  altitud?: number;
  precision?: number; // en metros

  // Datos del vehículo
  velocidad?: number;  // km/h
  rumbo?: number;      // 0-360 grados
  kilometraje?: number;

  // Timestamp
  fechaHora: Date;

  // Proveedor
  proveedor: GpsProviderType;
  dispositivoId?: string; // IMEI o deviceId
  
  // Estado del dispositivo
  bateria?: number;        // Porcentaje 0-100
  señalGPS?: GpsSignalQuality;

  // Información del dispositivo (para MOBILE_APP)
  appVersion?: string;
  sistemaOperativo?: string;
  modeloDispositivo?: string;

  // Metadata flexible (específico por proveedor)
  metadata?: Record<string, any>;
}

/**
 * Interface para metadata específica de MOBILE_APP
 */
export interface MobileAppMetadata {
  appVersion: string;
  os: string;              // "Android", "iOS"
  osVersion: string;       // "13", "16.4"
  device: string;          // "Samsung Galaxy S21"
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;     // "4G", "5G", "WiFi"
  isFallback?: boolean;    // Si está en modo fallback
  fallbackReason?: string;
}

/**
 * Interface para metadata específica de GPS_DEVICE
 */
export interface GpsDeviceMetadata {
  deviceModel: string;
  imei: string;
  firmwareVersion?: string;
  satellites?: number;     // Número de satélites
  hdop?: number;          // Horizontal Dilution of Precision
  ignitionOn?: boolean;   // Estado del motor
  odometer?: number;      // Odómetro del dispositivo
  fuelLevel?: number;     // Nivel de combustible (si tiene sensor)
  temperature?: number;   // Temperatura (si tiene sensor)
}

/**
 * Estado de tracking de una unidad
 */
export interface TrackingStatus {
  unidadId: number;
  isOnline: boolean;
  lastUpdate: Date;
  proveedor: GpsProviderType;
  tiempoInactivoMinutos: number;
  ultimaUbicacion?: LocationData;
}

/**
 * Respuesta de ubicación actual de unidad
 */
export interface CurrentLocationResponse {
  unidadId: number;
  placa: string;
  ultimaUbicacion: LocationData | null;
  tiempoTranscurrido: number; // segundos desde última actualización
  estado: 'ACTIVO' | 'DETENIDO' | 'INACTIVO';
}

/**
 * Estadísticas de tracking
 */
export interface TrackingStats {
  totalUnidades: number;
  unidadesActivas: number;
  unidadesInactivas: number;
  porcentajeGpsDevice: number;
  porcentajeMobileApp: number;
  precisionPromedio: number;
}