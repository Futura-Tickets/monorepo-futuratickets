# ADR-008: GitHub Actions for CI/CD

**Status**: Accepted

**Date**: 2024-10-18

**Deciders**: Tech Lead, DevOps Team

## Context

The FuturaTickets Admin API requires automated testing, building, and deployment to ensure:

1. **Code quality** - Automated linting, formatting, and tests on every PR
2. **Fast feedback** - Developers know within minutes if their changes break tests
3. **Consistent builds** - Same build process in CI as locally
4. **Secure deployments** - No manual deployment steps that could introduce errors
5. **Rollback capability** - Easy to revert bad deployments

Without CI/CD:
- Manual testing is error-prone and slow
- Bugs slip into production
- Deployment requires manual steps (risky)
- No audit trail of what was deployed when
- Team can't move fast with confidence

## Decision

We will use **GitHub Actions** for continuous integration and deployment.

### Implementation Details

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Triggered on: Push to `main`/`dev`/`staging`, pull requests
   - Jobs:
     - **Lint**: ESLint + Prettier format check
     - **Test**: Unit tests with MongoDB + Redis services
     - **Build**: TypeScript compilation
     - **Security**: npm audit + Snyk scan
   - Coverage uploaded to Codecov
   - Artifacts: Build output (`dist/`)

2. **CD Pipeline** (`.github/workflows/cd.yml`)
   - Triggered on: Push to `main`/`staging`, manual workflow dispatch
   - Jobs:
     - **Build & Push**: Docker image to GitHub Container Registry
     - **Deploy Staging**: Auto-deploy on push to `staging` branch
     - **Deploy Production**: Auto-deploy on push to `main` (with approval)
   - Sentry release notifications
   - SBOM generation for security compliance

3. **PR Checks** (`.github/workflows/pr-checks.yml`)
   - Commit message validation (Conventional Commits)
   - PR size labeling (XS/S/M/L/XL)
   - Test coverage report as PR comment
   - Dependency review (security vulnerabilities)

4. **Branch Strategy**
   ```
   main (production)
     ↑
   staging
     ↑
   dev
     ↑
   feature/* branches
   ```

5. **Environment Secrets**
   - `SENTRY_AUTH_TOKEN` - Sentry deployment tracking
   - `SNYK_TOKEN` - Security scanning
   - `GITHUB_TOKEN` - Automatic (provided by GitHub)

## Consequences

### Positive

- ✅ **Fast feedback** - CI runs in ~5 minutes
- ✅ **Free for public repos** - GitHub Actions included
- ✅ **2,000 free minutes/month** - Sufficient for our workload
- ✅ **Native GitHub integration** - No external service needed
- ✅ **Matrix builds** - Test multiple Node versions if needed
- ✅ **Reusable workflows** - Share common steps across workflows
- ✅ **Marketplace actions** - 10,000+ pre-built actions
- ✅ **Secrets management** - Encrypted environment variables
- ✅ **Audit logs** - Full history of deployments

### Negative

- ⚠️ **Vendor lock-in** - Tied to GitHub (mitigated by YAML portability)
- ⚠️ **Minute limits** - 2k free minutes/month (need to monitor)
- ⚠️ **Learning curve** - YAML syntax can be tricky
- ⚠️ **Limited Windows support** - Primarily Linux-focused
- ⚠️ **No built-in rollback** - Must implement manually

### Mitigations

- Use caching to reduce build times
- Monitor minute usage monthly
- Document workflows in README
- Implement manual rollback script
- Use workflow templates for consistency

## Alternatives Considered

### Alternative 1: GitLab CI/CD

- **Pros**:
  - All-in-one DevOps platform
  - Built-in container registry
  - Better pipeline visualization
  - More generous free tier (400 minutes/month × users)

- **Cons**:
  - Would require migrating from GitHub
  - Team already familiar with GitHub
  - Additional service to maintain

- **Rejected because**: Team already uses GitHub, no reason to switch

### Alternative 2: CircleCI

- **Pros**:
  - Faster builds (better caching)
  - More generous free tier (2,500 credits/week)
  - Better pipeline debugging
  - SSH into failed builds

- **Cons**:
  - External service (separate login)
  - Configuration in separate YAML file
  - Need to set up GitHub integration

- **Rejected because**: GitHub Actions is "good enough" and integrated

### Alternative 3: Jenkins (Self-hosted)

- **Pros**:
  - Full control
  - Unlimited builds
  - Extensive plugin ecosystem
  - No vendor lock-in

- **Cons**:
  - Requires server to host
  - Team must maintain Jenkins
  - Complex setup and configuration
  - Security vulnerabilities (must patch regularly)
  - Significant operational overhead

- **Rejected because**: Too much operational overhead for our team size

### Alternative 4: Travis CI

- **Pros**:
  - Simple `.travis.yml` configuration
  - Good for open source

- **Cons**:
  - Free tier eliminated in 2020
  - Company acquired (uncertain future)
  - Less feature-rich than GitHub Actions

- **Rejected because**: No longer free, GitHub Actions is better

## Implementation Plan

### Phase 1: CI Only (Completed)
- ✅ Set up lint, test, build jobs
- ✅ Configure MongoDB + Redis services
- ✅ Add Codecov integration
- ✅ Add PR checks

### Phase 2: CD Staging (Next)
- ⏳ Build Docker images
- ⏳ Push to GitHub Container Registry
- ⏳ Deploy to staging environment
- ⏳ Run smoke tests

### Phase 3: CD Production (Future)
- ⏳ Add manual approval gate
- ⏳ Deploy to production
- ⏳ Sentry release tracking
- ⏳ Automated rollback on failure

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Pricing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Monitoring

- **CI/CD Dashboard**: GitHub Actions tab in repository
- **Minute usage**: Settings → Billing → Actions minutes
- **Success rate**: Track via GitHub Actions API
- **Build time trends**: Monitor for slowdowns

## Future Considerations

- **If minute usage exceeds 2k/month**: Optimize caching or upgrade to GitHub Team ($4/user/month)
- **If builds become slow**: Consider self-hosted runners
- **If we need advanced features**: Evaluate CircleCI or GitLab CI
- **If we outgrow GitHub Actions**: Migration path to Jenkins or custom solution
