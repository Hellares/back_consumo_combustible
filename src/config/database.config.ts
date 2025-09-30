// // config/database.config.ts
// export const databaseConfig = () => ({
//   database: {
//     url: process.env.DATABASE_URL,
//     maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 10,
//     ssl: process.env.NODE_ENV === 'production',
//   },
//   jwt: {
//     secret: process.env.JWT_SECRET,
//     expiresIn: process.env.JWT_EXPIRES_IN || '24h',
//   },
//   app: {
//     port: parseInt(process.env.APP_PORT, 10) || 3000,
//     corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
//   },
// });

// // En AppModule
