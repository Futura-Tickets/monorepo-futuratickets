# 📋 Developer Reference Card

**Quick commands | Git workflow | Standards | Troubleshooting**

> Print this page and keep it at your desk! 📌

---

## ⚡ Essential Commands (Top 10)

```bash
# 1. Start everything
make dev-all

# 2. Check health
make health-check

# 3. Auto-fix linting
make lint-fix

# 4. Run tests
make test

# 5. Security audit
make security-audit

# 6. Install dependencies
make install

# 7. See all commands
make help

# 8. Clean everything
make clean

# 9. Build all workspaces
make build

# 10. Stop all services
./stop-all-dev.sh
```

---

## 🌿 Git Workflow Cheat Sheet

### Create Feature Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### Commit Message Format
```bash
git commit -m "type: short description"
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Add tests
- `chore:` - Maintenance (deps, config)
- `style:` - Code formatting
- `perf:` - Performance improvement

**Examples:**
```bash
✅ git commit -m "feat: add ticket resale feature"
✅ git commit -m "fix: correct payment validation logic"
✅ git commit -m "docs: update API documentation"
❌ git commit -m "updated stuff"
❌ git commit -m "WIP"
```

### Push & Create PR
```bash
git push origin feature/your-feature-name
gh pr create --title "feat: your title" --body "Description"
```

---

## 📦 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Marketplace Web | 3000 | http://localhost:3000 |
| Admin Dashboard | 3003 | http://localhost:3003 |
| Event Page | 3006 | http://localhost:3006 |
| Admin API | 3002 (old: 4101) | http://localhost:3002 |
| Marketplace API | 3004 (old: 4102) | http://localhost:3004 |
| Access API | 3005 (old: 4103) | http://localhost:3005 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | localhost:6379 |

---

## 🔥 Common Issues & Fast Fixes

### Port already in use
```bash
# Find what's using the port
lsof -i :3002

# Kill process
lsof -ti:3002 | xargs kill -9
```

### Linting errors
```bash
# Auto-fix
make lint-fix

# If still failing, check manually
npm run lint
```

### Tests failing
```bash
# Run specific workspace
cd futura-tickets-admin-api
npm run test

# With coverage
npm run test:cov
```

### Module not found / Dependency issues
```bash
# Clean reinstall
make clean && make install

# Or manually
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### MongoDB connection failed
```bash
# Check if running
docker ps | grep mongo

# Restart
docker compose -f docker-compose.infra.yml restart mongodb
```

### Git hooks blocking commit
```bash
# Fix the issue first, then commit

# Emergency bypass (use sparingly!)
git commit --no-verify -m "message"
```

---

## 📏 Code Standards Quick Reference

### TypeScript
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

const user: User = { id: '1', name: 'John' };

// ❌ Bad
const user: any = { id: '1', name: 'John' };
```

### NestJS Controllers
```typescript
// ✅ Good
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }
}

// ❌ Bad
@Controller('events')
export class EventController {
  @Get()
  findAll() {
    // No return type
    return this.eventService.findAll();
  }
}
```

### Next.js Components
```typescript
// ✅ Server Component (default)
export default function Page() {
  return <div>Content</div>;
}

// ✅ Client Component (only when needed)
'use client';
import { useState } from 'react';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 🔒 Security Checklist

```bash
# Before committing
[ ] No console.log statements
[ ] No hardcoded secrets/API keys
[ ] No .env files staged
[ ] Linting passes: make lint
[ ] Tests pass: make test
[ ] No large files (>5MB)
```

**Environment variables:**
```typescript
// ✅ Good
const apiKey = process.env.STRIPE_SECRET_KEY;

// ❌ Bad
const apiKey = "sk_live_abc123...";
```

---

## 🧪 Testing Quick Guide

```bash
# All tests
make test

# With coverage
make test-coverage

# Watch mode
npm run test:watch

# Specific file
npm run test -- event.service.spec.ts
```

**Test structure:**
```typescript
describe('EventService', () => {
  it('should create event', async () => {
    const event = await service.create(dto);
    expect(event).toBeDefined();
    expect(event.name).toBe(dto.name);
  });
});
```

---

## 📚 Documentation Quick Links

| Doc | Purpose |
|-----|---------|
| [QUICK_START.md](./QUICK_START.md) | Start services in 5 min |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Full contribution guide |
| [SECURITY.md](./SECURITY.md) | Security & vulnerabilities |
| [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) | System architecture |
| `make help` | All available commands |

---

## 🎯 Daily Workflow

```bash
# Morning
git checkout dev
git pull origin dev
git checkout -b feature/my-feature
make dev-all
make health-check

# Development
# ... code ...
make lint-fix
make test

# Commit
git add .
git commit -m "feat: implement feature"

# Before PR
make lint
make test
make security-audit

# Create PR
git push origin feature/my-feature
gh pr create
```

---

## 💡 Pro Tips

1. **Use git hooks:** `cp .git-hooks/pre-commit.template .git/hooks/pre-commit`
2. **Alias frequently used commands:**
   ```bash
   alias dev="make dev-all"
   alias check="make health-check"
   alias fix="make lint-fix"
   ```
3. **Keep Terminal 1 for infrastructure logs**
4. **Small commits = faster reviews**
5. **Run `make health-check` after every service start**

---

## 🚨 Emergency Commands

```bash
# Kill all node processes
killall node

# Hard reset (DANGER: loses uncommitted work)
git reset --hard HEAD && git clean -fd

# Force clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check what's running
lsof -i :3000-3006
```

---

## 📞 Need More Info?

- **Detailed setup:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Service start issues:** [QUICK_START.md](./QUICK_START.md)
- **All commands:** `make help`
- **Security issues:** [SECURITY.md](./SECURITY.md)

---

**Node:** 22.17.0 | **Branch:** dev | **Package Manager:** npm + --legacy-peer-deps

**Last updated:** 2025-10-17 | **Version:** 1.0.0

---

**📌 Keep this reference card handy for quick lookups during development!**
