// =============================================
// Interface para providers de GPS
// =============================================

import { LocationData } from './location-data.interface';

/**
 * Interface que deben implementar todos los providers de GPS
 */
export interface IGpsProvider {
  /**
   * Procesar y guardar ubicación
   */
  processLocation(location: LocationData): Promise<ProcessLocationResult>;

  /**
   * Validar que los datos de ubicación son correctos
   */
  validateLocation(location: LocationData): ValidationResult;

  /**
   * Obtener última ubicación de una unidad
   */
  getLastLocation(unidadId: number): Promise<LocationData | null>;

  /**
   * Verificar si una unidad está activa
   */
  isUnitActive(unidadId: number): Promise<boolean>;
}

/**
 * Resultado de procesar una ubicación
 */
export interface ProcessLocationResult {
  success: boolean;
  saved: boolean;          // Si se guardó en BD
  broadcasted: boolean;    // Si se transmitió por WebSocket
  reason?: string;         // Razón si no se procesó
  location?: LocationData;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Configuración del provider híbrido
 */
export interface HybridProviderConfig {
  gpsDeviceTimeoutSeconds: number;  // Tiempo antes de usar fallback (default: 120)
  minPrecisionMeters: number;       // Precisión mínima aceptable (default: 100)
  enableFallback: boolean;          // Habilitar fallback a MOBILE_APP (default: true)
}