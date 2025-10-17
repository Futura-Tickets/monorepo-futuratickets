# Contributing to FuturaTickets

## Quick Start for New Developers

1. **Setup environment**
   ```bash
   ./scripts/utilities/setup-dev-environment.sh
   ```

2. **Configure .env files**
   - Copy `.env.example` to `.env` in each service
   - Fill in required values (ask team lead for credentials)

3. **Start all services**
   ```bash
   ./start-all.sh
   ```

4. **Verify everything works**
   ```bash
   ./scripts/utilities/smoke-tests.sh
   ```

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `dev`: Development branch (default)
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Making Changes

1. Create branch from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   ```

2. Make your changes
3. Test locally:
   ```bash
   npm test
   npm run build
   ```

4. Commit (pre-commit hooks will run):
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. Push and create PR:
   ```bash
   git push origin feature/my-feature
   ```

### Commit Message Convention

We use Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, missing semicolons, etc
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Updating build tasks, configs, etc

Example:
```
feat(marketplace): add coupon validation

- Implement coupon code validation
- Add error handling for expired coupons
- Update tests
```

## Code Quality

### Pre-commit Checks

Automatic checks run before each commit:
- ✅ No secrets (API keys, passwords)
- ✅ No .env files
- ✅ No files > 10MB
- ✅ TypeScript syntax valid

### Manual Checks

Before submitting PR:
```bash
# Run linter
npm run lint

# Run tests
npm test

# Check types
npx tsc --noEmit

# Build
npm run build
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Smoke Tests
```bash
./scripts/utilities/smoke-tests.sh
```

## Utilities

### Health Monitoring
```bash
# Continuous monitoring
./scripts/utilities/continuous-health-check.sh 30

# One-time check
./scripts/utilities/smoke-tests.sh
```

### Environment Management
```bash
# Verify .env files
./scripts/utilities/check-env-vars.sh

# Backup .env files (with encryption)
./scripts/utilities/backup-env-files.sh mypassword
```

### Process Management
```bash
# Clean duplicate processes
./scripts/utilities/cleanup-processes.sh
```

## CI/CD

### GitHub Actions

Runs automatically on push/PR:
- Backend builds
- Security scans
- Docker builds

See `.github/workflows/ci.yml`

### Local CI Simulation
```bash
# Install Act: https://github.com/nektos/act
act push
```

## Architecture

- **Backend APIs**: NestJS + MongoDB + Stripe
- **Frontends**: Next.js 15 + React 19
- **Blockchain**: Hardhat/Ganache + ethers.js

See `/docs/architecture/` for details.

## Need Help?

- Check `/docs/troubleshooting/`
- Ask in team Slack
- Open GitHub Discussion

## Security

### Reporting Vulnerabilities

DO NOT open public issues for security vulnerabilities.
Email: security@futuratickets.com

### Secrets Management

- Never commit `.env` files
- Never commit API keys or passwords
- Use `.env.example` for templates
- Rotate credentials if exposed

---

**Happy coding! 🎫**
