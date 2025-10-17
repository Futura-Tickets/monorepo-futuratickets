# Contributing to FuturaTickets

¡Gracias por tu interés en contribuir! Esta guía te ayudará a empezar rápidamente.

---

## 📋 Tabla de Contenidos

1. [Quick Start](#-quick-start)
2. [Development Workflow](#-development-workflow)
3. [Code Standards](#-code-standards)
4. [Git Conventions](#-git-conventions)
5. [Pull Request Process](#-pull-request-process)
6. [Testing](#-testing)
7. [Security](#-security)

---

## 🚀 Quick Start

### Prerrequisitos

- **Node.js 22.17.0** (usa nvm: `nvm use`)
- **npm 10+**
- **Git**
- **MongoDB** (local o Atlas)
- **Redis** (opcional, para Bull queues)

### Setup Inicial (Menos de 5 minutos)

```bash
# 1. Clonar y entrar al proyecto
git clone https://github.com/futuratickets/monorepo-futuratickets.git
cd monorepo-futuratickets

# 2. Usar la versión correcta de Node
nvm use  # Lee .nvmrc automáticamente

# 3. Instalar dependencias
make install  # Equivalente a: npm install --legacy-peer-deps

# 4. (Opcional) Activar git hooks
cp .git-hooks/pre-commit.template .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 5. Copiar archivos de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 6. Iniciar desarrollo
make dev-all  # Inicia infra + backends + frontends

# 7. Verificar que todo funciona
make health-check
```

### Comandos Esenciales

```bash
make help          # Ver todos los comandos disponibles
make dev-all       # Iniciar todo (infra + backends + frontends)
make health-check  # Verificar estado de servicios
make test          # Ejecutar tests
make lint          # Ejecutar linting
make lint-fix      # Auto-corregir errores de linting
```

**Ver lista completa:** `make help`

---

## 💻 Development Workflow

### 1. Crear Feature Branch

```bash
# Desde main, crear nueva branch
git checkout main
git pull origin main
git checkout -b feature/nombre-descriptivo

# O usar worktrees para desarrollo paralelo
./scripts/worktree-create.sh feature/nombre-descriptivo
```

### 2. Desarrollar Localmente

```bash
# Iniciar servicios necesarios
make dev-backends  # Solo backend APIs
make dev-frontends # Solo frontend apps
make dev-all       # Todo

# Trabajar en workspace específico
make admin-api        # Solo Admin API
make marketplace-web  # Solo Marketplace Frontend
```

### 3. Verificar Calidad

```bash
# Linting (auto-fix cuando sea posible)
make lint-fix

# Tests
make test

# Verificar servicios
make health-check

# Verificar seguridad
make security-audit
```

### 4. Commit & Push

```bash
# Commits pequeños y descriptivos
git add .
git commit -m "feat: descripción clara del cambio"

# Push a tu branch
git push origin feature/nombre-descriptivo
```

**Nota:** Si activaste git hooks, se ejecutarán validaciones automáticas antes del commit.

### 5. Crear Pull Request

```bash
# Opción 1: Usar GitHub CLI
gh pr create --title "feat: título del PR" --body "Descripción detallada"

# Opción 2: Ir a GitHub y crear PR manualmente
```

---

## 📏 Code Standards

### TypeScript

**Linting automático:**
```bash
make lint-fix  # Auto-corrige errores
```

**Convenciones:**
- ✅ Usar `interface` para tipos públicos
- ✅ Usar `type` para uniones y utilidades
- ✅ Preferir `const` sobre `let`
- ✅ Usar optional chaining (`?.`) y nullish coalescing (`??`)
- ❌ No usar `any` (usar `unknown` si es necesario)
- ❌ No dejar `console.log` (git hooks lo detectan)

### NestJS (Backend)

**Versión:** NestJS 10 (estandarizado en todo el monorepo)

**Estructura:**
```typescript
// ✅ Usar decorators de NestJS
@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}
}

// ✅ DTOs con class-validator
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### Next.js (Frontend)

**App Router (Next.js 15):**
```typescript
// ✅ Server Components por defecto
export default function Page() {
  return <div>Content</div>
}

// ✅ Client Components solo cuando sea necesario
'use client'
export default function InteractiveComponent() {
  const [state, setState] = useState()
  // ...
}
```

### CSS/Styling

- **Admin Panel:** Ant Design
- **Marketplace:** Tailwind CSS + Radix UI
- Preferir componentes existentes antes de crear nuevos

---

## 🌿 Git Conventions

### Branch Naming

```bash
feature/nombre-descriptivo   # Nueva funcionalidad
fix/bug-description          # Corrección de bug
chore/maintenance-task       # Tareas de mantenimiento
docs/documentation-update    # Solo documentación
refactor/code-improvement    # Refactorización
test/add-tests               # Agregar tests
```

### Commit Messages

**Formato:** [Conventional Commits](https://www.conventionalcommits.org/)

```bash
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formateo (sin cambios de código)
- `refactor:` - Refactorización
- `test:` - Agregar o modificar tests
- `chore:` - Mantenimiento (deps, config, etc.)
- `perf:` - Mejoras de performance
- `ci:` - Cambios en CI/CD

**Ejemplos:**

```bash
# ✅ Buenos commits
feat: add ticket resale functionality
fix: correct payment validation logic
docs: update API endpoints in README
chore: update dependencies to fix vulnerabilities

# ❌ Malos commits
updated stuff
fix
WIP
asdf
```

**Scope (opcional):**
```bash
feat(admin-api): add new event endpoint
fix(marketplace): correct checkout flow
docs(security): update SECURITY.md
```

---

## 🔄 Pull Request Process

### Antes de Crear el PR

- [ ] Código cumple estándares (`make lint`)
- [ ] Tests pasan (`make test`)
- [ ] No hay secrets hardcodeados
- [ ] Documentación actualizada (si aplica)
- [ ] Branch actualizado con `main`

### Template del PR

```markdown
## Descripción
Describe el cambio de forma clara y concisa.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Código sigue estándares del proyecto
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] No hay console.log
- [ ] Probado localmente

## Screenshots (si aplica)
[Adjuntar capturas de pantalla]

## Issues Relacionados
Fixes #123
```

### Code Review

**Revisores buscarán:**
- ✅ Código limpio y legible
- ✅ Tests adecuados
- ✅ Sin lógica duplicada
- ✅ Manejo de errores
- ✅ Seguridad (sin secrets, validación de inputs)
- ✅ Performance (queries optimizadas, sin N+1)

### CI Checks

**Automáticos (GitHub Actions):**
- ✅ Linting pasa
- ✅ Tests pasan
- ✅ Build exitoso
- ✅ No vulnerabilidades críticas

### Merge Requirements

- ✅ Al menos 1 aprobación
- ✅ CI checks pasan
- ✅ Conflicts resueltos
- ✅ Branch actualizado con `main`

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
make test

# Tests con coverage
make test-coverage

# Tests de un workspace específico
cd futura-tickets-admin-api
npm run test

# Tests en watch mode
npm run test:watch
```

### Escribir Tests

**Unit Tests (Jest):**
```typescript
describe('EventService', () => {
  it('should create a new event', async () => {
    const event = await service.createEvent(createEventDto)
    expect(event).toBeDefined()
    expect(event.name).toBe(createEventDto.name)
  })
})
```

**Coverage Requirements:**
- Nuevas funcionalidades: **>80% coverage**
- Bug fixes: Agregar test que reproduzca el bug

---

## 🔒 Security

### Git Hooks

Si activaste pre-commit hooks, se validará automáticamente:
- ❌ No secrets hardcodeados
- ❌ No archivos > 5 MB
- ❌ No errores de linting
- ⚠️ Advertencia sobre `console.log`

**Bypass (solo emergencias):**
```bash
git commit --no-verify -m "mensaje"
```

### Secrets Management

**❌ NUNCA:**
```typescript
const apiKey = "sk_live_abc123..."  // ❌ Hardcoded
const password = "mypassword123"     // ❌ En código
```

**✅ SIEMPRE:**
```typescript
const apiKey = process.env.STRIPE_SECRET_KEY  // ✅ Desde .env
const dbUri = this.configService.get('MONGO_URI')  // ✅ ConfigService
```

### Vulnerabilities

- Revisar `SECURITY.md` antes de contribuir
- Reportar vulnerabilidades a: security@futuratickets.com
- No abrir issues públicos para security bugs

### Auditoría

```bash
# Revisar vulnerabilidades
make security-audit

# Aplicar fixes seguros
make security-fix

# Ver reporte completo
make security-report
```

---

## 📚 Recursos Adicionales

### Documentación

- **Arquitectura:** [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
- **Seguridad:** [SECURITY.md](./SECURITY.md)
- **Git Workflow:** [docs/GIT_BRANCHING_STRATEGY.md](./docs/GIT_BRANCHING_STRATEGY.md)
- **Makefile Commands:** `make help`
- **Git Hooks:** [.git-hooks/README.md](./.git-hooks/README.md)

### Scripts Útiles

| Script | Descripción |
|--------|-------------|
| `make dev-all` | Iniciar todo |
| `make health-check` | Verificar servicios |
| `make lint-fix` | Corregir linting |
| `make test` | Ejecutar tests |
| `make clean` | Limpiar node_modules |
| `make security-audit` | Auditar seguridad |

### Puertos por Defecto

| Servicio | Puerto |
|----------|--------|
| Admin API | 3002 |
| Marketplace API | 3004 |
| Access API | 3005 |
| Admin Dashboard | 3003 |
| Marketplace Frontend | 3000 |
| Event Page | 3006 |
| MongoDB | 27017 |
| Redis | 6379 |

---

## 🐛 Troubleshooting

### "make: command not found"

**Solución:**
```bash
# macOS
brew install make

# Ubuntu/Debian
sudo apt-get install build-essential

# Windows (WSL)
sudo apt-get install make
```

### "Permission denied" en git hooks

```bash
chmod +x .git/hooks/pre-commit
```

### "Port already in use"

```bash
make ports      # Ver qué está usando los puertos
lsof -ti:3002 | xargs kill -9  # Matar proceso en puerto específico
```

### Linting errors después de pull

```bash
make lint-fix  # Auto-corregir
```

---

## 💬 Comunicación

### Issues

- **Bug reports:** Usar template de issue
- **Feature requests:** Explicar el caso de uso
- **Questions:** Usar Discussions, no Issues

### Pull Requests

- **Draft PRs:** Marcar como draft si está WIP
- **Ready for review:** Pedir review a `@team`
- **Updates:** Responder comentarios en 24-48h

---

## 🎯 Checklist para Primera Contribución

- [ ] Fork del proyecto
- [ ] Node 22.17.0 instalado (`nvm use`)
- [ ] Dependencias instaladas (`make install`)
- [ ] Git hooks activados (opcional)
- [ ] `.env` configurado
- [ ] Servicios inician correctamente (`make dev-all`)
- [ ] Tests pasan (`make test`)
- [ ] Linting pasa (`make lint`)
- [ ] Health check OK (`make health-check`)
- [ ] Branch creada siguiendo convenciones
- [ ] Commit messages siguen Conventional Commits
- [ ] PR creado con template

---

## ❓ Preguntas Frecuentes

**Q: ¿Qué versión de Node uso?**
A: Node 22.17.0 (especificado en `.nvmrc`)

**Q: ¿Cómo pruebo cambios en producción?**
A: Nunca directamente. Usar staging environment.

**Q: ¿Puedo usar yarn/pnpm?**
A: No, solo npm (legacy-peer-deps configurado).

**Q: ¿Dónde están los logs?**
A: Cada servicio loguea a stdout/stderr. Ver con `make dev-all`.

**Q: ¿Cómo actualizo dependencias?**
A: Crear issue primero. Actualizar de a una, con tests.

---

## 📄 Licencia

Al contribuir, aceptas que tu código se licencie bajo MIT License.

---

## 🙏 Agradecimientos

¡Gracias por contribuir a FuturaTickets! Cada PR, bug report, o sugerencia hace mejor el proyecto.

---

**Última actualización:** 2025-10-17
**Versión:** 2.0.0
