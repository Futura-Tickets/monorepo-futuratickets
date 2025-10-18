# Architectural Decision Records (ADR)

This directory contains records of architectural decisions made for the FuturaTickets Admin API.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./001-nestjs-framework-choice.md) | Choice of NestJS as Backend Framework | Accepted | 2024-01 |
| [ADR-002](./002-mongodb-database-choice.md) | MongoDB as Primary Database | Accepted | 2024-01 |
| [ADR-003](./003-jwt-authentication.md) | JWT for Authentication | Accepted | 2024-02 |
| [ADR-004](./004-stripe-payment-integration.md) | Stripe for Payment Processing | Accepted | 2024-02 |
| [ADR-005](./005-google-cloud-storage.md) | Migration to Google Cloud Storage | Accepted | 2024-10 |
| [ADR-006](./006-winston-logging.md) | Winston for Structured Logging | Accepted | 2024-10 |
| [ADR-007](./007-sentry-error-tracking.md) | Sentry for Error Tracking | Accepted | 2024-10 |
| [ADR-008](./008-github-actions-cicd.md) | GitHub Actions for CI/CD | Accepted | 2024-10 |

## Template

Use this template for new ADRs:

```markdown
# ADR-XXX: [Title]

**Status**: [Proposed | Accepted | Deprecated | Superseded]

**Date**: YYYY-MM-DD

**Deciders**: [List of decision makers]

## Context

[Describe the context and problem statement]

## Decision

[Describe the architectural decision]

## Consequences

### Positive

- [List positive consequences]

### Negative

- [List negative consequences]

## Alternatives Considered

### Alternative 1: [Name]

- **Pros**: [List pros]
- **Cons**: [List cons]
- **Rejected because**: [Reason]

## References

- [Links to relevant documentation, discussions, or research]
```
