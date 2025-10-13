# Contributing to FuturaTickets

¡Gracias por tu interés en contribuir a FuturaTickets! 🎉

Este documento proporciona pautas para contribuir al proyecto.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Proceso de Pull Request](#proceso-de-pull-request)
4. [Estándares de Código](#estándares-de-código)
5. [Convenciones de Commits](#convenciones-de-commits)
6. [Estructura de Branches](#estructura-de-branches)
7. [Testing](#testing)
8. [Documentación](#documentación)

---

## 📜 Código de Conducta

### Nuestro Compromiso

En el interés de fomentar un ambiente abierto y acogedor, nosotros como contribuidores y mantenedores nos comprometemos a hacer de la participación en nuestro proyecto y nuestra comunidad una experiencia libre de acoso para todos.

### Nuestros Estándares

**Comportamiento aceptable:**
- ✅ Usar lenguaje acogedor e inclusivo
- ✅ Ser respetuoso con diferentes puntos de vista
- ✅ Aceptar críticas constructivas
- ✅ Enfocarse en lo que es mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

**Comportamiento inaceptable:**
- ❌ Uso de lenguaje o imágenes sexualizadas
- ❌ Comentarios insultantes o despectivos (trolling)
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin permiso
- ❌ Otras conductas no éticas o no profesionales

---

## 🤝 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor abre un issue en GitHub con:

- **Descripción clara** del problema
- **Pasos para reproducir** el bug
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** (si aplica)
- **Versión** de Node, navegador, OS
- **Logs de error** relevantes

**Template de Bug Report:**

```markdown
## Descripción del Bug
[Descripción clara y concisa del bug]

## Pasos para Reproducir
1. Ir a '...'
2. Hacer click en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado
[Qué esperabas que pasara]

## Screenshots
[Si aplica, agrega screenshots]

## Entorno
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 120]
- Node: [e.g. 20.10.0]
- Repositorio: [e.g. futura-market-place-v2]

## Información Adicional
[Cualquier otra información relevante]
```

### Solicitar Features

Para solicitar una nueva funcionalidad:

- **Abre un issue** con el label `enhancement`
- **Describe el problema** que la feature resolvería
- **Propón una solución** (opcional)
- **Alternativas consideradas** (opcional)

### Contribuir con Código

1. **Fork** el repositorio
2. **Clona** tu fork localmente
3. **Crea un branch** para tu feature/fix
4. **Implementa** tus cambios
5. **Escribe tests** (si aplica)
6. **Commit** usando convenciones
7. **Push** a tu fork
8. **Abre un Pull Request**

---

## 🔀 Proceso de Pull Request

### Antes de Crear el PR

- [ ] Tu código sigue los estándares del proyecto
- [ ] Has ejecutado el linter (`npm run lint`)
- [ ] Has agregado tests (si aplica)
- [ ] Todos los tests pasan (`npm test`)
- [ ] Has actualizado la documentación (si aplica)
- [ ] Tu branch está actualizado con `develop`

### Crear el Pull Request

1. **Título descriptivo** siguiendo Conventional Commits:
   ```
   feat(marketplace): add filter by date
   fix(admin): resolve crash on event creation
   docs: update API documentation
   ```

2. **Descripción completa:**
   ```markdown
   ## Descripción
   [Descripción de los cambios]

   ## Tipo de cambio
   - [ ] Bug fix (cambio que resuelve un issue)
   - [ ] Nueva feature (cambio que agrega funcionalidad)
   - [ ] Breaking change (fix o feature que rompe compatibilidad)
   - [ ] Documentación

   ## ¿Cómo se ha testeado?
   [Describe los tests realizados]

   ## Checklist
   - [ ] Mi código sigue el style guide
   - [ ] He realizado self-review
   - [ ] He comentado código complejo
   - [ ] He actualizado la documentación
   - [ ] Mis cambios no generan warnings
   - [ ] He agregado tests
   - [ ] Tests nuevos y existentes pasan
   ```

3. **Asigna reviewers** apropiados
4. **Link al issue** relacionado (si existe)
5. **Agrega labels** relevantes

### Durante la Review

- Responde a los comentarios de manera constructiva
- Realiza los cambios solicitados
- Marca conversaciones como resueltas cuando apliques fixes
- Mantén el PR actualizado con `develop`

### Merge

Los PRs serán mergeados por los maintainers cuando:
- ✅ Tengan al menos 1 aprobación
- ✅ Todos los checks de CI pasen
- ✅ No haya conflictos con base branch
- ✅ Conversaciones estén resueltas

---

## 💻 Estándares de Código

### TypeScript

```typescript
// ✅ BUENO
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): Promise<User | null> {
  return userService.findById(id);
}

// ❌ MALO
function getUser(id) {  // Sin tipos
  return userService.findById(id);
}
```

### Naming Conventions

```typescript
// Variables y funciones: camelCase
const userName = 'John';
function calculateTotal() {}

// Clases e Interfaces: PascalCase
class UserService {}
interface UserDto {}

// Constantes: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// Archivos: kebab-case
// user-service.ts
// create-event.dto.ts
```

### Estructura de Archivos

```
src/
├── modules/
│   ├── events/
│   │   ├── controllers/
│   │   │   └── events.controller.ts
│   │   ├── services/
│   │   │   └── events.service.ts
│   │   ├── dto/
│   │   │   ├── create-event.dto.ts
│   │   │   └── update-event.dto.ts
│   │   ├── interfaces/
│   │   │   └── event.interface.ts
│   │   ├── schemas/
│   │   │   └── event.schema.ts
│   │   └── events.module.ts
│   └── ...
├── shared/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── utils/
└── main.ts
```

### ESLint Rules

El proyecto usa ESLint con las siguientes reglas principales:

```javascript
{
  "extends": [
    "next/core-web-vitals", // Para Next.js
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

### Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 📝 Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial limpio y generar changelogs automáticos.

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add Google OAuth login` |
| `fix` | Corrección de bug | `fix(checkout): resolve Stripe payment error` |
| `docs` | Cambios en documentación | `docs: update API endpoints in README` |
| `style` | Formateo, punto y coma, etc. | `style: format code with Prettier` |
| `refactor` | Refactorización | `refactor(events): extract validation logic` |
| `test` | Agregar o modificar tests | `test(auth): add unit tests for login` |
| `chore` | Tareas de mantenimiento | `chore: update dependencies` |
| `perf` | Mejoras de performance | `perf(api): optimize database queries` |
| `ci` | Cambios en CI/CD | `ci: add GitHub Actions workflow` |
| `build` | Cambios en build system | `build: update webpack config` |
| `revert` | Revertir commit anterior | `revert: revert feat(auth)` |

### Scopes

Scopes comunes por repositorio:

**Frontend:**
- `ui`, `auth`, `cart`, `checkout`, `events`, `profile`, `admin`, `dashboard`

**Backend:**
- `api`, `auth`, `events`, `sales`, `orders`, `payments`, `email`, `websocket`

**Blockchain:**
- `contracts`, `factory`, `nft`, `marketplace`, `deploy`

### Ejemplos

```bash
# Feature
git commit -m "feat(marketplace): add event filtering by category"

# Bug fix
git commit -m "fix(admin): resolve crash when creating event without image"

# Documentación
git commit -m "docs: add deployment instructions"

# Refactoring
git commit -m "refactor(api): split large service file into modules"

# Breaking change
git commit -m "feat(api)!: change authentication to use JWT

BREAKING CHANGE: API now requires JWT tokens in Authorization header"
```

---

## 🌿 Estructura de Branches

### Branch Principal

- **`main`** - Código en producción (protected)

### Branches de Desarrollo

- **`develop`** - Branch de integración (default para PRs)

### Feature Branches

```
feature/<ticket-id>-<short-description>

Ejemplos:
feature/FT-123-add-event-filters
feature/FT-456-stripe-integration
```

### Bugfix Branches

```
fix/<ticket-id>-<short-description>

Ejemplos:
fix/FT-789-checkout-crash
fix/FT-101-email-not-sending
```

### Hotfix Branches

```
hotfix/<ticket-id>-<short-description>

Ejemplos:
hotfix/FT-999-critical-security-fix
```

### Release Branches

```
release/v<version>

Ejemplos:
release/v1.0.0
release/v1.1.0
```

### Flujo de Trabajo

```
main (producción)
  │
  ├─── release/v1.1.0
  │       │
  │       ├─── develop
  │       │       │
  │       │       ├─── feature/FT-123-add-filters
  │       │       ├─── feature/FT-456-stripe
  │       │       └─── fix/FT-789-bug
  │       │
  │       └─── (merge release → main)
  │
  └─── hotfix/FT-999-critical (desde main)
          └─── (merge hotfix → main + develop)
```

---

## 🧪 Testing

### Test Coverage Objetivo

- **Mínimo:** 70%
- **Objetivo:** 80%+
- **Crítico:** 100% en funciones de pago, autenticación, blockchain

### Tipos de Tests

#### Unit Tests

```typescript
// events.service.spec.ts
describe('EventsService', () => {
  let service: EventsService;

  beforeEach(() => {
    // Setup
  });

  it('should create an event', async () => {
    const createEventDto = { name: 'Test Event', ... };
    const result = await service.create(createEventDto);

    expect(result).toBeDefined();
    expect(result.name).toBe('Test Event');
  });

  it('should throw error if event name is taken', async () => {
    await expect(service.create({ name: 'Existing' }))
      .rejects.toThrow('Event name already exists');
  });
});
```

#### Integration Tests

```typescript
// events.controller.e2e-spec.ts
describe('EventsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Bootstrap app
  });

  it('/events (POST)', () => {
    return request(app.getHttpServer())
      .post('/events')
      .send(createEventDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test Event');
      });
  });
});
```

#### E2E Tests (Frontend)

```typescript
// checkout.spec.ts (Playwright)
test('complete purchase flow', async ({ page }) => {
  await page.goto('/events/123');
  await page.click('[data-testid="buy-ticket"]');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[data-testid="checkout"]');

  // Stripe payment
  const stripeFrame = page.frameLocator('iframe');
  await stripeFrame.fill('[name="cardnumber"]', '4242424242424242');

  await page.click('[data-testid="pay"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

### Ejecutar Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 📚 Documentación

### Code Documentation

Usa JSDoc para funciones y clases complejas:

```typescript
/**
 * Valida un ticket y registra el check-in
 * @param saleId - ID del ticket a validar
 * @param promoterId - ID del promotor que valida
 * @returns Resultado de la validación (GRANTED o DENIED)
 * @throws {NotFoundException} Si el ticket no existe
 * @throws {BadRequestException} Si el ticket ya fue usado
 */
async validateTicket(saleId: string, promoterId: string): Promise<ValidationResult> {
  // ...
}
```

### API Documentation

Usa Swagger decorators en NestJS:

```typescript
@ApiTags('events')
@Controller('events')
export class EventsController {
  @Post()
  @ApiOperation({ summary: 'Crear nuevo evento' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBearerAuth()
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }
}
```

### README por Repositorio

Cada repositorio debe tener su propio README.md con:

```markdown
# [Nombre del Repositorio]

## Descripción
[Qué hace este servicio]

## Tech Stack
- [Tecnologías principales]

## Instalación
```bash
npm install
```

## Configuración
[Variables de entorno requeridas]

## Desarrollo
```bash
npm run dev
```

## Testing
```bash
npm test
```

## Deployment
[Instrucciones de deploy]

## API Endpoints
[Lista de endpoints principales]
```

---

## 🔐 Seguridad

### Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, **NO abras un issue público**. En su lugar:

1. Envía un email a: **security@futuratickets.com**
2. Incluye:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de fix (opcional)

### Buenas Prácticas

- ❌ **NUNCA** commitear secrets (API keys, passwords, private keys)
- ✅ Usar variables de entorno para configuración sensible
- ✅ Revisar dependencias con `npm audit`
- ✅ Mantener dependencias actualizadas
- ✅ Validar inputs del usuario
- ✅ Sanitizar datos antes de guardar en BD

---

## ❓ Preguntas

Si tienes preguntas sobre cómo contribuir:

- 📖 Lee la [documentación completa](./ARCHITECTURE_OVERVIEW.md)
- 💬 Abre un issue con el label `question`
- 📧 Contacta al equipo: support@futuratickets.com

---

## 🙏 Agradecimientos

¡Gracias por contribuir a FuturaTickets! Cada contribución, sin importar su tamaño, es valiosa y apreciada.

---

**Última actualización:** 2025-10-13
