// =============================================
// GPS WebSocket Gateway - Tracking en Tiempo Real
// =============================================

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GpsService } from './gps.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { CreateLocationDto } from './dto/create-location.dto';
import {
  TrackingEvents,
  LocationUpdatePayload,
  LocationBroadcastPayload,
  SubscribeTrackingPayload,
  SubscribeUnitPayload,
  StatusUpdatePayload,
  GpsDeviceStatusPayload,
  ErrorPayload,
} from './interfaces/tracking-events.interface';
import { GpsProviderType } from './interfaces/location-data.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';

/**
 * Información del cliente conectado
 */
interface ClientInfo {
  userId: number;
  userDni: string;
  roles: string[];
  unidadAsignada?: number | null;
  connectedAt: Date;
}

/**
 * Gateway WebSocket para tracking GPS en tiempo real
 * 
 * Características:
 * - Autenticación JWT obligatoria
 * - Rooms por rol (conductores, admins)
 * - Rooms por zona geográfica
 * - Rooms por unidad específica
 * - Broadcasting selectivo según permisos
 */
// @UseGuards(WsJwtGuard)
// @WebSocketGateway({
//   namespace: '/gps',
//   cors: {
//     origin: process.env.CORS_ORIGIN?.split(',') || '*',
//     credentials: true,
//   },
//   transports: ['websocket', 'polling'], // Soportar ambos
// })
@WebSocketGateway({
  namespace: '/gps',
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];

      // Permitir requests sin origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Verificar si el origin está permitido
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // Soportar ambos
  pingTimeout: 60000, // ✅ NUEVO: timeout más largo
  pingInterval: 25000, // ✅ NUEVO: keep-alive
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true, // Compatibilidad con clientes antiguos
})
export class GpsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GpsGateway.name);

  // Map de clientes conectados
  private readonly connectedClients = new Map<string, ClientInfo>();

  // Configuración
  private readonly BATCH_SIZE = 15;
  private readonly BATCH_INTERVAL_MS = 5000;
  private locationBatchQueue: Map<number, LocationBroadcastPayload[]> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly gpsService: GpsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.logger.log('🔌 GPS WebSocket Gateway inicializado');
    this.logger.log('📡 Namespace: /gps');
  }

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================

  afterInit(server: Server) {
    this.logger.log('🔌 GPS WebSocket Gateway inicializado en namespace: /gps');

    // Iniciar timer de batch broadcasting
    this.startBatchTimer();
  }

  /**
   * Cleanup al destruir el gateway
   */
  onModuleDestroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
      this.logger.log('⏱️ Timer de batch detenido');
    }
  }


  async handleConnection(client: Socket) {
    this.logger.log(`🔌 [Gateway] Cliente intentando conectar: ${client.id}`);
    this.logger.debug(`🔍 [Gateway] IP: ${client.handshake.address}`);
    this.logger.debug(`🔍 [Gateway] User-Agent: ${client.handshake.headers['user-agent']}`);

    try {
      // 🔥 AUTENTICACIÓN MANUAL
      const token = this.extractTokenFromHandshake(client);

      this.logger.debug(`🔍 [Gateway] Token recibido: ${token ? 'SÍ' : 'NO'}`);

      if (!token) {
        this.logger.error(`❌ [Gateway] No hay token`);
        client.emit('error', { message: 'Token no proporcionado' });
        client.disconnect();
        return;
      }

      this.logger.debug(`🔑 [Gateway] Token preview: ${token.substring(0, 30)}...`);

      // Verificar token
      this.logger.debug(`🔐 [Gateway] Verificando token...`);

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ [Gateway] Token válido - User ID: ${payload.id}`);
      this.logger.debug(`🔐 [Gateway] Payload:`, payload);

      // Obtener usuario completo de la BD
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.id },
        include: {
          roles: {
            include: {
              rol: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.error(`❌ [Gateway] Usuario no encontrado: ${payload.id}`);
        client.emit('error', { message: 'Usuario no encontrado' });
        client.disconnect();
        return;
      }

      this.logger.log(`✅ [Gateway] Usuario encontrado: ${user.dni} (${user.nombres})`);

      // Guardar información del cliente
      const clientInfo: ClientInfo = {
        userId: user.id,
        userDni: user.dni,
        roles: user.roles?.map(ur => ur.rol.nombre) || [],
        unidadAsignada: user.unidadAsignada,
        connectedAt: new Date(),
      };

      this.connectedClients.set(client.id, clientInfo);

      // Guardar en client.data
      client.data.user = {
        id: user.id,
        dni: user.dni,
        nombres: user.nombres,
        apellidoPaterno: user.apellidos,
        roles: user.roles?.map(ur => ({
          id: ur.rol.id,
          nombre: ur.rol.nombre,
        })),
        unidadAsignada: user.unidadAsignada ?? null,
      };

      // Unir a rooms según rol
      this.joinRoomsByRole(client, clientInfo);

      // Log de conexión exitosa
      this.logger.log(
        `✅ [Gateway] Cliente conectado exitosamente: ${client.id} | ` +
        `Usuario: ${clientInfo.userDni} | ` +
        `Roles: ${clientInfo.roles.join(', ')}`
      );

      // ✅ ORDEN CORRECTO: Primero connection:status, luego authenticated
      this.logger.log(
        `✅ [Gateway] Cliente autenticado exitosamente: ${client.id} | Usuario: ${clientInfo.userDni}`
      );

      // 1️⃣ Emitir estado de conexión (para compatibilidad)
      client.emit(TrackingEvents.CONNECTION_STATUS, {
        connected: true,
        userId: clientInfo.userId,
        roles: clientInfo.roles,
        timestamp: new Date().toISOString(),
      });

      // 2️⃣ Emitir evento de autenticación completada (SEÑAL PARA SUSCRIBIRSE)
      client.emit('authenticated', {
        success: true,
        userId: clientInfo.userId,
        dni: clientInfo.userDni,
        roles: clientInfo.roles,
        unidadAsignada: clientInfo.unidadAsignada,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `🎯 [Gateway] Eventos de autenticación emitidos - Cliente listo para suscripciones`
      );

      // Si es conductor con unidad asignada, notificar que está online
      if (clientInfo.unidadAsignada) {
        this.server.emit(TrackingEvents.UNIT_ONLINE, {
          unidadId: clientInfo.unidadAsignada,
          conductorId: clientInfo.userId,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      this.logger.error(`❌ [Gateway] Error en conexión: ${error.message}`);
      this.logger.error(`❌ [Gateway] Stack:`, error.stack);

      if (error.name === 'TokenExpiredError') {
        client.emit('error', { message: 'Token expirado' });
      } else if (error.name === 'JsonWebTokenError') {
        client.emit('error', { message: 'Token inválido' });
      } else {
        client.emit('error', { message: 'Error de autenticación' });
      }

      client.disconnect();
    }
  }

  // ==========================================
  // EXTRACCIÓN DE TOKEN
  // ==========================================

  private extractTokenFromHandshake(client: Socket): string | null {
    this.logger.debug(`🔍 [Gateway] Buscando token...`);
    this.logger.debug(`🔍 [Gateway] handshake.auth:`, client.handshake.auth);
    this.logger.debug(`🔍 [Gateway] handshake.headers.authorization:`, client.handshake.headers?.authorization);
    this.logger.debug(`🔍 [Gateway] handshake.query.token:`, client.handshake.query?.token);

    // 1. Desde handshake.auth (usado por Flutter)
    const tokenFromAuth = client.handshake.auth?.token;
    if (tokenFromAuth) {
      this.logger.debug(`✅ [Gateway] Token encontrado en auth`);
      return tokenFromAuth;
    }

    // 2. Desde headers Authorization
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      this.logger.debug(`✅ [Gateway] Token encontrado en headers`);
      return authHeader.substring(7);
    }

    // 3. Desde query params
    const tokenFromQuery = client.handshake.query?.token as string;
    if (tokenFromQuery) {
      this.logger.debug(`✅ [Gateway] Token encontrado en query`);
      return tokenFromQuery;
    }

    this.logger.warn(`❌ [Gateway] Token no encontrado`);
    return null;
  }

  // ==========================================
  // ROOMS POR ROL
  // ==========================================

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);

    if (clientInfo) {
      this.logger.log(
        `👋 [Gateway] Cliente desconectado: ${client.id} | ` +
        `Usuario: ${clientInfo.userDni}`
      );

      // Si tenía unidad asignada, notificar que está offline
      if (clientInfo.unidadAsignada) {
        this.server.emit(TrackingEvents.UNIT_OFFLINE, {
          unidadId: clientInfo.unidadAsignada,
          conductorId: clientInfo.userId,
          timestamp: new Date().toISOString(),
        });
      }

      this.connectedClients.delete(client.id);
    } else {
      this.logger.log(`👋 [Gateway] Cliente desconectado: ${client.id}`);
    }
  }

  // ==========================================
  // EVENTOS DEL CLIENTE → SERVIDOR
  // ==========================================

  /**
   * Recibir actualización de ubicación desde cliente
   */
  @SubscribeMessage(TrackingEvents.LOCATION_UPDATE)
  async handleLocationUpdate(
    @MessageBody() payload: LocationUpdatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);

      if (!clientInfo) {
        throw new WsException('Cliente no autenticado');
      }

      // Validar que el cliente puede enviar ubicación de esta unidad
      if (!this.canUpdateLocation(clientInfo, payload.unidadId)) {
        throw new WsException('No tienes permiso para enviar ubicación de esta unidad');
      }

      // Convertir payload a DTO
      const locationDto: CreateLocationDto = {
        unidadId: payload.unidadId,
        latitud: payload.latitud,
        longitud: payload.longitud,
        altitud: payload.altitud,
        precision: payload.precision,
        velocidad: payload.velocidad,
        rumbo: payload.rumbo,
        kilometraje: payload.kilometraje,
        fechaHora: payload.fechaHora || new Date().toISOString(),
        proveedor: payload.proveedor as GpsProviderType,
        dispositivoId: payload.dispositivoId,
        bateria: payload.bateria,
        señalGPS: payload.señalGPS as any,
        appVersion: payload.appVersion,
        sistemaOperativo: payload.sistemaOperativo,
        modeloDispositivo: payload.modeloDispositivo,
        metadata: payload.metadata,
      };

      // Guardar en base de datos
      const savedLocation = await this.gpsService.createLocation(locationDto);

      // Preparar payload para broadcast
      const broadcastPayload: LocationBroadcastPayload = {
        unidadId: payload.unidadId,
        placa: '', // Se completará desde BD si es necesario
        location: {
          unidadId: savedLocation.unidadId,
          latitud: savedLocation.latitud,
          longitud: savedLocation.longitud,
          altitud: savedLocation.altitud,
          precision: savedLocation.precision,
          velocidad: savedLocation.velocidad,
          rumbo: savedLocation.rumbo,
          kilometraje: savedLocation.kilometraje,
          fechaHora: new Date(savedLocation.fechaHora),
          proveedor: savedLocation.proveedor,
          dispositivoId: savedLocation.dispositivoId,
          bateria: savedLocation.bateria,
          señalGPS: savedLocation.señalGPS,
          appVersion: savedLocation.appVersion,
          sistemaOperativo: savedLocation.sistemaOperativo,
          modeloDispositivo: savedLocation.modeloDispositivo,
          metadata: savedLocation.metadata,
        },
      };

      // Agregar a cola de batch (optimización)
      this.addToBatchQueue(broadcastPayload);

      // Confirmar recepción al cliente
      client.emit('location:ack', {
        unidadId: payload.unidadId,
        timestamp: savedLocation.fechaHora,
        saved: true,
      });

      this.logger.debug(
        `📍 Ubicación recibida: Unidad ${payload.unidadId} | ` +
        `${payload.proveedor} | Lat: ${payload.latitud.toFixed(6)}, Lng: ${payload.longitud.toFixed(6)}`
      );

    } catch (error) {
      this.logger.error(`❌ Error procesando ubicación: ${error.message}`);

      const errorPayload: ErrorPayload = {
        event: TrackingEvents.LOCATION_UPDATE,
        message: error.message,
        code: 'LOCATION_UPDATE_ERROR',
      };

      client.emit(TrackingEvents.ERROR, errorPayload);
    }
  }

  /**
   * Suscribirse a actualizaciones de tracking
   */
  @SubscribeMessage(TrackingEvents.SUBSCRIBE_TRACKING)
  async handleSubscribeTracking(
    @MessageBody() payload: SubscribeTrackingPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);

      if (!clientInfo) {
        this.logger.error(`❌ [Gateway] Cliente no autenticado intentando suscribirse: ${client.id}`);
        throw new WsException('Cliente no autenticado');
      }

      this.logger.log(
        `📡 [Gateway] Solicitud de suscripción recibida | ` +
        `Cliente: ${client.id} | Usuario: ${clientInfo.userDni}`
      );

      // Validar permisos
      if (!this.hasTrackingPermissions(clientInfo)) {
        this.logger.warn(
          `⚠️ [Gateway] Usuario sin permisos de tracking: ${clientInfo.userDni} | ` +
          `Roles: ${clientInfo.roles.join(', ')}`
        );
        throw new WsException('No tienes permisos para ver tracking');
      }

      // Unir a rooms según suscripción
      const roomsJoined: string[] = [];

      if (payload.all) {
        client.join('tracking:all');
        roomsJoined.push('tracking:all');
        this.logger.log(`✅ [Gateway] ${clientInfo.userDni} → room: tracking:all`);
      }

      if (payload.zonaId) {
        const zonaRoom = `zona:${payload.zonaId}`;
        client.join(zonaRoom);
        roomsJoined.push(zonaRoom);
        this.logger.log(`✅ [Gateway] ${clientInfo.userDni} → room: ${zonaRoom}`);
      }

      if (payload.unidadesIds && payload.unidadesIds.length > 0) {
        payload.unidadesIds.forEach(unidadId => {
          const unidadRoom = `unidad:${unidadId}`;
          client.join(unidadRoom);
          roomsJoined.push(unidadRoom);
        });
        this.logger.log(
          `✅ [Gateway] ${clientInfo.userDni} → rooms: ${payload.unidadesIds.map(id => `unidad:${id}`).join(', ')}`
        );
      }

      // Emitir confirmación
      client.emit('tracking:subscribed', {
        success: true,
        subscriptions: payload,
        rooms: roomsJoined,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `🎯 [Gateway] Suscripción completada exitosamente | ` +
        `Usuario: ${clientInfo.userDni} | ` +
        `Rooms: ${roomsJoined.length} | ` +
        `Total clientes conectados: ${this.connectedClients.size}`
      );

    } catch (error) {
      this.logger.error(`❌ [Gateway] Error en suscripción: ${error.message}`);
      this.logger.error(`❌ [Gateway] Stack: ${error.stack}`);
      
      client.emit(TrackingEvents.ERROR, {
        event: TrackingEvents.SUBSCRIBE_TRACKING,
        message: error.message,
        code: 'SUBSCRIPTION_ERROR',
      });
    }
  }

  /**
   * Desuscribirse de tracking
   */
  @SubscribeMessage(TrackingEvents.UNSUBSCRIBE_TRACKING)
  async handleUnsubscribeTracking(
    @MessageBody() payload: SubscribeTrackingPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (payload.all) {
        client.leave('tracking:all');
      }

      if (payload.zonaId) {
        client.leave(`zona:${payload.zonaId}`);
      }

      if (payload.unidadesIds) {
        payload.unidadesIds.forEach(unidadId => {
          client.leave(`unidad:${unidadId}`);
        });
      }

      client.emit('tracking:unsubscribed', {
        success: true,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`❌ Error en desuscripción: ${error.message}`);
    }
  }

  /**
   * Suscribirse a una unidad específica
   */
  @SubscribeMessage(TrackingEvents.SUBSCRIBE_UNIT)
  async handleSubscribeUnit(
    @MessageBody() payload: SubscribeUnitPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);

      if (!clientInfo) {
        throw new WsException('Cliente no autenticado');
      }

      // Validar permisos
      if (!this.canViewUnit(clientInfo, payload.unidadId)) {
        throw new WsException('No tienes permisos para ver esta unidad');
      }

      client.join(`unidad:${payload.unidadId}`);

      this.logger.debug(
        `👀 ${clientInfo.userDni} se suscribió a unidad ${payload.unidadId}`
      );

      // Enviar estado actual de la unidad
      const status = await this.gpsService.getTrackingStatus(payload.unidadId);

      client.emit(TrackingEvents.STATUS_UPDATE, {
        unidadId: payload.unidadId,
        status,
      } as StatusUpdatePayload);

    } catch (error) {
      this.logger.error(`❌ Error suscribiendo a unidad: ${error.message}`);
      client.emit(TrackingEvents.ERROR, {
        event: TrackingEvents.SUBSCRIBE_UNIT,
        message: error.message,
      });
    }
  }

  /**
   * Solicitar estado actual de unidad
   */
  @SubscribeMessage(TrackingEvents.REQUEST_STATUS)
  async handleRequestStatus(
    @MessageBody() payload: { unidadId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const clientInfo = this.connectedClients.get(client.id);

      if (!clientInfo || !this.canViewUnit(clientInfo, payload.unidadId)) {
        throw new WsException('No autorizado');
      }

      const status = await this.gpsService.getTrackingStatus(payload.unidadId);

      client.emit(TrackingEvents.STATUS_UPDATE, {
        unidadId: payload.unidadId,
        status,
      } as StatusUpdatePayload);

    } catch (error) {
      this.logger.error(`❌ Error obteniendo estado: ${error.message}`);
    }
  }

  // ==========================================
  // BROADCASTING (SERVIDOR → CLIENTES)
  // ==========================================

  /**
   * Broadcast de ubicación a clientes suscritos
   */
  private broadcastLocation(payload: LocationBroadcastPayload) {
    // Emitir a diferentes rooms
    this.server.to('tracking:all').emit(TrackingEvents.LOCATION_BROADCAST, payload);
    this.server.to(`unidad:${payload.unidadId}`).emit(TrackingEvents.LOCATION_BROADCAST, payload);

    // TODO: También emitir a room de zona si conocemos la zona de la unidad
  }

  /**
   * Agregar ubicación a cola de batch
   */
  private addToBatchQueue(payload: LocationBroadcastPayload) {
    const unidadId = payload.unidadId;

    if (!this.locationBatchQueue.has(unidadId)) {
      this.locationBatchQueue.set(unidadId, []);
    }

    const queue = this.locationBatchQueue.get(unidadId)!;
    queue.push(payload);

    // Si la cola está llena, procesar inmediatamente
    if (queue.length >= this.BATCH_SIZE) {
      this.processBatchQueue();
    }
  }

  /**
   * Procesar cola de batch y hacer broadcasting
   */
  private processBatchQueue() {
    if (this.locationBatchQueue.size === 0) {
      return;
    }

    let totalBroadcasted = 0;

    this.locationBatchQueue.forEach((locations, unidadId) => {
      // Tomar solo la última ubicación de cada unidad
      const lastLocation = locations[locations.length - 1];

      this.broadcastLocation(lastLocation);
      totalBroadcasted++;
    });

    if (totalBroadcasted > 0) {
      this.logger.debug(`📡 Batch broadcast: ${totalBroadcasted} ubicaciones`);
    }

    // Limpiar cola
    this.locationBatchQueue.clear();
  }

  /**
   * Iniciar timer para procesar batch periódicamente
   */
  private startBatchTimer() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      this.processBatchQueue();
    }, this.BATCH_INTERVAL_MS);

    this.logger.debug(
      `⏱️ Timer de batch iniciado: ${this.BATCH_INTERVAL_MS}ms | ` +
      `Tamaño: ${this.BATCH_SIZE}`
    );
  }

  /**
   * Notificar que GPS device está activo
   */
  public notifyGpsDeviceActive(unidadId: number, dispositivoId: string) {
    const payload: GpsDeviceStatusPayload = {
      unidadId,
      isActive: true,
      proveedor: GpsProviderType.GPS_DEVICE,
      dispositivoId,
    };

    this.server.to(`unidad:${unidadId}`).emit(TrackingEvents.GPS_DEVICE_ACTIVE, payload);
    this.logger.debug(`🛰️ GPS Device activo notificado: Unidad ${unidadId}`);
  }

  /**
   * Notificar que GPS device está inactivo
   */
  public notifyGpsDeviceInactive(unidadId: number) {
    const payload: GpsDeviceStatusPayload = {
      unidadId,
      isActive: false,
      proveedor: GpsProviderType.GPS_DEVICE,
    };

    this.server.to(`unidad:${unidadId}`).emit(TrackingEvents.GPS_DEVICE_INACTIVE, payload);
    this.logger.debug(`📵 GPS Device inactivo notificado: Unidad ${unidadId}`);
  }


  // ==========================================
  // ROOMS POR ROL
  // ==========================================

  private joinRoomsByRole(client: Socket, clientInfo: ClientInfo) {
    this.logger.debug(`📡 [Gateway] Uniendo a rooms...`);

    // Todos los usuarios van a 'all'
    client.join('all');
    this.logger.debug(`✅ [Gateway] Unido a room: all`);

    // Admins van a room 'admins'
    if (clientInfo.roles.includes('ADMIN')) {
      client.join('admins');
      this.logger.debug(`✅ [Gateway] Unido a room: admins`);
    }

    // Conductores van a room 'conductores'
    if (clientInfo.roles.includes('CONDUCTOR')) {
      client.join('conductores');
      this.logger.debug(`✅ [Gateway] Unido a room: conductores`);
    }

    // Si tiene unidad asignada, unir a room de esa unidad
    if (clientInfo.unidadAsignada) {
      const unidadRoom = `unidad:${clientInfo.unidadAsignada}`;
      client.join(unidadRoom);
      this.logger.debug(`✅ [Gateway] Unido a room: ${unidadRoom}`);
    }
  }

  /**
   * Verificar si cliente puede actualizar ubicación de unidad
   */
  private canUpdateLocation(clientInfo: ClientInfo, unidadId: number): boolean {
    // Admins pueden actualizar cualquier unidad
    if (clientInfo.roles.includes('ADMIN')) {
      return true;
    }

    // Conductores solo pueden actualizar su propia unidad
    if (clientInfo.roles.includes('CONDUCTOR')) {
      return clientInfo.unidadAsignada === unidadId;
    }

    return false;
  }

  /**
   * Verificar si cliente tiene permisos de tracking
   */
  private hasTrackingPermissions(clientInfo: ClientInfo): boolean {
    const allowedRoles = ['ADMIN', 'SUPERVISOR', 'CONTROLADOR','CONDUCTOR'];
    return clientInfo.roles.some(role => allowedRoles.includes(role));
  }

  /**
   * Verificar si cliente puede ver una unidad específica
   */
  private canViewUnit(clientInfo: ClientInfo, unidadId: number): boolean {
    // Admins y supervisores pueden ver todas
    const privilegedRoles = ['ADMIN', 'SUPERVISOR', 'CONTROLADOR'];
    if (clientInfo.roles.some(role => privilegedRoles.includes(role))) {
      return true;
    }

    // Conductores solo pueden ver su propia unidad
    if (clientInfo.roles.includes('CONDUCTOR')) {
      return clientInfo.unidadAsignada === unidadId;
    }

    return false;
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Obtener estadísticas de conexiones
   */
  public getConnectionStats() {
    const totalConnections = this.connectedClients.size;
    const conductores = Array.from(this.connectedClients.values())
      .filter(c => c.roles.includes('CONDUCTOR')).length;
    const admins = Array.from(this.connectedClients.values())
      .filter(c => c.roles.includes('ADMIN') || c.roles.includes('SUPERVISOR')).length;

    return {
      total: totalConnections,
      conductores,
      admins,
      otros: totalConnections - conductores - admins,
    };
  }

  /**
   * Desconectar cliente específico
   */
  public disconnectClient(socketId: string, reason?: string) {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
      this.logger.log(`🔌 Cliente ${socketId} desconectado: ${reason || 'Admin action'}`);
    }
  }
}
