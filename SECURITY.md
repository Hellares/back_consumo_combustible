# 🔒 Security Guidelines

## ⚠️ CRITICAL: Never Commit Secrets

### Files to NEVER commit:
- `.env` - Contains all sensitive credentials
- `*.pem`, `*.key` - Private keys
- `config/*.production.json` - Production configs with secrets

### Already in .gitignore:
```
.env
.env.local
.env.production.local
```

## 🔐 Environment Variables Security

### Current Issues to Fix:

1. **docker-compose.yml contains hardcoded secrets** 🔴
   - Move all credentials to `.env` file
   - Use `env_file` directive in docker-compose

2. **JWT Secret** 🔴
   - Current: `"tu-jwt-secret-muy-seguro-aqui-cambiar-en-produccion"`
   - Generate strong secret: `openssl rand -base64 64`

3. **Database Credentials** 🔴
   - Never expose in docker-compose.yml
   - Use environment variables

### Recommended docker-compose.yml structure:

```yaml
version: '3.8'

services:
  combustible-api:
    build:
      context: .
      dockerfile: Dockerfile
    image: combustible-api:1.0.0
    container_name: combustible-api
    restart: always
    env_file:
      - .env.production  # Create this file with real values
    ports:
      - "${APP_PORT}:${APP_PORT}"
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - elastika-network

networks:
  elastika-network:
    external: true
```

## 🛡️ Security Checklist

### Authentication & Authorization
- [x] JWT implementation
- [x] Password hashing (bcrypt)
- [x] Role-based access control
- [ ] Refresh token mechanism (recommended)
- [ ] Account lockout after failed attempts
- [ ] Password complexity requirements

### API Security
- [x] Helmet.js configured
- [x] CORS properly set
- [x] Input validation (class-validator)
- [ ] Rate limiting (implement with @nestjs/throttler)
- [ ] Request size limits
- [ ] API versioning

### Database Security
- [x] Prisma ORM (SQL injection protection)
- [x] Parameterized queries
- [ ] Database connection pooling limits
- [ ] Regular backups
- [ ] Encrypted connections (SSL)

### File Upload Security
- [x] Cloudinary integration
- [ ] File type validation
- [ ] File size limits
- [ ] Virus scanning (recommended)
- [ ] Secure file naming

### Logging & Monitoring
- [ ] Centralized logging
- [ ] Security event logging
- [ ] Error tracking (Sentry recommended)
- [ ] Performance monitoring
- [ ] Audit trails

## 🔧 Recommended Implementations

### 1. Rate Limiting

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
```

### 2. Request Validation

Already implemented with `class-validator`, ensure all DTOs have proper validation:

```typescript
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
```

### 3. Secure Headers

Already implemented with Helmet, but consider additional CSP:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 🚨 Incident Response

### If Credentials are Compromised:

1. **Immediately rotate all secrets**
   - Database passwords
   - JWT secrets
   - API keys (Cloudinary, etc.)

2. **Revoke all active sessions**
   - Invalidate JWT tokens
   - Force re-authentication

3. **Audit access logs**
   - Check for unauthorized access
   - Review recent activities

4. **Update .gitignore**
   - Ensure sensitive files are excluded

5. **Clean git history** (if secrets were committed)
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 📋 Security Audit Checklist

### Before Production Deployment:

- [ ] All secrets moved to environment variables
- [ ] Strong JWT secret generated
- [ ] Database uses strong password
- [ ] HTTPS/TLS enabled
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (no sensitive data logged)
- [ ] Dependencies updated (npm audit)
- [ ] Security headers verified
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured

## 🔍 Regular Security Maintenance

### Weekly:
- Review access logs
- Check for failed authentication attempts
- Monitor API usage patterns

### Monthly:
- Update dependencies: `npm audit fix`
- Review and rotate API keys
- Security scan: `npm audit`
- Review user permissions

### Quarterly:
- Full security audit
- Penetration testing
- Review and update security policies
- Rotate all credentials

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

---

**Last Updated**: 2025-01-06  
**Review Frequency**: Quarterly