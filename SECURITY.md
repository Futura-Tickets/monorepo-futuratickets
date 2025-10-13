# Security Policy

## 🔒 Reportar una Vulnerabilidad de Seguridad

La seguridad de FuturaTickets es nuestra máxima prioridad. Si descubres una vulnerabilidad de seguridad, agradecemos tu ayuda para divulgarla de manera responsable.

### ⚠️ NO abras un issue público

Por favor, **NO** reportes vulnerabilidades de seguridad a través de issues públicos de GitHub, PRs, o cualquier canal público.

### ✅ Proceso de Reporte Seguro

Para reportar una vulnerabilidad, envía un email a:

**📧 security@futuratickets.com**

### 📝 Información a Incluir

Por favor incluye la siguiente información en tu reporte:

1. **Tipo de vulnerabilidad** (e.g., SQL injection, XSS, CSRF, etc.)
2. **Ubicación** del código vulnerable
3. **Pasos para reproducir** el issue
4. **Impacto potencial** de la vulnerabilidad
5. **Proof of Concept** (si es posible)
6. **Sugerencias de fix** (opcional)
7. **Tu información de contacto** para seguimiento

### 🕐 Tiempo de Respuesta

- **Confirmación inicial:** Dentro de 48 horas
- **Evaluación detallada:** Dentro de 7 días
- **Fix y disclosure:** Dependiendo de la severidad

### 🏆 Reconocimiento

Si reportas una vulnerabilidad válida, con tu permiso, te incluiremos en nuestro **Security Hall of Fame**.

---

## 🛡️ Versiones Soportadas

Actualmente damos soporte de seguridad a las siguientes versiones:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Sí              |
| < 1.0   | ❌ No              |

---

## 🔐 Mejores Prácticas de Seguridad

### Para Desarrolladores

#### Autenticación y Autorización
- ✅ Usar JWT con expiración corta (1-7 días)
- ✅ Implementar refresh tokens
- ✅ Validar roles y permisos en cada endpoint
- ✅ Rate limiting en endpoints sensibles
- ❌ NUNCA almacenar tokens en localStorage (usar httpOnly cookies)

#### Manejo de Datos Sensibles
- ✅ Hashear passwords con bcrypt (min 10 rounds)
- ✅ Encriptar datos sensibles en BD
- ✅ Usar HTTPS en producción
- ✅ Configurar CORS con whitelist
- ❌ NUNCA logear passwords o tokens
- ❌ NUNCA commitear secrets en Git

#### Input Validation
- ✅ Validar TODOS los inputs del usuario
- ✅ Sanitizar datos antes de guardar en BD
- ✅ Usar DTOs con class-validator (NestJS)
- ✅ Escapar outputs para prevenir XSS
- ❌ NUNCA confiar en datos del cliente

#### Dependencias
- ✅ Ejecutar `npm audit` regularmente
- ✅ Mantener dependencias actualizadas
- ✅ Revisar CVEs de dependencias críticas
- ✅ Usar Dependabot o Renovate

### Para DevOps

#### Configuración de Servidor
- ✅ Firewall configurado correctamente
- ✅ Acceso SSH solo con keys (no passwords)
- ✅ Principio de mínimo privilegio
- ✅ Logs de seguridad habilitados
- ✅ Backups automáticos encriptados

#### Secrets Management
- ✅ Usar AWS Secrets Manager / Azure Key Vault
- ✅ Variables de entorno para configuración
- ✅ Rotar secrets regularmente
- ❌ NUNCA hardcodear secrets en código
- ❌ NUNCA commitear archivos .env

#### Monitoring
- ✅ Alertas de seguridad configuradas
- ✅ Logs centralizados (ELK, Datadog)
- ✅ Detección de anomalías
- ✅ Auditoría de accesos

---

## 🔍 Checklists de Seguridad

### Pre-Deployment Security Checklist

- [ ] Secrets removidos del código
- [ ] CORS configurado con whitelist
- [ ] Rate limiting implementado
- [ ] JWT tokens en httpOnly cookies
- [ ] HTTPS habilitado
- [ ] Security headers configurados (Helmet.js)
- [ ] SQL/NoSQL injection protegido
- [ ] XSS protegido
- [ ] CSRF protegido
- [ ] Dependencias auditadas (`npm audit`)
- [ ] Tests de seguridad pasando
- [ ] Logs de seguridad configurados

### OWASP Top 10 Compliance

- [ ] **A01:2021 – Broken Access Control**
  - Validación de roles y permisos en todas las rutas

- [ ] **A02:2021 – Cryptographic Failures**
  - HTTPS en producción
  - Passwords hasheados con bcrypt

- [ ] **A03:2021 – Injection**
  - Validación y sanitización de inputs
  - Queries parametrizadas (Mongoose)

- [ ] **A04:2021 – Insecure Design**
  - Threat modeling realizado
  - Security by design

- [ ] **A05:2021 – Security Misconfiguration**
  - CORS configurado
  - Security headers implementados
  - Default passwords cambiados

- [ ] **A06:2021 – Vulnerable Components**
  - Dependencias actualizadas
  - npm audit sin vulnerabilidades críticas

- [ ] **A07:2021 – Authentication Failures**
  - Multi-factor authentication (MFA) disponible
  - Rate limiting en login
  - Passwords robustos requeridos

- [ ] **A08:2021 – Software and Data Integrity**
  - CI/CD pipeline con checks de seguridad
  - Integridad de código verificada

- [ ] **A09:2021 – Security Logging Failures**
  - Logs de autenticación y autorización
  - Logs de errores sensibles no exponen datos

- [ ] **A10:2021 – Server-Side Request Forgery**
  - Validación de URLs
  - Whitelist de dominios permitidos

---

## 📚 Recursos de Seguridad

### Guías
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)

### Tools
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency auditing
- [Dependabot](https://github.com/dependabot) - Automated dependency updates
- [SonarQube](https://www.sonarqube.org/) - Code quality and security

---

## 🤝 Colaboración

Trabajamos con la comunidad de seguridad para mantener FuturaTickets seguro. Si tienes sugerencias para mejorar nuestra política de seguridad, contáctanos en:

**📧 security@futuratickets.com**

---

**Última actualización:** 2025-10-13
